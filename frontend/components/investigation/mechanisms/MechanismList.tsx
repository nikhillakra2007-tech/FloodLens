"use client";

import { useState } from "react";
import type { Mechanism } from "@/lib/types/investigation";
import MechanismCard from "./MechanismCard";
import { EmptyState } from "@/components/ui";

export interface MechanismListProps {
  mechanisms: Mechanism[];
  onMechanismSelect?: (mechanism: Mechanism) => void;
  selectedMechanismId?: string | null;
}

export default function MechanismList({
  mechanisms,
  onMechanismSelect,
  selectedMechanismId,
}: MechanismListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter out any mechanisms with 0 support score
  const nonZeroMechanisms = mechanisms.filter(
    (m) => (m.score ?? 0) > 0
  );

  if (nonZeroMechanisms.length === 0) {
    return <EmptyState message="No supported mechanisms identified." />;
  }

  const handleSelect = (mechanism: Mechanism) => {
    onMechanismSelect?.(mechanism);
    setExpandedId(expandedId === mechanism.id ? null : mechanism.id);
  };

  return (
    <div className="space-y-2.5" role="list" aria-label="Mechanism rankings">
      {nonZeroMechanisms.map((m) => (
        <div key={m.id} role="listitem">
          <MechanismCard
            mechanism={m}
            onSelect={handleSelect}
            isSelected={selectedMechanismId === m.id}
          />
          {expandedId === m.id && m.signal_values && Object.keys(m.signal_values).length > 0 && (
            <div className="mt-1 rounded border border-border bg-surface-subtle p-2">
              <h4 className="mb-1 text-xs font-semibold text-gray-600">Signal Values</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {Object.entries(m.signal_values).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-gray-500">{key.replace(/_/g, " ")}</dt>
                    <dd className="font-mono text-gray-700">
                      {typeof value === "number" ? value.toFixed(2) : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
