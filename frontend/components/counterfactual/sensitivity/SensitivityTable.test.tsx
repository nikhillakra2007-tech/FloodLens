import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SensitivityTable from "./SensitivityTable";
import type { SensitivityReport } from "@/lib/types/counterfactual";

const mockReport: SensitivityReport = {
  scenario_name: "reduce_runoff_20pct",
  base_delta: -198.49,
  base_percent_change: -20.1,
  total_variations_tested: 15,
  reductions_count: 14,
  is_qualitatively_stable: true,
  min_percent_change: -25.3,
  max_percent_change: -15.2,
  mean_percent_change: -20.1,
  disclaimer: "Simplified proxy disclaimer",
  variations: [
    {
      variation_label: "nominal",
      runoff_coeff_multiplier: 1.0,
      capacity_multiplier: 1.0,
      rainfall_multiplier: 1.0,
      baseline_excess_flow: 987.45,
      counterfactual_excess_flow: 788.96,
      delta: -198.49,
      percent_change: -20.1,
      is_reduction: true,
    },
    {
      variation_label: "runoff_+10%",
      runoff_coeff_multiplier: 1.1,
      capacity_multiplier: 1.0,
      rainfall_multiplier: 1.0,
      baseline_excess_flow: 1086.2,
      counterfactual_excess_flow: 867.8,
      delta: -218.4,
      percent_change: -20.1,
      is_reduction: true,
    },
  ],
};

describe("SensitivityTable", () => {
  it("renders empty state when report is null", () => {
    render(<SensitivityTable report={null} />);
    expect(screen.getByText(/Run a sensitivity analysis to see parameter variation results/)).toBeTruthy();
  });

  it("renders summary statistics metrics", () => {
    render(<SensitivityTable report={mockReport} />);
    expect(screen.getByText("Tested Variations")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("Reductions")).toBeTruthy();
    expect(screen.getByText("14")).toBeTruthy();
    expect(screen.getByText("Mean Change")).toBeTruthy();
  });

  it("renders qualitative stability badge", () => {
    render(<SensitivityTable report={mockReport} />);
    expect(screen.getByText(/Qualitatively Stable Across Parameter Ranges/)).toBeTruthy();
  });

  it("renders scenario variations in table", () => {
    render(<SensitivityTable report={mockReport} />);
    expect(screen.getByText("nominal")).toBeTruthy();
    expect(screen.getByText("runoff_+10%")).toBeTruthy();
  });

  it("renders disclaimer", () => {
    render(<SensitivityTable report={mockReport} />);
    expect(screen.getByText("Simplified proxy disclaimer")).toBeTruthy();
  });
});
