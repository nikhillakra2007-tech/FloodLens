import { z } from "zod";

export const counterfactualSchema = z.object({
  scenario_name: z.string().min(1).max(200),
  runoff_coefficient: z.number().min(0).max(1),
  contributing_area_km2: z.number().positive(),
  effective_capacity: z.number().min(0),
  rainfall_mm: z.number().min(0),
  upstream_impervious_fraction: z.number().min(0).max(1),
  drainage_path_km: z.number().min(0),
});

export type CounterfactualInput = z.infer<typeof counterfactualSchema>;
