"use client";

import { useMemo } from "react";
import type { Investigation, Mechanism } from "@/lib/types/investigation";

interface CausalFlowBannerProps {
  investigation: Investigation;
  mechanisms?: Mechanism[];
}

export default function CausalFlowBanner({
  investigation,
  mechanisms = [],
}: CausalFlowBannerProps) {
  const comparison = investigation.comparison;
  const placeA = investigation.place_a?.name ?? "Location A";
  const placeB = investigation.place_b?.name ?? "Location B";
  const wardA = investigation.place_a?.ward ? `Ward ${investigation.place_a.ward}` : "Site A";
  const wardB = investigation.place_b?.ward ? `Ward ${investigation.place_b.ward}` : "Site B";
  const simScore = comparison ? `${(comparison.similarity_score * 100).toFixed(0)}% Similarity` : "Paired";

  const topMechanism = mechanisms.length > 0 ? mechanisms[0] : null;
  const primaryDriverName = (
    investigation.strongest_mechanism ||
    topMechanism?.mechanism_type ||
    "conveyance_bottleneck"
  ).replace(/_/g, " ");

  const steps = useMemo(
    () => [
      {
        step: "01",
        stage: "Meteorological Trigger",
        title: "Cyclone Michaung (Dec 2023)",
        detail: "420+ mm Extreme Deluge",
        metric: "Precipitation Factor",
        status: "trigger",
        accent: "border-sky-300 bg-sky-50 text-sky-900",
        badge: "GCC Basin-Wide",
      },
      {
        step: "02",
        stage: "Topographic Gradient",
        title: "Micro-Elevation Deficit",
        detail: `${placeA} (${wardA}) vs ${placeB} (${wardB})`,
        metric: simScore,
        status: "vulnerability",
        accent: "border-amber-300 bg-amber-50 text-amber-900",
        badge: `${placeA} Low-Lying`,
      },
      {
        step: "03",
        stage: "Conveyance Bottleneck",
        title: "Drainage Infrastructure",
        detail: `Primary: ${primaryDriverName}`,
        metric: "Conduit Hydraulic Strangle",
        status: "mechanism",
        accent: "border-terracotta-300 bg-terracotta-50 text-terracotta-900",
        badge: "Causal Driver",
      },
      {
        step: "04",
        stage: "Inundation Outcome",
        title: "Differential Inundation",
        detail: `${placeA}: Submerged (75cm)`,
        metric: `${placeB}: Resilient (Dry)`,
        status: "outcome",
        accent: "border-red-300 bg-red-50 text-red-900",
        badge: "Field Validated",
      },
    ],
    [placeA, placeB, wardA, wardB, simScore, primaryDriverName]
  );

  return (
    <div className="rounded-2xl border border-[#E8DFD3] bg-white p-5 shadow-card space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD3] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
            Causal Mechanism Flowchart
          </span>
          <h3 className="font-serif text-lg font-bold text-[#221B15]">
            Diagnostic Causal Chain: {placeA} vs {placeB}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta-200 bg-terracotta-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta-800">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600 animate-pulse" />
            Direct Causal DAG
          </span>
        </div>
      </div>

      {/* Horizontal Flowchart Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {steps.map((s, idx) => (
          <div key={s.step} className="relative flex flex-col justify-between rounded-xl border p-3.5 transition-all bg-[#FAF7F2]/60 hover:bg-white hover:shadow-subtle">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#756350] mb-1">
                <span>STAGE {s.step}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${s.accent}`}>
                  {s.badge}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#554638] uppercase tracking-wider">
                {s.stage}
              </p>
              <h4 className="font-serif font-bold text-sm text-[#221B15] mt-1 leading-snug">
                {s.title}
              </h4>
              <p className="text-xs text-[#554638] mt-1 leading-relaxed">
                {s.detail}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#E8DFD3]/70 flex items-center justify-between text-[11px]">
              <span className="font-mono font-semibold text-terracotta-800">
                {s.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
