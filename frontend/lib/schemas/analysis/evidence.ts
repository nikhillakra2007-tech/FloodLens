import { z } from "zod";

export const claimProvenanceStepSchema = z.object({
  level: z.string(),
  identifier: z.string(),
  name: z.string(),
  metadata: z.record(z.unknown()),
});

export const claimProvenanceSchema = z.object({
  investigation_id: z.string().uuid(),
  evidence_id: z.string().uuid(),
  claim: z.string(),
  mechanism_type: z.string(),
  chain: z.array(claimProvenanceStepSchema),
});

export const mechanismGraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  node_type: z.string(),
  metadata: z.record(z.unknown()),
});

export const mechanismGraphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  mechanism: z.string(),
  evidence_ids: z.array(z.string().uuid()),
  certainty_level: z.enum(["FACT", "SUPPORTED", "HYPOTHESIS", "UNKNOWN"]),
  relation_type: z.enum(["CORRELATION", "ASSOCIATION", "PROXY_INPUT", "CAUSAL_HYPOTHESIS"]),
  support_score: z.number(),
  label: z.string(),
});

export const mechanismGraphSchema = z.object({
  investigation_id: z.string().uuid(),
  nodes: z.array(mechanismGraphNodeSchema),
  edges: z.array(mechanismGraphEdgeSchema),
});

export type ClaimProvenance = z.infer<typeof claimProvenanceSchema>;
export type MechanismGraph = z.infer<typeof mechanismGraphSchema>;
