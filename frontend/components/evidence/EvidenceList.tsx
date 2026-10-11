"use client";

import { useState, useMemo } from "react";
import type { EvidenceItem } from "@/lib/types/investigation";
import { formatScore, formatUnit } from "@/lib/formatting";
import ProvenanceDrawer from "./provenance/ProvenanceDrawer";

interface EvidenceListProps {
  evidence: EvidenceItem[];
  investigationId: string;
  selectedMechanism?: string | null;
}

export default function EvidenceList({ evidence, investigationId, selectedMechanism }: EvidenceListProps) {
  const [provenanceEvidence, setProvenanceEvidence] = useState<EvidenceItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    let list = selectedMechanism
      ? evidence.filter((e) => e.mechanism_type === selectedMechanism)
      : evidence;

    if (activeFilter !== "ALL") {
      list = list.filter((e) => e.certainty_level === activeFilter);
    }
    return list;
  }, [evidence, selectedMechanism, activeFilter]);

  // Certainty counts
  const counts = useMemo(() => {
    const base = selectedMechanism
      ? evidence.filter((e) => e.mechanism_type === selectedMechanism)
      : evidence;
    return {
      all: base.length,
      fact: base.filter((e) => e.certainty_level === "FACT").length,
      supported: base.filter((e) => e.certainty_level === "SUPPORTED").length,
      hypothesis: base.filter((e) => e.certainty_level === "HYPOTHESIS").length,
    };
  }, [evidence, selectedMechanism]);

  if (evidence.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-8 text-center">
        <p className="text-sm font-semibold text-[#554638]">No ground-truth evidence items registered for this catchment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visual Certainty Level Distribution Diagram */}
      <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#554638] uppercase tracking-wider text-[11px]">
            Evidence Confidence Distribution ({counts.all} items)
          </span>
          <span className="text-[#756350]">Click category to filter evidence</span>
        </div>

        {/* Filter Buttons / Stepper Badges */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-[#221B15] text-white shadow-xs"
                : "bg-white border border-[#E0D5C7] text-[#554638] hover:bg-[#FAF7F2]"
            }`}
          >
            All Evidence ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("FACT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "FACT"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>FACT ({counts.fact})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("SUPPORTED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "SUPPORTED"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>SUPPORTED ({counts.supported})</span>
          </button>

          {counts.hypothesis > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("HYPOTHESIS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === "HYPOTHESIS"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>HYPOTHESIS ({counts.hypothesis})</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Structured Evidence Cards */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isFact = item.certainty_level === "FACT";
          const isSupported = item.certainty_level === "SUPPORTED";

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E8DFD3] bg-white p-4 shadow-xs transition-all hover:border-terracotta-300 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                      isFact
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : isSupported
                        ? "bg-blue-50 border-blue-300 text-blue-800"
                        : "bg-amber-50 border-amber-300 text-amber-800"
                    }`}
                  >
                    {item.certainty_level}
                  </span>
                  <p className="font-semibold text-sm text-[#221B15] leading-snug">
                    {item.claim}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setProvenanceEvidence(item)}
                  className="rounded-xl border border-[#E0D5C7] bg-[#FAF7F2] hover:bg-terracotta-50 hover:border-terracotta-300 px-3 py-1.5 text-xs font-bold text-[#554638] hover:text-terracotta-800 transition-all cursor-pointer shrink-0 w-fit"
                  aria-label={`View provenance for: ${item.claim}`}
                >
                  Inspect Provenance →
                </button>
              </div>

              {/* Measured Metrics Bar */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD3]">
                {item.value !== null && (
                  <div className="flex items-center gap-1 text-[#221B15]">
                    <span className="text-[#756350] font-medium">Measured Value:</span>
                    <span className="font-mono font-bold text-terracotta-700">
                      {formatScore(item.value)} {formatUnit(item.unit)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[#554638]">
                  <span className="text-[#756350]">Source:</span>
                  <span className="font-semibold capitalize">{item.source.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-1 text-[#554638]">
                  <span className="text-[#756350]">Support Score:</span>
                  <span className="font-mono font-bold text-[#221B15]">{formatScore(item.support_score)}</span>
                </div>
              </div>

              {/* Limitations If Present */}
              {item.limitations.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-xs text-amber-800 space-y-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider block">
                    Scope Note / Limitation:
                  </span>
                  <ul className="space-y-0.5 text-[11px]">
                    {item.limitations.map((lim, i) => (
                      <li key={i}>• {lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {provenanceEvidence && (
        <ProvenanceDrawer
          investigationId={investigationId}
          evidence={provenanceEvidence}
          isOpen={!!provenanceEvidence}
          onClose={() => setProvenanceEvidence(null)}
        />
      )}
    </div>
  );
}
