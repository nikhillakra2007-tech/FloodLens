import { z } from "zod";

const certaintyLevelSchema = z.enum(["FACT", "SUPPORTED", "HYPOTHESIS", "UNKNOWN"]);
const validationStatusSchema = z.enum(["STRONG_SUPPORT", "MODERATE_SUPPORT", "WEAK_SUPPORT", "MIXED", "INSUFFICIENT_DATA"]);
const defensibilityVerdictSchema = z.enum(["DEFENSIBLE", "DEFENSIBLE_WITH_MATERIAL_LIMITATIONS", "INSUFFICIENT_EVIDENCE"]);
const limitationSeveritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
const gateStatusSchema = z.enum(["PASS", "FAIL", "CONDITIONAL", "UNKNOWN"]);
const sourceIndependenceSchema = z.enum(["INDEPENDENT_SOURCE", "DEPENDENT_DERIVATION", "SAME_SOURCE_SIGNAL"]);
const investigationStatusSchema = z.enum(["running", "completed", "failed"]);

export const placeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ward: z.string().nullable(),
  zone: z.string().nullable(),
  place_type: z.string(),
  description: z.string().nullable(),
  longitude: z.number(),
  latitude: z.number(),
  created_at: z.string(),
});

export const similarityBreakdownSchema = z.object({
  rainfall_similarity: z.number().nullable(),
  terrain_similarity: z.number().nullable(),
  drainage_similarity: z.number().nullable(),
  landcover_similarity: z.number().nullable(),
  spatial_similarity: z.number().nullable(),
  event_similarity: z.number().nullable(),
});

export const comparisonSchema = z.object({
  id: z.string().uuid(),
  place_a_id: z.string().uuid(),
  place_b_id: z.string().uuid(),
  similarity_score: z.number(),
  weights_version: z.string(),
  feature_similarities: z.record(z.number()),
  similarity_breakdown: similarityBreakdownSchema.nullable(),
  reasons: z.array(z.string()),
  created_at: z.string(),
});

export const mechanismSchema = z.object({
  id: z.string().uuid(),
  comparison_id: z.string().uuid(),
  mechanism_type: z.string(),
  score: z.number(),
  confidence: z.number(),
  certainty: certaintyLevelSchema,
  confidence_meaning: z.string().nullable(),
  rank: z.number().nullable(),
  supporting_evidence_ids: z.array(z.string().uuid()),
  limiting_evidence_ids: z.array(z.string().uuid()),
  explanation: z.string().nullable(),
  signal_values: z.record(z.unknown()),
});

export const evidenceItemSchema = z.object({
  id: z.string().uuid(),
  evidence_id: z.string().uuid(),
  investigation_id: z.string().uuid(),
  mechanism_type: z.string(),
  certainty_level: certaintyLevelSchema,
  claim: z.string(),
  value: z.number().nullable(),
  unit: z.string().nullable(),
  source: z.string(),
  source_id: z.string().uuid().nullable(),
  dataset_version_id: z.string().uuid().nullable(),
  feature_derivation_id: z.string().uuid().nullable(),
  spatial_ref: z.string().nullable(),
  temporal_ref: z.string().nullable(),
  support_score: z.number(),
  explanation: z.string().nullable(),
  source_independence: sourceIndependenceSchema,
  limitations: z.array(z.string()),
  extra_data: z.record(z.unknown()).nullable(),
  created_at: z.string(),
});

export const validationRunSchema = z.object({
  id: z.string().uuid(),
  investigation_id: z.string().uuid(),
  proposed_mechanism: z.string().nullable(),
  event_count: z.number(),
  supporting_event_count: z.number(),
  contradicting_event_count: z.number(),
  inconclusive_event_count: z.number(),
  result: validationStatusSchema,
  confidence: z.number().nullable(),
  recurring_mechanisms: z.record(z.unknown()).nullable(),
  explanation: z.string().nullable(),
  method_version: z.string(),
  event_ids: z.array(z.string().uuid()),
  observation_ids: z.array(z.string().uuid()),
  feature_derivation_ids: z.array(z.string().uuid()),
  source_datasets: z.array(z.string()),
  sample_size_n: z.number(),
  validation_method: z.string(),
  validation_status: z.string().nullable(),
  limitations: z.array(z.string()),
});

export const gateResultSchema = z.object({
  gate_name: z.string(),
  status: gateStatusSchema,
  confidence: z.number(),
  description: z.string(),
  explanation: z.string().nullable(),
  reason: z.string().nullable(),
  gate_type: z.string(),
  evidence_ids: z.array(z.string().uuid()),
  limitations: z.array(z.string()),
});

export const defensibilityAssessmentSchema = z.object({
  investigation_id: z.string().uuid(),
  place_a_id: z.string().uuid(),
  place_b_id: z.string().uuid(),
  proposed_mechanism: z.string().nullable(),
  verdict: defensibilityVerdictSchema,
  correlation_gates_passed: z.number(),
  causal_gates_passed: z.number(),
  total_gates: z.number(),
  gates: z.record(gateResultSchema),
  correlation_gates: z.record(gateResultSchema),
  causal_gates: z.record(gateResultSchema),
  material_limitations: z.array(z.string()),
  has_material_limitations: z.boolean(),
  causal_vs_correlation_analysis: z.string(),
  recommendation: z.string(),
});

export const investigationLimitationSchema = z.object({
  id: z.string(),
  limitation: z.string(),
  severity: limitationSeveritySchema,
  source: z.string(),
  affected_feature: z.string(),
  explanation: z.string(),
});

export const investigationDetailSchema = z.object({
  id: z.string().uuid(),
  investigation_id: z.string().uuid(),
  comparison_id: z.string().uuid(),
  status: investigationStatusSchema,
  agent_mode: z.string(),
  summary: z.string().nullable(),
  strongest_mechanism: z.string().nullable(),
  place_a: placeSchema.nullable(),
  place_b: placeSchema.nullable(),
  comparison: comparisonSchema.nullable(),
  mechanisms: z.array(mechanismSchema),
  evidence: z.array(evidenceItemSchema),
  validation: validationRunSchema.nullable(),
  defensibility: defensibilityAssessmentSchema.nullable(),
  limitations: z.array(investigationLimitationSchema),
  provenance_summary: z.record(z.unknown()),
  agent_response: z.record(z.unknown()),
  error_message: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
});

export type InvestigationDetail = z.infer<typeof investigationDetailSchema>;
export type Place = z.infer<typeof placeSchema>;
export type Comparison = z.infer<typeof comparisonSchema>;
export type Mechanism = z.infer<typeof mechanismSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
