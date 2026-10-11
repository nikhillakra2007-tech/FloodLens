export interface CounterfactualRequest {
  scenario_name: string;
  runoff_coefficient: number;
  contributing_area_km2: number;
  effective_capacity: number;
  rainfall_mm: number;
  upstream_impervious_fraction: number;
  drainage_path_km: number;
}

export interface CounterfactualRun {
  id: string;
  investigation_id: string;
  scenario_name: string;
  parameters: Record<string, unknown>;
  baseline_output: number;
  counterfactual_output: number;
  delta: number;
  percent_change: number | null;
  disclaimer: string;
  mechanism_tested: string;
  input_features: string[];
  baseline_values: Record<string, unknown>;
  transformed_values: Record<string, unknown>;
  transformation_rule: string;
  output_metric: string;
  sensitivity_run_id: string | null;
  baseline_feature_provenance: string;
  is_calibrated_hydraulic_prediction: boolean;
  limitation: string;
  created_at: string;
}

export interface SensitivityScenario {
  variation_label: string;
  runoff_coeff_multiplier: number;
  capacity_multiplier: number;
  rainfall_multiplier: number;
  baseline_excess_flow: number;
  counterfactual_excess_flow: number;
  delta: number;
  percent_change: number | null;
  is_reduction: boolean;
}

export interface SensitivityReport {
  scenario_name: string;
  base_delta: number;
  base_percent_change: number | null;
  total_variations_tested: number;
  reductions_count: number;
  is_qualitatively_stable: boolean;
  min_percent_change: number | null;
  max_percent_change: number | null;
  mean_percent_change: number | null;
  disclaimer: string;
  variations: SensitivityScenario[];
}
