import type { Comparison } from "@/lib/types/investigation";

export interface ComparisonPanelProps {
  comparison: Comparison | null;
}

export default function ComparisonPanel({ comparison }: ComparisonPanelProps) {
  if (!comparison) {
    return <p className="text-sm text-gray-500">Select two locations to compare.</p>;
  }

  const breakdown = comparison.similarity_breakdown;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-flood-600">
          {(comparison.similarity_score * 100).toFixed(0)}%
        </p>
        <p className="text-xs text-gray-500">overall similarity</p>
      </div>

      {breakdown && (
        <div className="space-y-2">
          {breakdown.rainfall_similarity !== null && (
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-gray-600">Rainfall</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-flood-500"
                  style={{ width: `${(breakdown.rainfall_similarity ?? 0) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono">
                {((breakdown.rainfall_similarity ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {breakdown.terrain_similarity !== null && (
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-gray-600">Terrain</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-flood-500"
                  style={{ width: `${(breakdown.terrain_similarity ?? 0) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono">
                {((breakdown.terrain_similarity ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {breakdown.drainage_similarity !== null && (
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-gray-600">Drainage</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-flood-500"
                  style={{ width: `${(breakdown.drainage_similarity ?? 0) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono">
                {((breakdown.drainage_similarity ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {breakdown.landcover_similarity !== null && (
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-gray-600">Land Cover</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-flood-500"
                  style={{ width: `${(breakdown.landcover_similarity ?? 0) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono">
                {((breakdown.landcover_similarity ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      )}

      {comparison.reasons.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold text-gray-600">Selection reasons</h4>
          <ul className="space-y-1 text-xs text-gray-500">
            {comparison.reasons.map((reason, i) => (
              <li key={i}>• {reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
