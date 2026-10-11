import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CounterfactualForm from "./CounterfactualForm";

vi.mock("@/lib/api/counterfactual", () => ({
  runCounterfactual: vi.fn().mockResolvedValue({
    id: "cf-1",
    investigation_id: "inv-1",
    scenario_name: "reduce_runoff_20pct",
    parameters: { runoff_coefficient: 0.56, rainfall_mm: 100 },
    baseline_output: 987.45,
    counterfactual_output: 788.96,
    delta: -198.49,
    percent_change: -20.1,
    disclaimer: "Test disclaimer regarding proxy estimation",
    mechanism_tested: "RUNOFF_GENERATION_SURCHARGE",
    input_features: ["runoff_coefficient", "rainfall_mm"],
    baseline_values: {},
    transformed_values: {},
    transformation_rule: "Q = C * I * A - capacity",
    output_metric: "peak_discharge_proxy_m3_s",
    sensitivity_run_id: null,
    baseline_feature_provenance: "ESA WorldCover 10m",
    is_calibrated_hydraulic_prediction: false,
    limitation: "Simplified counterfactual proxy — not a calibrated hydraulic prediction.",
    created_at: "2026-10-09T03:30:00Z",
  }),
  runSensitivity: vi.fn().mockResolvedValue({
    scenario_name: "reduce_runoff_20pct",
    base_delta: -198.49,
    base_percent_change: -20.1,
    total_variations_tested: 15,
    reductions_count: 14,
    is_qualitatively_stable: true,
    min_percent_change: -25.3,
    max_percent_change: -15.2,
    mean_percent_change: -20.1,
    disclaimer: "Sensitivity test disclaimer",
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
    ],
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("CounterfactualForm", () => {
  it("renders scientific disclaimer", () => {
    render(<CounterfactualForm investigationId="inv-1" />, { wrapper: Wrapper });
    expect(screen.getByText("SCIENTIFIC DISCLAIMER")).toBeTruthy();
  });

  it("renders form inputs with initial values", () => {
    render(<CounterfactualForm investigationId="inv-1" />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/Runoff Coefficient/)).toBeTruthy();
    expect(screen.getByLabelText(/Contributing Area/)).toBeTruthy();
    expect(screen.getByLabelText(/Rainfall/)).toBeTruthy();
    expect(screen.getByLabelText(/Scenario Name/)).toBeTruthy();
  });

  it("renders action button", () => {
    render(<CounterfactualForm investigationId="inv-1" />, { wrapper: Wrapper });
    expect(screen.getByText("Run Counterfactual")).toBeTruthy();
  });

  it("shows validation error when scenario name is cleared", async () => {
    render(<CounterfactualForm investigationId="inv-1" />, { wrapper: Wrapper });
    const nameInput = screen.getByLabelText(/Scenario Name/);
    fireEvent.change(nameInput, { target: { value: "" } });

    const submitBtn = screen.getByText("Run Counterfactual");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/String must contain at least 1 character/i)).toBeTruthy();
    });
  });

  it("submits counterfactual and renders proxy results", async () => {
    render(<CounterfactualForm investigationId="inv-1" />, { wrapper: Wrapper });
    const submitBtn = screen.getByText("Run Counterfactual");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Screening Proxy Output \(Not a Calibrated Hydraulic Prediction\)/)
      ).toBeTruthy();
      expect(screen.getByText(/987.45/)).toBeTruthy();
      expect(screen.getByText(/788.96/)).toBeTruthy();
    });
  });
});
