import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ValidationPanel from "./ValidationPanel";
import type { ValidationRun } from "@/lib/types/investigation";

const mockValidation: ValidationRun = {
  id: "val-1",
  investigation_id: "inv-1",
  proposed_mechanism: "IMPERVIOUS_SURFACE",
  event_count: 3,
  supporting_event_count: 2,
  contradicting_event_count: 0,
  inconclusive_event_count: 1,
  result: "MODERATE_SUPPORT",
  confidence: 0.6,
  recurring_mechanisms: null,
  explanation: "Test explanation",
  method_version: "v2023.1",
  event_ids: [],
  observation_ids: [],
  feature_derivation_ids: [],
  source_datasets: ["IMD/GPM rainfall"],
  sample_size_n: 3,
  validation_method: "multi_event_consistency_triangulation",
  validation_status: null,
  limitations: ["N=3 multi-event historical sample does not justify strong certainty"],
};

describe("ValidationPanel", () => {
  it("renders validation result", () => {
    render(<ValidationPanel validation={mockValidation} />);
    expect(screen.getByText(/moderate support/i)).toBeTruthy();
  });

  it("renders sample size", () => {
    render(<ValidationPanel validation={mockValidation} />);
    expect(screen.getByText("N=3 events")).toBeTruthy();
  });

  it("renders confidence", () => {
    render(<ValidationPanel validation={mockValidation} />);
    expect(screen.getByText("60%")).toBeTruthy();
  });

  it("renders limitations", () => {
    render(<ValidationPanel validation={mockValidation} />);
    expect(screen.getByText(/N=3 multi-event/)).toBeTruthy();
  });
});
