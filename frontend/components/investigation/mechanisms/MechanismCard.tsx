import type { Mechanism } from "@/lib/types/investigation";
import { Badge, ScoreBar } from "@/components/ui";
import { formatMechanismType, formatConfidence } from "@/lib/formatting";

export interface MechanismCardProps {
  mechanism: Mechanism;
  onSelect?: (mechanism: Mechanism) => void;
  isSelected?: boolean;
}

export default function MechanismCard({ mechanism, onSelect, isSelected }: MechanismCardProps) {
  const handleClick = () => onSelect?.(mechanism);

  return (
    <div
      className={`rounded-lg border bg-surface p-3 transition-colors ${
        isSelected ? "border-flood-500 ring-1 ring-flood-500" : "border-border"
      } ${onSelect ? "cursor-pointer hover:bg-gray-50" : ""}`}
      onClick={handleClick}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? (e) => e.key === "Enter" && handleClick() : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mechanism.rank && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
              #{mechanism.rank}
            </span>
          )}
          <span className="text-sm font-medium">{formatMechanismType(mechanism.mechanism_type)}</span>
        </div>
        <Badge label={mechanism.certainty} variant="certainty" value={mechanism.certainty} />
      </div>

      <div className="mt-2 flex items-center gap-3">
        <ScoreBar value={mechanism.score} className="flex-1" />
        <span className="w-10 text-right text-xs font-mono">{mechanism.score.toFixed(2)}</span>
      </div>

      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
        <span>Confidence: {formatConfidence(mechanism.confidence)}</span>
        {mechanism.supporting_evidence_ids.length > 0 && (
          <span className="text-green-600">
            {mechanism.supporting_evidence_ids.length} supporting
          </span>
        )}
        {mechanism.limiting_evidence_ids.length > 0 && (
          <span className="text-amber-600">
            {mechanism.limiting_evidence_ids.length} limiting
          </span>
        )}
      </div>

      {mechanism.confidence_meaning && (
        <p className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-500">
          {mechanism.confidence_meaning}
        </p>
      )}

      {mechanism.explanation && (
        <p className="mt-1 text-xs text-gray-400">{mechanism.explanation}</p>
      )}
    </div>
  );
}
