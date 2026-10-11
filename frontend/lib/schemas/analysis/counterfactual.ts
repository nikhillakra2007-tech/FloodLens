import { z } from "zod";

export const counterfactualRequestSchema = z.object({
  scenario_name: z.string().min(1).max(200),
  runoff_coefficient: z.number().min(0).max(1),
  contributing_area_km2: z.number().positive(),
  effective_capacity: z.number().min(0),
  rainfall_mm: z.number().min(0),
  upstream_impervious_fraction: z.number().min(0).max(1),
  drainage_path_km: z.number().min(0),
});

export const counterfactualRunSchema = z.object({
  id: z.string().uuid(),
  investigation_id: z.string().uuid(),
  scenario_name: z.string(),
  parameters: z.record(z.unknown()),
  baseline_output: z.number(),
  counterfactual_output: z.number(),
  delta: z.number(),
  percent_change: z.number().nullable(),
  disclaimer: z.string(),
  mechanism_tested: z.string(),
  input_features: z.array(z.string()),
  baseline_values: z.record(z.unknown()),
  transformed_values: z.record(z.unknown()),
  transformation_rule: z.string(),
  output_metric: z.string(),
  sensitivity_run_id: z.string().uuid().nullable(),
  baseline_feature_provenance: z.string(),
  is_calibrated_hydraulic_prediction: z.boolean(),
  limitation: z.string(),
  created_at: z.string(),
});

export const sensitivityScenarioSchema = z.object({
  variation_label: z.string(),
  runoff_coeff_multiplier: z.number(),
  capacity_multiplier: z.number(),
  rainfall_multiplier: z.number(),
  baseline_excess_flow: z.number(),
  counterfactual_excess_flow: z.number(),
  delta: z.number(),
  percent_change: z.number().nullable(),
  is_reduction: z.boolean(),
});

export const sensitivityReportSchema = z.object({
  scenario_name: z.string(),
  base_delta: z.number(),
  base_percent_change: z.number().nullable(),
  total_variations_tested: z.number(),
  reductions_count: z.number(),
  is_qualitatively_stable: z.boolean(),
  min_percent_change: z.number().nullable(),
  max_percent_change: z.number().nullable(),
  mean_percent_change: z.number().nullable(),
  disclaimer: z.string(),
  variations: z.array(sensitivityScenarioSchema),
});

export type CounterfactualRequest = z.infer<typeof counterfactualRequestSchema>;
export type CounterfactualRun = z.infer<typeof counterfactualRunSchema>;
export type SensitivityReport = z.infer<typeof sensitivityReportSchema>;
