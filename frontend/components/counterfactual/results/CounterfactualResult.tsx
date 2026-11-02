import type { CounterfactualRun } from "@/lib/types/counterfactual";
import { formatScore, formatPercent } from "@/lib/formatting";

export interface CounterfactualResultProps {
  result: CounterfactualRun | null;
}

export default function CounterfactualResult({ result }: CounterfactualResultProps) {
  if (!result) {
    return (
      <div className="rounded-lg border border-border bg-surface-subtle p-4 text-center">
        <p className="text-sm text-gray-500">
          Run a counterfactual scenario to see results.
        </p>
      </div>
    );
  }

  const isReduction = result.delta < 0;

  return (
    <div className="space-y-3">
      {/* Scientific Distinction Warning Banner */}
      <div
        className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"
        role="note"
      >
        <div className="flex items-center gap-2 font-semibold text-amber-800">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          <span>Screening Proxy Output (Not a Calibrated Hydraulic Prediction)</span>
        </div>
        <p className="mt-1 text-amber-700">
          {result.limitation || "Simplified rational runoff proxy — does not represent a calibrated 2D hydraulic simulation (SWMM/HEC-RAS)."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-subtle p-3">
          <p className="text-xs text-gray-500">Baseline Peak Runoff</p>
          <p className="text-lg font-mono font-semibold text-gray-900">
            {formatScore(result.baseline_output)}
          </p>
          <p className="text-xs text-gray-400">m³/s ({(result.output_metric ?? "peak_discharge_proxy_m3_s").replace(/_/g, " ")})</p>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            isReduction ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}
        >
          <p className={`text-xs ${isReduction ? "text-green-600" : "text-red-600"}`}>
            Counterfactual Output ({result.scenario_name})
          </p>
          <p
            className={`text-lg font-mono font-semibold ${
              isReduction ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatScore(result.counterfactual_output)}
          </p>
          <p className="text-xs text-gray-400">m³/s ({(result.output_metric ?? "peak_discharge_proxy_m3_s").replace(/_/g, " ")})</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Absolute Change (Delta)</span>
          <span
            className={`font-mono text-sm font-semibold ${
              isReduction ? "text-green-700" : "text-red-700"
            }`}
          >
            {(result.delta ?? 0) > 0 ? "+" : ""}
            {formatScore(result.delta ?? 0)} m³/s
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-gray-500">Relative Change</span>
          <span
            className={`font-mono text-sm font-semibold ${
              isReduction ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatPercent(result.percent_change)}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-subtle p-3">
        <h4 className="text-xs font-semibold text-gray-600 mb-2">Scenario Parameters</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {Object.entries(result.parameters || {}).map(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              return (
                <div key={key} className="rounded border border-[#E8DFD3] bg-white p-2.5 space-y-1">
                  <span className="font-bold text-[#554638] capitalize block border-b border-[#E8DFD3] pb-1">
                    {key.replace(/_/g, " ")}
                  </span>
                  <dl className="space-y-1 pt-1">
                    {Object.entries(value as Record<string, unknown>).map(([subK, subV]) => (
                      <div key={subK} className="flex justify-between text-[11px]">
                        <dt className="text-gray-500">{subK.replace(/_/g, " ")}</dt>
                        <dd className="font-mono text-gray-700">
                          {typeof subV === "number" ? subV.toFixed(2) : String(subV)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            }
            return (
              <div key={key} className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">{key.replace(/_/g, " ")}</dt>
                <dd className="font-mono text-gray-700">
                  {typeof value === "number" ? value.toFixed(2) : String(value)}
                </dd>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <p className="text-xs font-semibold text-blue-800">Transformation Rule</p>
        <p className="mt-0.5 text-xs text-blue-700">{result.transformation_rule ?? "Linear rational peak runoff proxy balance: Q = C * I * A - capacity"}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-blue-600">
          <span>Mechanism: {result.mechanism_tested.replace(/_/g, " ")}</span>
          <span>Provenance: {result.baseline_feature_provenance}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">{result.disclaimer}</p>
    </div>
  );
}
