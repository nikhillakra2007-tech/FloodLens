import clsx from "clsx";

export interface ScoreBarProps {
  value: number;
  max?: number;
  className?: string;
  colorClass?: string;
}

export default function ScoreBar({ value, max = 1, className, colorClass = "bg-[#168C83]" }: ScoreBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-[#EAF1F3]", className)}>
      <div
        className={clsx("h-full rounded-full transition-all duration-200", colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
