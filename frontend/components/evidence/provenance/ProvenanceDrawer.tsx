"use client";

import { useQuery } from "@tanstack/react-query";
import { getProvenance } from "@/lib/api/evidence";
import ProvenanceChain from "./ProvenanceChain";
import { LoadingSkeleton, ErrorState } from "@/components/ui";
import type { EvidenceItem } from "@/lib/types/investigation";

interface ProvenanceDrawerProps {
  investigationId: string;
  evidence: EvidenceItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProvenanceDrawer({
  investigationId,
  evidence,
  isOpen,
  onClose,
}: ProvenanceDrawerProps) {
  const { data: provenance, isLoading, error } = useQuery({
    queryKey: ["provenance", investigationId, evidence.id],
    queryFn: () => getProvenance(investigationId, evidence.id),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Provenance for evidence: ${evidence.claim}`}
    >
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Evidence Provenance</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-flood-500"
            aria-label="Close provenance drawer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 rounded-lg border border-border bg-surface-subtle p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Claim</p>
          <p className="mt-1 text-sm text-gray-800">{evidence.claim}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Mechanism: {evidence.mechanism_type.replace(/_/g, " ")}</span>
            <span>|</span>
            <span>Certainty: {evidence.certainty_level}</span>
          </div>
        </div>

        {isLoading && <LoadingSkeleton variant="card" />}

        {error && (
          <ErrorState
            message={`Failed to load provenance: ${error.message}`}
          />
        )}

        {provenance && <ProvenanceChain provenance={provenance} />}
      </div>
    </div>
  );
}
