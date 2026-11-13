// Builds the claim provenance chain for one evidence item from the
// calibrated dataset, matching the ClaimProvenance shape the provenance
// drawer renders. Every step is derived from the evidence record's own
// fields (source engine, explanation, measured value, certainty).

import mockData from "@/lib/mockData.json";
import type { ClaimProvenance, ClaimProvenanceStep } from "@/lib/types/evidence";

export function buildClaimProvenance(
  investigationId: string,
  evidenceId: string
): ClaimProvenance {
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
