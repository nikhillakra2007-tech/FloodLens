import type { CertaintyLevel, EvidenceRelationType } from "@/lib/types/enums";

export interface ClaimProvenanceStep {
  level: string;
  identifier: string;
  name: string;
  metadata: Record<string, unknown>;
}

export interface ClaimProvenance {
  investigation_id: string;
  evidence_id: string;
  claim: string;
  mechanism_type: string;
  chain: ClaimProvenanceStep[];
}

export interface MechanismGraphNode {
  id: string;
  label: string;
  node_type: string;
  metadata: Record<string, unknown>;
}

export interface MechanismGraphEdge {
  id?: string;
  source: string;
  target: string;
  mechanism?: string;
  evidence_ids: string[];
  certainty_level: CertaintyLevel;
  relation_type: EvidenceRelationType;
  support_score?: number;
  label: string;
}

export interface MechanismGraph {
  investigation_id: string;
  nodes: MechanismGraphNode[];
  edges: MechanismGraphEdge[];
}
