import clsx from "clsx";
import { useState } from "react";

export interface MapLegendProps {
  showDrains?: boolean;
  showObservations?: boolean;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function MapLegend({
  showDrains,
  showObservations,
  className,
  collapsible = false,
  defaultExpanded = true,
}: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return false;
    }
    return defaultExpanded;
  });

  return (
    <div
      className={clsx(
        "rounded-2xl border border-[#E8DFD3] bg-white/95 text-xs shadow-card backdrop-blur-md transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <h4 className="font-bold uppercase tracking-wider text-[11px] text-terracotta-700 flex items-center gap-1.5">
          <span>🗺️</span>
          <span>Map Legend</span>
        </h4>
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-bold text-[#756350] hover:text-[#221B15] bg-[#F5EFE6] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            aria-label={isExpanded ? "Collapse legend" : "Expand legend"}
          >
            {isExpanded ? "Hide ▲" : "Show ▼"}
          </button>
        )}
      </div>

      {(!collapsible || isExpanded) && (
        <div className="space-y-2.5 px-3.5 pb-3.5 sm:px-4 sm:pb-4 border-t border-[#F0E8DD] pt-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C23E2A] shadow-sm" />
            </span>
            <span className="font-semibold text-[#221B15]">Location A (Inundated Site)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3B8352] shadow-sm" />
            </span>
            <span className="font-semibold text-[#221B15]">Location B (Resilient Control)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#9E8B75] shrink-0" />
            <span className="text-[#554638]">GCC Monitored Station</span>
          </div>

          {showDrains && (
            <>
              <div className="flex items-center gap-2.5">
                <span className="inline-block h-2 w-3 rounded-sm bg-terracotta-500 shrink-0" />
                <span className="text-[#554638]">Surveyed SWD Conduit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="inline-block h-2 w-3 rounded-sm bg-[#D48B38] shrink-0" />
                <span className="text-[#554638]">Inferred Drainage Channel</span>
              </div>
            </>
          )}

          {showObservations && (
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#C23E2A]/70 shrink-0" />
              <span className="text-[#756350]">Flood Inundation Point (2023 &amp; Recent)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
