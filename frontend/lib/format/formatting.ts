export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(2);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatConfidence(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(0)}%`;
}

export function formatMechanismType(type: string): string {
  const labels: Record<string, string> = {
    IMPERVIOUS_SURFACE: "Impervious Surface",
    TERRAIN_DEPRESSION: "Terrain Depression",
    DRAINAGE_CAPACITY: "Drainage Capacity",
    DRAINAGE_CONNECTIVITY: "Drainage Connectivity",
    RUNOFF_CONCENTRATION: "Runoff Concentration",
    OUTFALL_RESTRICTION: "Outfall Restriction",
    WATERBODY_INTERACTION: "Waterbody Interaction",
    INSUFFICIENT_EVIDENCE: "Insufficient Evidence",
  };
  return labels[type] ?? type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCertainty(level: string | null | undefined): string {
  if (!level) return "Unknown";
  return level.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatVerdict(verdict: string | null | undefined): string {
  if (!verdict) return "Unknown";
  const labels: Record<string, string> = {
    DEFENSIBLE: "Defensible",
    DEFENSIBLE_WITH_MATERIAL_LIMITATIONS: "Defensible with Material Limitations",
    INSUFFICIENT_EVIDENCE: "Insufficient Evidence",
  };
  return labels[verdict] ?? verdict.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatUnit(unit: string | null | undefined): string {
  if (!unit) return "";
  const symbols: Record<string, string> = {
    mm: "mm",
    cm: "cm",
    m: "m",
    "m3/s": "m³/s",
    km2: "km²",
    km: "km",
    "m/hr": "mm/hr",
    fraction: "fraction",
    degrees: "degrees",
  };
  return symbols[unit] ?? unit;
}

export function certaintyColor(level: string): string {
  switch (level) {
    case "FACT":
      return "text-green-700 bg-green-100";
    case "SUPPORTED":
      return "text-blue-700 bg-blue-100";
    case "HYPOTHESIS":
      return "text-amber-700 bg-amber-100";
    case "UNKNOWN":
      return "text-gray-700 bg-gray-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
}

export function mechanismLabel(type: string): string {
  return formatMechanismType(type);
}
