from dataclasses import dataclass


@dataclass
class CounterfactualBaseline:
    rainfall_mm: float
    contributing_area_km2: float
    runoff_coefficient: float
    effective_capacity: float
    upstream_impervious_fraction: float = 0.0
    drainage_path_km: float = 0.0


@dataclass
class CounterfactualOutput:
    runoff_proxy: float
    drainage_capacity: float
    excess_flow_proxy: float


DISCLAIMER = "Simplified counterfactual proxy — not a calibrated hydraulic prediction."


def compute_baseline(params: CounterfactualBaseline) -> CounterfactualOutput:
    runoff_proxy = params.rainfall_mm * params.contributing_area_km2 * params.runoff_coefficient
    drainage_capacity = params.effective_capacity
    excess_flow_proxy = max(0.0, runoff_proxy - drainage_capacity)
    return CounterfactualOutput(
        runoff_proxy=runoff_proxy,
        drainage_capacity=drainage_capacity,
        excess_flow_proxy=excess_flow_proxy,
    )


def compute_counterfactual(
    baseline_params: CounterfactualBaseline,
    modified_params: CounterfactualBaseline,
) -> tuple[CounterfactualOutput, CounterfactualOutput, float, float | None]:
    baseline_out = compute_baseline(baseline_params)
    counterfactual_out = compute_baseline(modified_params)
    delta = counterfactual_out.excess_flow_proxy - baseline_out.excess_flow_proxy
    if abs(baseline_out.excess_flow_proxy) > 1e-12:
        percent_change = (delta / baseline_out.excess_flow_proxy) * 100.0
    else:
        percent_change = None
    return baseline_out, counterfactual_out, delta, percent_change

