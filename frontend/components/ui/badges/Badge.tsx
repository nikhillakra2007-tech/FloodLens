import clsx from "clsx";

export interface BadgeProps {
  label: string;
  variant?: "certainty" | "severity" | "gate" | "verdict" | "validation" | "neutral";
  value: string;
  className?: string;
}

const VARIANT_STYLES: Record<string, Record<string, string>> = {
  certainty: {
    FACT: "text-green-700 bg-green-100 border-green-200",
    SUPPORTED: "text-blue-700 bg-blue-100 border-blue-200",
    HYPOTHESIS: "text-amber-700 bg-amber-100 border-amber-200 border-dashed",
    UNKNOWN: "text-gray-700 bg-gray-100 border-gray-200",
  },
  severity: {
    HIGH: "text-red-700 bg-red-100 border-red-200",
    MEDIUM: "text-amber-700 bg-amber-100 border-amber-200",
    LOW: "text-green-700 bg-green-100 border-green-200",
  },
  gate: {
    PASS: "text-green-700 bg-green-100 border-green-200",
    FAIL: "text-red-700 bg-red-100 border-red-200",
    CONDITIONAL: "text-amber-700 bg-amber-100 border-amber-200",
    UNKNOWN: "text-gray-700 bg-gray-100 border-gray-200",
  },
  verdict: {
    DEFENSIBLE: "text-green-700 bg-green-100 border-green-200",
    DEFENSIBLE_WITH_MATERIAL_LIMITATIONS: "text-amber-700 bg-amber-100 border-amber-200",
    INSUFFICIENT_EVIDENCE: "text-gray-700 bg-gray-100 border-gray-200",
  },
  validation: {
    STRONG_SUPPORT: "text-green-700 bg-green-100 border-green-200",
    MODERATE_SUPPORT: "text-blue-700 bg-blue-100 border-blue-200",
    WEAK_SUPPORT: "text-amber-700 bg-amber-100 border-amber-200",
    MIXED: "text-orange-700 bg-orange-100 border-orange-200",
    INSUFFICIENT_DATA: "text-gray-700 bg-gray-100 border-gray-200",
  },
  neutral: {},
};

export default function Badge({ label, variant = "neutral", value, className }: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant]?.[value] ?? "text-gray-700 bg-gray-100 border-gray-200";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-2xs font-medium",
        variantStyle,
        className
      )}
    >
      {label}
    </span>
  );
}
