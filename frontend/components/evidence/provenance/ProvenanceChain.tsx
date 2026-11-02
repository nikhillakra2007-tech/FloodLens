import type { ClaimProvenance } from "@/lib/types/evidence";

interface ProvenanceChainProps {
  provenance: ClaimProvenance;
}

const LEVEL_ORDER = ["source", "source_file", "dataset_version", "feature", "derivation", "evidence", "claim"];

const LEVEL_META: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  claim: { label: "Causal Claim", icon: "⚖️", bg: "bg-terracotta-100 border-terracotta-300", text: "text-terracotta-900" },
  evidence: { label: "Empirical Evidence", icon: "📊", bg: "bg-blue-100 border-blue-300", text: "text-blue-900" },
  feature: { label: "Spatial Feature", icon: "🗺️", bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-900" },
  derivation: { label: "Physical Derivation", icon: "⚙️", bg: "bg-purple-100 border-purple-300", text: "text-purple-900" },
  source_file: { label: "Catalog File", icon: "📁", bg: "bg-amber-100 border-amber-300", text: "text-amber-900" },
  dataset_version: { label: "Dataset Release", icon: "📦", bg: "bg-gray-100 border-gray-300", text: "text-gray-900" },
  source: { label: "Raw Ground Source", icon: "🛰️", bg: "bg-indigo-100 border-indigo-300", text: "text-indigo-900" },
};

export default function ProvenanceChain({ provenance }: ProvenanceChainProps) {
  if (provenance.chain.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-6 text-center">
        <p className="text-sm font-semibold text-[#554638]">No provenance data available for this evidence item.</p>
        <p className="mt-1 text-xs text-[#756350]">
          This evidence type is derived from primary baseline assumptions.
        </p>
      </div>
    );
  }

  const sortedChain = [...provenance.chain].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  );

  return (
    <div className="space-y-4" role="list" aria-label="Provenance chain">
      {/* Visual Pipeline Flow Bar */}
      <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-3 text-xs flex items-center justify-between gap-1 overflow-x-auto">
        <span className="font-bold text-[#756350] text-[10px] uppercase tracking-wider shrink-0 mr-1">
          Lineage Flow:
        </span>
        {sortedChain.map((step, idx) => (
          <div key={idx} className="flex items-center gap-1 shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#E0D5C7] text-[10px] font-bold text-[#221B15]">
              <span>{LEVEL_META[step.level]?.icon ?? "•"}</span>
              <span>{LEVEL_META[step.level]?.label ?? step.level}</span>
            </span>
            {idx < sortedChain.length - 1 && (
              <span className="text-[#9E8B75] font-bold text-[10px]">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Structured Clean Step Cards */}
      <div className="space-y-3">
        {sortedChain.map((step, index) => {
          const meta = LEVEL_META[step.level] ?? {
            label: step.level.replace(/_/g, " "),
            icon: "•",
            bg: "bg-gray-100 border-gray-300",
            text: "text-gray-900",
          };

          return (
            <div
              key={`${step.level}-${step.identifier}`}
              className="relative rounded-2xl border border-[#E8DFD3] bg-white p-4 shadow-xs transition-all hover:border-terracotta-300"
              role="listitem"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-xl border text-xs ${meta.bg}`}>
                    {meta.icon}
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#756350]">
                      Step {index + 1} · {meta.label}
                    </span>
                    <h5 className="font-serif font-bold text-sm text-[#221B15] leading-snug">
                      {step.name}
                    </h5>
                  </div>
                </div>

                <span className="font-mono text-[9px] text-[#9E8B75] bg-[#FAF7F2] border border-[#E8DFD3] px-2 py-0.5 rounded-md shrink-0">
                  {step.identifier}
                </span>
              </div>

              {/* Clean Human-Readable Metadata Pills */}
              {step.metadata && Object.keys(step.metadata).length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#E8DFD3]/70 flex flex-wrap gap-2 text-xs">
                  {Object.entries(step.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#FAF7F2] border border-[#E0D5C7] px-2 py-1 text-[11px]"
                    >
                      <span className="text-[#756350] font-semibold">{key.replace(/_/g, " ")}:</span>
                      <span className="font-mono text-[#221B15] font-bold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
