// Demo twin-catchment scenarios shown on the landing page and the simulator.
//
// Honesty contract (claims must match code):
// - "calibrated": Anna Nagar vs Velachery, the pair with a real phase-2
//   diagnostic run in the demo dataset. Every number comes from the
//   calibrated records (similarity 0.832, strongest mechanism
//   RUNOFF_CONCENTRATION at 0.5 confidence, verdict
//   DEFENSIBLE_WITH_MATERIAL_LIMITATIONS, validation MODERATE_SUPPORT over
//   3/3 events, and the evidence values below).
// - "illustrative": T Nagar vs Adyar. Explorable in the console, but it has
//   no calibrated run, so nothing here may wear a DEFENSIBLE verdict. The
//   fitness figure is the same screening estimate the compare API computes
//   (0.756), not an independent number.
// - "concept": Mylapore vs Foreshore Estate. Not in the demo dataset at
//   all; purely a narrative walkthrough with no scores.

import { getTwinSimilarity } from "@/lib/scoring/twin-similarity";

export type ScenarioDataStatus = "calibrated" | "illustrative" | "concept";

export interface ScenarioRank {
  label: string;
  // Null when no calibrated mechanism ranking exists for the scenario.
  confidencePct: number | null;
}

export interface DemoScenario {
  id: string;
  nameA: string;
  // GCC 2018 delimitation ward number, or null when no gazette-verified
  // number exists for the locality. Never invent one.
  wardA: string | null;
  nameB: string;
  wardB: string | null;
  dataStatus: ScenarioDataStatus;
  // Null when no score exists (scenario outside the demo dataset).
  similarityPct: number | null;
  similarityNote: string;
  primaryMechanism: string;
  // Null when there is no calibrated confidence to show.
  confidencePct: number | null;
  confidenceNote: string;
  verdict: string;
  validationNote: string | null;
  ranks: ScenarioRank[];
  rainfallDiff: string;
  // Sub-label under rainfallDiff - states how forcing is actually known.
  rainfallNote: string;
  drainageDiff: string;
  demDiff: string;
  imperviousDiff: string;
  summary: string;
  disclaimer: string | null;
  // Pair slug the diagnostic console understands, when one exists.
  consolePairParam: string | null;
}

const ANNA_NAGAR_ID = "9abecc5c-df2a-49ab-a089-1a8bd5244ff4";
const T_NAGAR_ID = "1ea309cc-6461-493e-b4aa-412ea3474676";
const VELACHERY_ID = "b0aa192d-6cc8-4262-97b7-07cd5de2d9a8";
const ADYAR_ID = "e503e3f2-28ba-46b0-8f7d-27aa3001f7be";

const tNagarAdyarScreening = getTwinSimilarity(T_NAGAR_ID, ADYAR_ID);

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "anna-nagar-velachery",
    nameA: "Anna Nagar",
    wardA: "Ward 101",
    nameB: "Velachery",
    wardB: "Ward 175",
    dataStatus: "calibrated",
    similarityPct: 83.2,
    similarityNote: "Calibrated twin fit",
    primaryMechanism: "Runoff Concentration",
    confidencePct: 50,
    confidenceNote: "Supported",
    verdict: "DEFENSIBLE WITH MATERIAL LIMITATIONS",
    validationNote: "Moderate support - 3/3 historical events, 0 contradicting",
    ranks: [
      { label: "Runoff Concentration", confidencePct: 50 },
      { label: "Terrain Depression", confidencePct: 50 },
      { label: "Impervious Surface", confidencePct: 40 },
    ],
    rainfallDiff: "Comparable storm forcing",
    rainfallNote: "Partially comparable - 70mm gauge diff",
    drainageDiff: "0.75 Effective Drain Capacity Ratio",
    demDiff: "-2.4m HAND Depression Differential",
    imperviousDiff: "+0.13 Built-up Fraction Difference",
    summary:
      "Under comparable cloudburst forcing (ward gauges differed by ~70mm), Anna Nagar ponded while Velachery drained: the calibrated run attributes the divergence to greater upstream runoff concentration on a -2.4m HAND depression, defensible with material limitations.",
    disclaimer: null,
    consolePairParam: null,
  },
  {
    id: "t-nagar-adyar",
    nameA: "T Nagar",
    wardA: null,
    nameB: "Adyar",
    wardB: "Ward 173",
    dataStatus: "illustrative",
    similarityPct: Math.round(tNagarAdyarScreening.similarity_score * 1000) / 10,
    similarityNote: "Screening estimate - no calibrated run",
    primaryMechanism: "Conduit Diameter Inadequacy & Overland Runoff",
    confidencePct: null,
    confidenceNote: "Illustrative hypothesis",
    verdict: "ILLUSTRATIVE",
    validationNote: null,
    ranks: [
      { label: "Conduit Diameter Inadequacy", confidencePct: null },
      { label: "Surface Infiltration Exhaustion", confidencePct: null },
      { label: "Secondary Canal Tidal Hold", confidencePct: null },
    ],
    rainfallDiff: "Assumed identical storm forcing",
    rainfallNote: "Assumed forcing, not measured",
    drainageDiff: "Older masonry SWD conduits (hypothesis)",
    demDiff: "HAND profile from illustrative ward inputs",
    imperviousDiff: "Higher commercial paved fraction (hypothesis)",
    summary:
      "T Nagar's high impervious commercial density overwhelmed older masonry SWD conduits, whereas Adyar's proximate tidal river canal accepted high discharge with minimal backflow.",
    disclaimer:
      "Illustrative demo scenario - this pair has no calibrated run; the narrative and figures are hypotheses, not validated hydrology.",
    consolePairParam: "t-nagar-adyar",
  },
  {
    id: "mylapore-foreshore",
    nameA: "Mylapore",
    wardA: null,
    nameB: "Foreshore Estate",
    wardB: null,
    dataStatus: "concept",
    similarityPct: null,
    similarityNote: "Outside the demo dataset",
    primaryMechanism: "Buckingham Canal Tidal Surge Lock & Flap Gate Surcharge",
    confidencePct: null,
    confidenceNote: "Concept walkthrough",
    verdict: "CONCEPT",
    validationNote: null,
    ranks: [
      { label: "Tidal Surge Lock", confidencePct: null },
      { label: "Flap Gate Surcharge", confidencePct: null },
      { label: "Coastal Outfall Velocity Loss", confidencePct: null },
    ],
    rainfallDiff: "Coastal convective cell (narrative)",
    rainfallNote: "Narrative only",
    drainageDiff: "Gravitational outfall tidal lock (narrative)",
    demDiff: "Coastal margin proximity (narrative)",
    imperviousDiff: "Built-up fraction contrast (narrative)",
    summary:
      "Mylapore's primary stormwater outfall was hydraulically locked by Buckingham Canal tidal surge height, forcing floodwaters upward through roadside inlets, whereas Foreshore Estate discharged into coastal dunes with active drainage.",
    disclaimer:
      "Concept walkthrough - these wards are not in the demo dataset; no measurements or scores exist for this pair.",
    consolePairParam: null,
  },
];
