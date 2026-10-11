import clsx from "clsx";

export interface MapLegendProps {
  showDrains?: boolean;
  showObservations?: boolean;
  className?: string;
}

export default function MapLegend({ showDrains, showObservations, className }: MapLegendProps) {
  return (
    <div className={clsx("rounded-2xl border border-[#E8DFD3] bg-white/95 p-4 text-xs shadow-card backdrop-blur-md", className)}>
      <h4 className="mb-3 font-bold uppercase tracking-wider text-[10px] text-terracotta-700">Map Legend</h4>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C23E2A] shadow-sm" />
          </span>
          <span className="font-semibold text-[#221B15]">Location A (Inundated Site)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3B8352] shadow-sm" />
          </span>
          <span className="font-semibold text-[#221B15]">Location B (Resilient Control)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#9E8B75]" />
          <span className="text-[#554638]">GCC Monitored Station</span>
        </div>
        {showDrains && (
          <>
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2 w-3 rounded-sm bg-terracotta-500" />
              <span className="text-[#554638]">Surveyed SWD Conduit</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2 w-3 rounded-sm bg-[#D48B38]" />
              <span className="text-[#554638]">Inferred Drainage Channel</span>
            </div>
          </>
        )}
        {showObservations && (
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#C23E2A]/70" />
            <span className="text-[#756350]">Flood Inundation Point (2023 &amp; Recent)</span>
          </div>
        )}
      </div>
    </div>
  );
}
