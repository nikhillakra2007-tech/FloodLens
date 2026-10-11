import type { SensitivityReport } from "@/lib/types/counterfactual";
import { formatPercent, formatScore } from "@/lib/formatting";

export interface SensitivityTableProps {
  report: SensitivityReport | null;
}

export default function SensitivityTable({ report }: SensitivityTableProps) {
  if (!report) {
    return (
      <div className="rounded-lg border border-border bg-surface-subtle p-4 text-center">
        <p className="text-sm text-gray-500">
          Run a sensitivity analysis to see parameter variation results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 5-Card Statistics Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div className="rounded-lg border border-border bg-surface-subtle p-2 text-center">
          <p className="text-xs text-gray-500">Tested Variations</p>
          <p className="text-lg font-semibold text-gray-900">{report.total_variations_tested}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-subtle p-2 text-center">
          <p className="text-xs text-gray-500">Reductions</p>
          <p className="text-lg font-semibold text-green-600">{report.reductions_count}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-subtle p-2 text-center">
          <p className="text-xs text-gray-500">Min Change</p>
          <p className="text-lg font-semibold text-flood-700">
            {formatPercent(report.min_percent_change)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-subtle p-2 text-center">
          <p className="text-xs text-gray-500">Mean Change</p>
          <p className="text-lg font-semibold text-flood-700">
            {formatPercent(report.mean_percent_change)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-subtle p-2 text-center">
          <p className="text-xs text-gray-500">Max Change</p>
          <p className="text-lg font-semibold text-flood-700">
            {formatPercent(report.max_percent_change)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Qualitative Stability:</span>
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            report.is_qualitatively_stable
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {report.is_qualitatively_stable
            ? "Qualitatively Stable Across Parameter Ranges"
            : "Sensitive / Variable Response"}
        </span>
      </div>

      {/* 15-Scenario Results Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-subtle">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-600">Variation</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Runoff ×</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Capacity ×</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Rainfall ×</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Baseline (m³/s)</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Modified (m³/s)</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Delta (m³/s)</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Change (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {report.variations.map((v, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="px-3 py-2 font-medium text-gray-800">{v.variation_label}</td>
                <td className="px-3 py-2 font-mono text-gray-600">
                  {v.runoff_coeff_multiplier.toFixed(2)}
                </td>
                <td className="px-3 py-2 font-mono text-gray-600">
                  {v.capacity_multiplier.toFixed(2)}
                </td>
                <td className="px-3 py-2 font-mono text-gray-600">
                  {v.rainfall_multiplier.toFixed(2)}
                </td>
                <td className="px-3 py-2 font-mono text-gray-600">
                  {formatScore(v.baseline_excess_flow)}
                </td>
                <td className="px-3 py-2 font-mono text-gray-600">
                  {formatScore(v.counterfactual_excess_flow)}
                </td>
                <td className="px-3 py-2 font-mono text-gray-800">
                  {v.delta > 0 ? "+" : ""}
                  {formatScore(v.delta)}
                </td>
                <td className="px-3 py-2 font-mono">
                  <span
                    className={`font-semibold ${
                      v.is_reduction ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {formatPercent(v.percent_change)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 italic">{report.disclaimer}</p>
    </div>
  );
}
