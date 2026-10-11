export const MECHANISM_LABELS: Record<string, string> = {
  IMPERVIOUS_SURFACE: "Impervious Surface",
  TERRAIN_DEPRESSION: "Terrain Depression",
  DRAINAGE_CAPACITY: "Drainage Capacity",
  DRAINAGE_CONNECTIVITY: "Drainage Connectivity",
  RUNOFF_CONCENTRATION: "Runoff Concentration",
  OUTFALL_RESTRICTION: "Outfall Restriction",
  WATERBODY_INTERACTION: "Waterbody Interaction",
  INSUFFICIENT_EVIDENCE: "Insufficient Evidence",
};

export const FEATURE_LABELS: Record<string, string> = {
  rainfall: "Rainfall",
  terrain: "Terrain",
  drainage: "Drainage",
  landcover: "Land Cover",
  spatial: "Spatial Proximity",
  event: "Event",
  hand_elevation: "HAND / Elevation",
  land_cover: "Land Cover",
  drainage_context: "Drainage Context",
  waterbody_proximity: "Waterbody Proximity",
};

export const CERTAINTY_STYLES: Record<string, string> = {
  FACT: "text-green-700 bg-green-100 border-green-200",
  SUPPORTED: "text-blue-700 bg-blue-100 border-blue-200",
  HYPOTHESIS: "text-amber-700 bg-amber-100 border-amber-200",
  UNKNOWN: "text-gray-700 bg-gray-100 border-gray-200",
};

export const SEVERITY_STYLES: Record<string, string> = {
  HIGH: "text-red-700 bg-red-100 border-red-200",
  MEDIUM: "text-amber-700 bg-amber-100 border-amber-200",
  LOW: "text-green-700 bg-green-100 border-green-200",
};

export const GATE_STATUS_STYLES: Record<string, string> = {
  PASS: "text-green-700 bg-green-100 border-green-200",
  FAIL: "text-red-700 bg-red-100 border-red-200",
  CONDITIONAL: "text-amber-700 bg-amber-100 border-amber-200",
  UNKNOWN: "text-gray-700 bg-gray-100 border-gray-200",
};

export const VERDICT_STYLES: Record<string, string> = {
  DEFENSIBLE: "text-green-700 bg-green-100 border-green-200",
  DEFENSIBLE_WITH_MATERIAL_LIMITATIONS: "text-amber-700 bg-amber-100 border-amber-200",
  INSUFFICIENT_EVIDENCE: "text-gray-700 bg-gray-100 border-gray-200",
};

export const VALIDATION_STYLES: Record<string, string> = {
  STRONG_SUPPORT: "text-green-700 bg-green-100 border-green-200",
  MODERATE_SUPPORT: "text-blue-700 bg-blue-100 border-blue-200",
  WEAK_SUPPORT: "text-amber-700 bg-amber-100 border-amber-200",
  MIXED: "text-orange-700 bg-orange-100 border-orange-200",
  INSUFFICIENT_DATA: "text-gray-700 bg-gray-100 border-gray-200",
};

export const SOURCE_INDEPENDENCE_LABELS: Record<string, string> = {
  INDEPENDENT_SOURCE: "Independent",
  DEPENDENT_DERIVATION: "Dependent",
  SAME_SOURCE_SIGNAL: "Same Source",
};

export const PROVENANCE_LEVEL_ICONS: Record<string, string> = {
  claim: "📋",
  evidence: "🔬",
  feature: "📊",
  derivation: "⚙️",
  source_file: "📁",
  dataset_version: "🗃️",
  source: "🌐",
};

export const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];
