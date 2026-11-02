import type { DefensibilityAssessment } from "@/lib/types/investigation";

export interface DefensibilityPanelProps {
  assessment: DefensibilityAssessment;
}

export default function DefensibilityPanel({ assessment }: DefensibilityPanelProps) {
  const gates = Object.entries(assessment.gates);

  return (
    <div className="space-y-4">
      {/* Top Gate Passed Metric Strip */}
      <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756350] block">
              Audit Assessment Verdict
            </span>
            <span className="font-serif font-bold text-base text-[#221B15] uppercase">
              {assessment.verdict.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756350] block">
              Total Gates Cleared
            </span>
            <span className="font-mono text-sm font-bold text-emerald-700">
              {assessment.correlation_gates_passed + assessment.causal_gates_passed} / {assessment.total_gates} Passed
            </span>
          </div>
        </div>
      </div>

      {/* Balanced Gate Grid */}
      <div>
        <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#756350]">
          Defensibility Verification Gates
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {gates.map(([name, gate]) => {
            const isPassed = gate.status.toLowerCase() === "passed" || gate.status.toLowerCase() === "pass";

            return (
              <div
                key={name}
                className={`rounded-2xl border p-3 space-y-1.5 transition-all ${
                  isPassed
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-amber-200 bg-amber-50/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#221B15] capitalize flex items-center gap-1.5">
                    <span>{isPassed ? "✓" : "⚠️"}</span>
                    <span>{name.replace(/_/g, " ")}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPassed
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {gate.status}
                  </span>
                </div>
                {gate.description && (
                  <p className="text-[11px] text-[#554638] leading-relaxed">{gate.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation If Present */}
      {assessment.recommendation && (
        <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50/70 p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-800 block">
            Civil Engineering Recommendation:
          </span>
          <p className="text-xs text-[#433830] leading-relaxed font-medium">
            {assessment.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
