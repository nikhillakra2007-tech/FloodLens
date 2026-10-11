import type { ValidationRun } from "@/lib/types/investigation";
import { Badge } from "@/components/ui";
import { formatConfidence } from "@/lib/formatting";

export interface ValidationPanelProps {
  validation: ValidationRun;
}

export default function ValidationPanel({ validation }: ValidationPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge label={validation.result.replace(/_/g, " ")} variant="validation" value={validation.result} />
        <span className="text-xs text-gray-500">
          N={validation.sample_size_n} events
        </span>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Supporting</p>
          <p className="font-semibold text-green-600">{validation.supporting_event_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Contradicting</p>
          <p className="font-semibold text-red-600">{validation.contradicting_event_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Inconclusive</p>
          <p className="font-semibold text-amber-600">{validation.inconclusive_event_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Confidence</p>
          <p className="font-semibold text-flood-700">{formatConfidence(validation.confidence)}</p>
        </div>
      </div>

      {validation.explanation && (
        <p className="text-sm text-gray-600">{validation.explanation}</p>
      )}

      {validation.source_datasets.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold text-gray-600">Source datasets</h4>
          <ul className="space-y-1 text-xs text-gray-500">
            {validation.source_datasets.map((ds, i) => (
              <li key={i}>• {ds}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.limitations.length > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 p-2">
          <ul className="space-y-1 text-xs text-amber-700">
            {validation.limitations.map((lim, i) => (
              <li key={i}>• {lim}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
