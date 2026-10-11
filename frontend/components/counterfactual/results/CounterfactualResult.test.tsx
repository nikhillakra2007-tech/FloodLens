import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CounterfactualResult from "./CounterfactualResult";
import type { CounterfactualRun } from "@/lib/types/counterfactual";

const mockResult: CounterfactualRun = {
  id: "cf-1",
  investigation_id: "inv-1",
  scenario_name: "reduce_runoff_20pct",
  parameters: {
    runoff_coefficient: 0.56,
    rainfall_mm: 100,
  },
  baseline_output: 987.45,
  counterfactual_output: 788.96,
  delta: -198.49,
  percent_change: -20.1,
  disclaimer: "Hydrological disclaimer text",
  mechanism_tested: "RUNOFF_GENERATION_SURCHARGE",
  input_features: ["runoff_coefficient"],
  baseline_values: {},
  transformed_values: {},
  transformation_rule: "Q = C * I * A - capacity",
  output_metric: "peak_discharge_proxy_m3_s",
  sensitivity_run_id: null,
  baseline_feature_provenance: "ESA WorldCover 10m",
  is_calibrated_hydraulic_prediction: false,
  limitation: "Simplified counterfactual proxy — not a calibrated hydraulic prediction.",
  created_at: "2026-10-09T03:30:00Z",
};

describe("CounterfactualResult", () => {
  it("renders empty state when result is null", () => {
    render(<CounterfactualResult result={null} />);
    expect(screen.getByText(/Run a counterfactual scenario to see results/)).toBeTruthy();
  });

  it("renders screening proxy distinction banner", () => {
    render(<CounterfactualResult result={mockResult} />);
    expect(
      screen.getByText(/Screening Proxy Output \(Not a Calibrated Hydraulic Prediction\)/)
    ).toBeTruthy();
    expect(screen.getByText(/Simplified counterfactual proxy/)).toBeTruthy();
  });

  it("renders baseline and counterfactual outputs with delta", () => {
    render(<CounterfactualResult result={mockResult} />);
    expect(screen.getByText(/Baseline Peak Runoff/)).toBeTruthy();
    expect(screen.getByText(/987.45/)).toBeTruthy();
    expect(screen.getByText(/788.96/)).toBeTruthy();
    expect(screen.getByText(/-198.49 m³\/s/)).toBeTruthy();
    expect(screen.getByText(/-20\.1%/)).toBeTruthy();
  });

  it("renders parameters and transformation rule", () => {
    render(<CounterfactualResult result={mockResult} />);
    expect(screen.getByText("runoff coefficient")).toBeTruthy();
    expect(screen.getByText("0.56")).toBeTruthy();
    expect(screen.getByText("Q = C * I * A - capacity")).toBeTruthy();
  });

  it("renders disclaimer", () => {
    render(<CounterfactualResult result={mockResult} />);
    expect(screen.getByText("Hydrological disclaimer text")).toBeTruthy();
  });
});
