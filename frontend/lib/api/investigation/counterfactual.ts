import { fetchApi } from "@/lib/api/client";
import type { CounterfactualRequest, CounterfactualRun, SensitivityReport } from "@/lib/types/counterfactual";

export function runCounterfactual(
  investigationId: string,
  params: CounterfactualRequest
): Promise<CounterfactualRun> {
  return fetchApi<CounterfactualRun>(`/investigations/${investigationId}/counterfactual`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function runSensitivity(
  investigationId: string,
  params: CounterfactualRequest
): Promise<SensitivityReport> {
  return fetchApi<SensitivityReport>(`/investigations/${investigationId}/counterfactual/sensitivity`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
