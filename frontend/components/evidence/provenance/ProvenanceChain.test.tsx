import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProvenanceChain from "./ProvenanceChain";
import type { ClaimProvenance } from "@/lib/types/evidence";

const mockProvenance: ClaimProvenance = {
  investigation_id: "inv-id",
  evidence_id: "ev-id",
  claim: "Test claim",
  mechanism_type: "IMPERVIOUS_SURFACE",
  chain: [
    { level: "claim", identifier: "claim-1", name: "Test claim step", metadata: {} },
    { level: "evidence", identifier: "ev-1", name: "Evidence item", metadata: {} },
    { level: "source", identifier: "src-1", name: "ESA WorldCover", metadata: {} },
  ],
};

describe("ProvenanceChain", () => {
  it("renders chain steps in order", () => {
    render(<ProvenanceChain provenance={mockProvenance} />);
    expect(screen.getByText("Test claim step")).toBeTruthy();
    expect(screen.getByText("Evidence item")).toBeTruthy();
    expect(screen.getByText("ESA WorldCover")).toBeTruthy();
  });

  it("renders metadata when available", () => {
    const withMetadata: ClaimProvenance = {
      ...mockProvenance,
      chain: [
        { level: "source_file", identifier: "sf-1", name: "File", metadata: { logical_key: "data/raw/test.csv" } },
      ],
    };
    render(<ProvenanceChain provenance={withMetadata} />);
    expect(screen.getByText("data/raw/test.csv")).toBeTruthy();
  });

  it("renders empty state for empty chain", () => {
    render(<ProvenanceChain provenance={{ ...mockProvenance, chain: [] }} />);
    expect(screen.getByText(/No provenance data available/)).toBeTruthy();
  });
});
