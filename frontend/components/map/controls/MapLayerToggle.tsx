import clsx from "clsx";

export interface MapLayerToggleProps {
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  description?: string;
}

export default function MapLayerToggle({ label, enabled, onToggle, description }: MapLayerToggleProps) {
  return (
    <div
      onClick={() => onToggle(!enabled)}
      className={clsx(
        "flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 cursor-pointer select-none",
        enabled
          ? "border-terracotta-300 bg-white shadow-subtle"
          : "border-[#E8DFD3] bg-[#FAF7F2]/80 hover:border-[#D5C6B3] hover:bg-white"
      )}
    >
      <div className="pr-2">
        <p className={clsx("text-xs font-bold tracking-tight", enabled ? "text-terracotta-800" : "text-[#554638]")}>
          {label}
        </p>
        {description && <p className="text-[11px] text-[#756350] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${label} layer`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!enabled);
        }}
        className={clsx(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500",
          enabled ? "bg-terracotta-600 shadow-sm" : "bg-[#DFD3C1]"
        )}
      >
        <span
          className={clsx(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
            enabled ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
