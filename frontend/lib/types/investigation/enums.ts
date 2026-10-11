export const CertaintyLevel = {
  FACT: "FACT",
  SUPPORTED: "SUPPORTED",
  HYPOTHESIS: "HYPOTHESIS",
  UNKNOWN: "UNKNOWN",
} as const;
export type CertaintyLevel = (typeof CertaintyLevel)[keyof typeof CertaintyLevel];

export const ValidationStatus = {
  STRONG_SUPPORT: "STRONG_SUPPORT",
  MODERATE_SUPPORT: "MODERATE_SUPPORT",
  WEAK_SUPPORT: "WEAK_SUPPORT",
  MIXED: "MIXED",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",
} as const;
export type ValidationStatus = (typeof ValidationStatus)[keyof typeof ValidationStatus];

export const DefensibilityVerdict = {
  DEFENSIBLE: "DEFENSIBLE",
  DEFENSIBLE_WITH_MATERIAL_LIMITATIONS: "DEFENSIBLE_WITH_MATERIAL_LIMITATIONS",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
} as const;
export type DefensibilityVerdict = (typeof DefensibilityVerdict)[keyof typeof DefensibilityVerdict];

export const LimitationSeverity = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;
export type LimitationSeverity = (typeof LimitationSeverity)[keyof typeof LimitationSeverity];

export const GateStatus = {
  PASS: "PASS",
  FAIL: "FAIL",
  CONDITIONAL: "CONDITIONAL",
  UNKNOWN: "UNKNOWN",
} as const;
export type GateStatus = (typeof GateStatus)[keyof typeof GateStatus];

export const SourceIndependenceType = {
  INDEPENDENT_SOURCE: "INDEPENDENT_SOURCE",
  DEPENDENT_DERIVATION: "DEPENDENT_DERIVATION",
  SAME_SOURCE_SIGNAL: "SAME_SOURCE_SIGNAL",
} as const;
export type SourceIndependenceType = (typeof SourceIndependenceType)[keyof typeof SourceIndependenceType];

export const EvidenceRelationType = {
  CORRELATION: "CORRELATION",
  ASSOCIATION: "ASSOCIATION",
  PROXY_INPUT: "PROXY_INPUT",
  CAUSAL_HYPOTHESIS: "CAUSAL_HYPOTHESIS",
} as const;
export type EvidenceRelationType = (typeof EvidenceRelationType)[keyof typeof EvidenceRelationType];

export const InvestigationStatus = {
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type InvestigationStatus = (typeof InvestigationStatus)[keyof typeof InvestigationStatus];
