import type { CertaintyLevel, DefensibilityVerdict, GateStatus, InvestigationStatus, LimitationSeverity, SourceIndependenceType, ValidationStatus } from "./enums";

export interface Place {
  id: string;
  name: string;
  ward: string | null;
  zone: string | null;
  place_type: string;
  description: string | null;
  longitude: number;
  latitude: number;
  created_at: string;
}

export interface TerrainFeature {
  id: string;
  place_id: string;
  mean_elevation: number | null;
  min_elevation: number | null;
  max_elevation: number | null;
  mean_slope: number | null;
  hand: number | null;
  relative_elevation: number | null;
  elevation_mean_m: number | null;
  elevation_min_m: number | null;
  elevation_max_m: number | null;
  mean_slope_degrees: number | null;
  hand_m: number | null;
  relative_elevation_m: number | null;
  source: string;
  computation_version: string;
  created_at: string;
}

export interface LandcoverFeature {
  id: string;
  place_id: string;
  builtup_fraction: number | null;
  vegetation_fraction: number | null;
  water_fraction: number | null;
  source: string;
  computation_version: string;
  created_at: string;
}

export interface LocationFeaturesBundle {
  place_id: string;
  terrain: TerrainFeature | null;
  landcover: LandcoverFeature | null;
  location_features: LocationFeature[];
}

export interface LocationFeature {
  id: string;
  place_id: string;
  feature_name: string;
  value: number | null;
  unit: string | null;
  source: string;
  computation_version: string;
  is_inferred: boolean;
  created_at: string;
}

export interface SimilarityBreakdown {
  rainfall_similarity: number | null;
  terrain_similarity: number | null;
  drainage_similarity: number | null;
  landcover_similarity: number | null;
  spatial_similarity: number | null;
  event_similarity: number | null;
}

export interface Comparison {
  id: string;
  place_a_id: string;
  place_b_id: string;
  similarity_score: number;
  weights_version: string;
  feature_similarities: Record<string, number>;
  similarity_breakdown: SimilarityBreakdown | null;
  reasons: string[];
  created_at: string;
}

export interface Mechanism {
  id: string;
  comparison_id: string;
  mechanism_type: string;
  score: number;
  confidence: number;
  certainty: CertaintyLevel;
  confidence_meaning: string | null;
  rank: number | null;
  supporting_evidence_ids: string[];
  limiting_evidence_ids: string[];
  explanation: string | null;
  signal_values: Record<string, unknown>;
}

export interface EvidenceItem {
  id: string;
  evidence_id: string;
  investigation_id: string;
  mechanism_type: string;
  certainty_level: CertaintyLevel;
  claim: string;
  value: number | null;
  unit: string | null;
  source: string;
  source_id: string | null;
  dataset_version_id: string | null;
  feature_derivation_id: string | null;
  spatial_ref: string | null;
  temporal_ref: string | null;
  support_score: number;
  explanation: string | null;
  source_independence: SourceIndependenceType;
  limitations: string[];
  extra_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ValidationRun {
  id: string;
  investigation_id: string;
  proposed_mechanism: string | null;
  event_count: number;
  supporting_event_count: number;
  contradicting_event_count: number;
  inconclusive_event_count: number;
  result: ValidationStatus;
  confidence: number | null;
  recurring_mechanisms: Record<string, unknown> | null;
  explanation: string | null;
  method_version: string;
  event_ids: string[];
  observation_ids: string[];
  feature_derivation_ids: string[];
  source_datasets: string[];
  sample_size_n: number;
  validation_method: string;
  validation_status: string | null;
  limitations: string[];
}

export interface GateResult {
  gate_name: string;
  status: GateStatus;
  confidence: number;
  description: string;
  explanation: string | null;
  reason: string | null;
  gate_type: string;
  evidence_ids: string[];
  limitations: string[];
}

export interface DefensibilityAssessment {
  investigation_id: string;
  place_a_id: string;
  place_b_id: string;
  proposed_mechanism: string | null;
  verdict: DefensibilityVerdict;
  correlation_gates_passed: number;
  causal_gates_passed: number;
  total_gates: number;
  gates: Record<string, GateResult>;
  correlation_gates: Record<string, GateResult>;
  causal_gates: Record<string, GateResult>;
  material_limitations: string[];
  has_material_limitations: boolean;
  causal_vs_correlation_analysis: string;
  recommendation: string;
}

export interface InvestigationLimitation {
  id: string;
  limitation: string;
  severity: LimitationSeverity;
  source: string;
  affected_feature: string;
  explanation: string;
}

export interface Investigation {
  id: string;
  investigation_id: string;
  comparison_id: string;
  status: InvestigationStatus;
  agent_mode: string;
  summary: string | null;
  strongest_mechanism: string | null;
  place_a: Place | null;
  place_b: Place | null;
  comparison: Comparison | null;
  mechanisms: Mechanism[];
  evidence: EvidenceItem[];
  validation: ValidationRun | null;
  defensibility: DefensibilityAssessment | null;
  limitations: InvestigationLimitation[];
  provenance_summary: Record<string, unknown>;
  agent_response: Record<string, unknown>;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface InvestigationCreateResponse {
  id: string;
  investigation_id: string;
  comparison_id: string;
  status: InvestigationStatus;
  agent_mode: string;
  created_at: string;
}

export interface ComparableLocation {
  place_id: string;
  name: string;
  similarity_score: number;
  feature_similarities: Record<string, number>;
}

export interface ComparablesResponse {
  candidates: ComparableLocation[];
}

export interface LocationCompareResponse {
  place_a_id: string;
  place_b_id: string;
  similarity_score: number;
  feature_similarities: Record<string, number>;
  similarity_breakdown: SimilarityBreakdown | null;
  reasons: string[];
}
