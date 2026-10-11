import type { InvestigationLimitation } from "@/lib/types/investigation";
import { LimitationSeverity } from "@/lib/types/enums";

export interface LimitationsPanelProps {
  limitations: InvestigationLimitation[];
}

export default function LimitationsPanel({ limitations }: LimitationsPanelProps) {
  if (limitations.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
        <span className="text-emerald-800 font-bold text-xs">✓ No Material Scope Limitations Found</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {limitations.map((lim) => {
        const isHigh = lim.severity === LimitationSeverity.HIGH;
        const isMed = lim.severity === LimitationSeverity.MEDIUM;

        return (
          <div
            key={lim.id}
            className={`rounded-2xl border p-4 space-y-2 transition-all ${
              isHigh
                ? "border-red-200 bg-red-50/50"
                : isMed
                ? "border-amber-200 bg-amber-50/50"
                : "border-[#E8DFD3] bg-[#FAF7F2]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#221B15] flex items-center gap-1.5 capitalize">
                <span>{isHigh ? "⚠️" : isMed ? "⚡" : "ℹ️"}</span>
                <span>{lim.limitation.replace(/_/g, " ")}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isHigh
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : isMed
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-gray-100 text-gray-800 border border-gray-300"
                }`}
              >
                {lim.severity}
              </span>
            </div>

            <p className="text-xs text-[#554638] leading-relaxed">
              {lim.explanation}
            </p>

            <div className="pt-1.5 border-t border-[#E8DFD3]/70 flex items-center justify-between text-[10px] text-[#756350] font-mono">
              <span>Scope: {lim.affected_feature.replace(/_/g, " ")}</span>
              <span>Source: {lim.source}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
