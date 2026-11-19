// Builds the claim provenance chain for one evidence item from the
// calibrated dataset, matching the ClaimProvenance shape the provenance
// drawer renders. Every step is derived from the evidence record's own
// fields (source engine, explanation, measured value, certainty).

import mockData from "@/lib/mockData.json";
import {
  buildScreeningReport,
  parseScreeningInvestigationId,
  SCREENING_DISCLOSURE,
} from "@/lib/screening/screening-investigation";
import type { ClaimProvenance, ClaimProvenanceStep } from "@/lib/types/evidence";

export function buildClaimProvenance(
  investigationId: string,
  evidenceId: string
): ClaimProvenance {
  if (evidenceId.startsWith("scev-")) {
    const pair = parseScreeningInvestigationId(investigationId);
    const report = pair ? buildScreeningReport(pair.a, pair.b) : null;
    const scev: any = (report?.evidence ?? []).find((e) => e.id === evidenceId);
    if (scev) {
      const screeningChain: ClaimProvenanceStep[] = [
        {
          level: "source",
          identifier: "demo-ward-profiles",
          name: "Demo ward profiles (per-field data_status labels)",
          metadata: { explanation: scev.explanation },
        },
        {
          level: "derivation",
          identifier: "ward_profile_screening",
          name: "ward profile screening",
          metadata: { mechanism_type: scev.mechanism_type },
        },
        {
          level: "evidence",
          identifier: scev.id,
          name: scev.claim,
          metadata: {
            value: scev.value,
            unit: scev.unit,
            support_score: scev.support_score,
          },
        },
        {
          level: "claim",
          identifier: `${scev.id}-claim`,
          name: scev.claim,
          metadata: {
            mechanism_type: scev.mechanism_type,
            certainty_level: scev.certainty_level,
            disclosure: SCREENING_DISCLOSURE,
          },
        },
      ];
      return {
        investigation_id: investigationId,
        evidence_id: evidenceId,
        claim: scev.claim,
        mechanism_type: scev.mechanism_type,
        chain: screeningChain,
      };
    }
  }
  const evidence =
    mockData.evs.find((e) => e.id === evidenceId || e.evidence_id === evidenceId) ??
    mockData.evs[0];

  const chain: ClaimProvenanceStep[] = [
    {
      level: "source",
      identifier: "gcc-calibrated-baseline",
      name: "GCC calibrated baseline (2023 Cyclone Michaung)",
      metadata: { explanation: evidence.explanation },
    },
    {
      level: "derivation",
      identifier: evidence.source,
      name: evidence.source.replace(/_/g, " "),
      metadata: { mechanism_type: evidence.mechanism_type },
    },
    {
      level: "evidence",
      identifier: evidence.id,
      name: evidence.claim,
      metadata: {
        value: evidence.value,
        unit: evidence.unit,
        support_score: evidence.support_score,
      },
    },
    {
      level: "claim",
      identifier: `${evidence.id}-claim`,
      name: evidence.claim,
      metadata: {
        mechanism_type: evidence.mechanism_type,
        certainty_level: evidence.certainty_level,
      },
    },
  ];

  return {
    investigation_id: investigationId,
    evidence_id: evidenceId,
    claim: evidence.claim,
    mechanism_type: evidence.mechanism_type,
    chain,
  };
}
