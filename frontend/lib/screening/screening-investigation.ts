// Screening-mode investigation reports for uncalibrated ward pairs.
//
// Anna Nagar vs Velachery has a stored calibrated run (mockData). Every other
// pair of demo wards gets a deterministically generated screening report
// derived from the ward profiles in lib/scoring/ward-profiles.ts. Screening
// reports are honest about what they are: mechanism certainty is HYPOTHESIS,
// validation status is INSUFFICIENT_DATA (no historical events ship for these
// pairs), the defensibility verdict is INSUFFICIENT_EVIDENCE, and every ward
// input keeps its calibrated/illustrative data_status label. The API is
// stateless, so the pair is encoded in the comparison/investigation IDs
// (comp-<uuidA>-<uuidB> / inv-<uuidA>-<uuidB>) and the report is rebuilt
// deterministically from the ward profiles on every read.

import mockData from "@/lib/mockData.json";
import {
  getWardProfile,
  DATASET_BUILT_AT,
  type WardProfile,
} from "@/lib/scoring/ward-profiles";
import { getTwinSimilarity } from "@/lib/scoring/twin-similarity";

export const SCREENING_AGENT_MODE = "screening";
export const SCREENING_VERDICT = "INSUFFICIENT_EVIDENCE";
export const SCREENING_DISCLOSURE =
  "Screening estimate generated from demo ward profiles; not a calibrated diagnostic run.";

const COMP_PREFIX = "comp-";
const INV_PREFIX = "inv-";
const UUID_LEN = 36;

export function screeningComparisonId(placeAId: string, placeBId: string): string {
  return `${COMP_PREFIX}${placeAId}-${placeBId}`;
}

export function screeningInvestigationId(comparisonId: string): string {
  return `${INV_PREFIX}${comparisonId.slice(COMP_PREFIX.length)}`;
}

function parsePairId(id: string, prefix: string): { a: string; b: string } | null {
  if (!id.startsWith(prefix)) return null;
  const rest = id.slice(prefix.length);
  if (rest.length !== UUID_LEN * 2 + 1 || rest[UUID_LEN] !== "-") return null;
  const a = rest.slice(0, UUID_LEN);
  const b = rest.slice(UUID_LEN + 1);
  if (a === b || !getWardProfile(a) || !getWardProfile(b)) return null;
  return { a, b };
}

export function parseScreeningComparisonId(id: string): { a: string; b: string } | null {
  return parsePairId(id, COMP_PREFIX);
}

export function parseScreeningInvestigationId(id: string): { a: string; b: string } | null {
  return parsePairId(id, INV_PREFIX);
}

export function isCalibratedPairIds(a: string, b: string): boolean {
  const ca = mockData.compRes.place_a_id;
  const cb = mockData.compRes.place_b_id;
  return (a === ca && b === cb) || (a === cb && b === ca);
}

function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}

interface Driver {
  mechanism_type: string;
  score: number;
  explanation: string;
  signal_values: Record<string, number>;
}

function deriveDrivers(pa: WardProfile, pb: WardProfile): Driver[] {
  const builtDiff = round3(pa.builtupFraction - pb.builtupFraction);
  const handDiff = round3(pa.handM - pb.handM);
  const slopeDiff = round3(pa.meanSlope - pb.meanSlope);
  const drainDiff = round3(pa.drainDensityKmPerKm2 - pb.drainDensityKmPerKm2);
  const waterbodyDiff = round3(pa.waterbodyDistanceM - pb.waterbodyDistanceM);
  const drivers: Driver[] = [
    {
      mechanism_type: "RUNOFF_CONCENTRATION",
      score: round3(Math.min(1, Math.abs(builtDiff) / 0.3)),
      explanation:
        "Signals: built_up_fraction difference between the two ward profiles. Screening estimate only.",
      signal_values: { built_up_fraction_diff: builtDiff },
    },
    {
      mechanism_type: "TERRAIN_DEPRESSION",
      score: round3(
        Math.min(1, (Math.abs(handDiff) / 2 + Math.abs(slopeDiff) / 0.02) / 2)
      ),
      explanation:
        "Signals: HAND and mean-slope differences between the two ward profiles. Screening estimate only.",
      signal_values: { hand_diff_m: handDiff, mean_slope_diff: slopeDiff },
    },
    {
      mechanism_type: "DRAINAGE_CAPACITY",
      score: round3(Math.min(1, Math.abs(drainDiff) / 2)),
      explanation:
        "Signals: drain-density difference (illustrative field for all wards). Screening estimate only.",
      signal_values: { drain_density_diff_km_per_km2: drainDiff },
    },
    {
      mechanism_type: "WATERBODY_INTERACTION",
      score: round3(Math.min(1, Math.abs(waterbodyDiff) / 1500)),
      explanation:
        "Signals: waterbody-distance difference (illustrative field for all wards). Screening estimate only.",
      signal_values: { waterbody_distance_diff_m: waterbodyDiff },
    },
  ];
  return drivers.sort((x, y) => y.score - x.score);
}

function wardLabel(placeId: string): { name: string; ward: string | null } {
  const place = mockData.places.find((p) => p.id === placeId);
  return { name: place?.name ?? placeId, ward: place?.ward ?? null };
}

function wardTag(placeId: string): string {
  const { name, ward } = wardLabel(placeId);
  return ward ? `${name} (Ward ${ward})` : name;
}

function profileStatusNote(p: WardProfile): string {
  return p.dataStatus === "calibrated_demo_dataset"
    ? "calibrated demo dataset"
    : "illustrative demo input";
}

export interface ScreeningReport {
  investigation: Record<string, unknown>;
  mechanisms: Record<string, unknown>[];
  evidence: Record<string, unknown>[];
  graph: Record<string, unknown>;
  validation: Record<string, unknown>;
  defensibility: Record<string, unknown>;
  limitations: Record<string, unknown>[];
}

export function buildScreeningReport(placeAId: string, placeBId: string): ScreeningReport | null {
  const pa = getWardProfile(placeAId);
  const pb = getWardProfile(placeBId);
  if (!pa || !pb || placeAId === placeBId) return null;

  const comparisonId = screeningComparisonId(placeAId, placeBId);
  const investigationId = screeningInvestigationId(comparisonId);
  const twin = getTwinSimilarity(placeAId, placeBId);
  const drivers = deriveDrivers(pa, pb);
  const strongest = drivers[0];
  const labelA = wardTag(placeAId);
  const labelB = wardTag(placeBId);
  const placeA = mockData.places.find((p) => p.id === placeAId) ?? null;
  const placeB = mockData.places.find((p) => p.id === placeBId) ?? null;

  const evidence = drivers.flatMap((d, i) => {
    const items: Record<string, unknown>[] = [];
    for (const [key, value] of Object.entries(d.signal_values)) {
      const evId = `scev-${i}-${key}-${investigationId.slice(4, 12)}`;
      items.push({
        id: evId,
        evidence_id: evId,
        investigation_id: investigationId,
        mechanism_type: d.mechanism_type,
        certainty_level: "HYPOTHESIS",
        claim: `${key.replace(/_/g, " ")} differs between ${labelA} and ${labelB} (screening estimate)`,
        value,
        unit: key.endsWith("_m")
          ? "m"
          : key.includes("fraction")
            ? "fraction"
            : key.includes("km2")
              ? "km/km²"
              : "index",
        source: "ward_profile_screening",
        source_id: null,
        dataset_version_id: null,
        feature_derivation_id: null,
        spatial_ref: null,
        temporal_ref: null,
        support_score: d.score,
        explanation: `Derived from demo ward profiles (${labelA}: ${profileStatusNote(pa)}; ${labelB}: ${profileStatusNote(pb)}). ${SCREENING_DISCLOSURE}`,
        source_independence: "SAME_SOURCE_SIGNAL",
        limitations: [SCREENING_DISCLOSURE],
        extra_data: {},
        created_at: DATASET_BUILT_AT,
      });
    }
    return items;
  });

  const mechanisms = drivers.map((d, i) => ({
    id: `scmech-${i}-${investigationId.slice(4, 12)}`,
    comparison_id: comparisonId,
    mechanism_type: d.mechanism_type,
    score: d.score,
    confidence: 0.3,
    certainty: "HYPOTHESIS",
    confidence_meaning:
      "Unvalidated screening hypothesis derived from demo ward profiles; no historical event evidence ships for this pair.",
    rank: i + 1,
    supporting_evidence_ids: evidence
      .filter((e) => e.mechanism_type === d.mechanism_type)
      .map((e) => e.id),
    limiting_evidence_ids: [],
    explanation: d.explanation,
    signal_values: d.signal_values,
  }));

  const graph = {
    investigation_id: investigationId,
    nodes: [
      { id: "rainfall", label: "Rainfall (same storm)", node_type: "input", metadata: {} },
      { id: "catchment_a", label: labelA, node_type: "process", metadata: {} },
      { id: "catchment_b", label: labelB, node_type: "process", metadata: {} },
      ...drivers.map((d, i) => ({
        id: `driver_${i}`,
        label: d.mechanism_type.replace(/_/g, " "),
        node_type: "process",
        metadata: { score: d.score, certainty: "HYPOTHESIS" },
      })),
      {
        id: "outcome",
        label: "Differential outcome (unevaluated)",
        node_type: "output",
        metadata: {},
      },
    ],
    edges: drivers.map((d, i) => ({
      source: "catchment_a",
      target: `driver_${i}`,
      mechanism: d.mechanism_type,
      evidence_ids: evidence
        .filter((e) => e.mechanism_type === d.mechanism_type)
        .map((e) => e.id),
      certainty_level: "HYPOTHESIS",
      relation_type: "CAUSAL_HYPOTHESIS",
      support_score: d.score,
      label: `${d.mechanism_type.replace(/_/g, " ")} (screening)`,
    })),
  };

  const validation = {
    id: `scval-${investigationId.slice(4, 12)}`,
    investigation_id: investigationId,
    proposed_mechanism: strongest.mechanism_type,
    event_count: 0,
    supporting_event_count: 0,
    contradicting_event_count: 0,
    inconclusive_event_count: 0,
    result: "INSUFFICIENT_DATA",
    confidence: 0,
    recurring_mechanisms: [],
    explanation: `No historical validation events ship in the demo dataset for ${labelA} vs ${labelB}. The calibrated multi-event validation covers Anna Nagar vs Velachery only, so this screening report cannot be corroborated against past floods.`,
    method_version: "screening_v1",
    event_ids: [],
    observation_ids: [],
    feature_derivation_ids: [],
    source_datasets: ["Demo ward profiles (see per-field data_status)"],
    sample_size_n: 0,
    validation_method: "none_screening_only",
    validation_status: "INSUFFICIENT_DATA",
    limitations: [SCREENING_DISCLOSURE],
  };

  const gate = (name: string, description: string) => ({
    gate_name: name,
    status: "UNKNOWN",
    confidence: 0,
    description,
    explanation: description,
  });
  const gates = {
    direct_flood_observation: gate(
      "direct_flood_observation",
      "No verified field flood observations ship for this pair in the demo dataset."
    ),
    historical_recurrence: gate(
      "historical_recurrence",
      "No multi-event history is available for an uncalibrated pair."
    ),
    mechanism_specificity: gate(
      "mechanism_specificity",
      "Mechanisms are generic screening hypotheses, not calibrated signals."
    ),
    counterfactual_consistency: gate(
      "counterfactual_consistency",
      "Counterfactual checks require a calibrated baseline, which this pair lacks."
    ),
    data_provenance: gate(
      "data_provenance",
      `Ward inputs are labeled per-field (${labelA}: ${profileStatusNote(pa)}; ${labelB}: ${profileStatusNote(pb)}); drain density and waterbody distance are illustrative for all wards.`
    ),
  };

  const defensibility = {
    investigation_id: investigationId,
    place_a_id: placeAId,
    place_b_id: placeBId,
    proposed_mechanism: strongest.mechanism_type,
    verdict: SCREENING_VERDICT,
    correlation_gates_passed: 0,
    causal_gates_passed: 0,
    total_gates: Object.keys(gates).length,
    gates,
    correlation_gates: {},
    causal_gates: {},
    material_limitations: [
      "Screening report: no historical flood events ship for this pair",
      "One or both ward profiles are illustrative demo input",
      "Drain density and waterbody distance are illustrative for all wards",
    ],
    has_material_limitations: true,
    causal_vs_correlation_analysis:
      "No causal claims are made. All mechanisms are unvalidated hypotheses derived from static ward profiles.",
    recommendation:
      "Treat this report as a triage aid for selecting wards for a calibrated run, not as evidence for engineering decisions.",
  };

  const limitations = [
    {
      id: `sclim-1-${investigationId.slice(4, 12)}`,
      limitation: "no_historical_validation",
      severity: "HIGH",
      source: "Demo dataset",
      affected_feature: "all",
      explanation: `No historical flood events ship for ${labelA} vs ${labelB}; mechanism scores are unvalidated screening hypotheses.`,
    },
    {
      id: `sclim-2-${investigationId.slice(4, 12)}`,
      limitation: "illustrative_ward_inputs",
      severity: "HIGH",
      source: "Demo ward profiles",
      affected_feature: "terrain, land_cover",
      explanation: `${labelA}: ${profileStatusNote(pa)}. ${labelB}: ${profileStatusNote(pb)}. Illustrative values are plausible stand-ins, not measurements.`,
    },
    {
      id: `sclim-3-${investigationId.slice(4, 12)}`,
      limitation: "illustrative_drainage_fields",
      severity: "MEDIUM",
      source: "Demo ward profiles",
      affected_feature: "drain_density_km_per_km2, waterbody_distance_m",
      explanation:
        "Drain density and waterbody distance are illustrative for every ward; no traceable extraction ships in the repo.",
    },
    {
      id: `sclim-4-${investigationId.slice(4, 12)}`,
      limitation: "uncalibrated_similarity",
      severity: "MEDIUM",
      source: "ward_screening_v1",
      affected_feature: "similarity_score",
      explanation: `Similarity score ${twin.similarity_score} is a deterministic screening estimate (weights ${twin.weights_version}), not a calibrated twin fit.`,
    },
  ];

  const summary =
    `Screening analysis of ${labelA} vs ${labelB}. ` +
    `Similarity score: ${twin.similarity_score} (screening estimate, ${twin.weights_version}). ` +
    `Strongest screening hypothesis: ${strongest.mechanism_type}. ` +
    `${SCREENING_DISCLOSURE}`;

  const investigation = {
    id: investigationId,
    comparison_id: comparisonId,
    status: "completed",
    agent_mode: SCREENING_AGENT_MODE,
    summary,
    strongest_mechanism: strongest.mechanism_type,
    agent_response: summary,
    error_message: null,
    started_at: DATASET_BUILT_AT,
    completed_at: DATASET_BUILT_AT,
    created_at: DATASET_BUILT_AT,
    investigation_id: investigationId,
    place_a: placeA,
    place_b: placeB,
    comparison: {
      id: comparisonId,
      place_a_id: placeAId,
      place_b_id: placeBId,
      similarity_score: twin.similarity_score,
      weights_version: twin.weights_version,
      feature_similarities: twin.feature_similarities,
      similarity_breakdown: null,
      reasons: twin.reasons,
      is_calibrated: false,
      disclaimer: twin.disclaimer,
      created_at: DATASET_BUILT_AT,
    },
    mechanisms,
    evidence,
    validation,
    defensibility,
    counterfactual: null,
    limitations,
    provenance_summary: {
      sources_tracked: 1,
      dataset_versions_tracked: 1,
      feature_derivations_computed: 0,
      lineage_available: false,
      note: SCREENING_DISCLOSURE,
    },
  };

  return { investigation, mechanisms, evidence, graph, validation, defensibility, limitations };
}
