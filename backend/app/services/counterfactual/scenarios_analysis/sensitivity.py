"""Sensitivity analysis engine for counterfactual proxy scenarios.

Addresses Phase 2 Limitation L13:
- Tests whether the qualitative counterfactual conclusion (e.g. reduction in excess flow proxy)
  is robust under reasonable input variation (+/-10%, +/-20%).
- Verifies that results do not depend on fine-tuned parameter choices.
- Confirms the model remains explicitly a simplified proxy and not a calibrated hydraulic prediction.
"""

from dataclasses import dataclass, asdict
from typing import Any

from app.services.counterfactual.model import (
    CounterfactualBaseline,
    compute_counterfactual,
    DISCLAIMER,
)
from app.services.counterfactual.scenarios import reduce_runoff_coefficient


@dataclass
class SensitivityScenarioResult:
    variation_label: str
    runoff_coeff_multiplier: float
    capacity_multiplier: float
    rainfall_multiplier: float
    baseline_excess_flow: float
    counterfactual_excess_flow: float
    delta: float
    percent_change: float | None
    is_reduction: bool


@dataclass
class SensitivityAnalysisReport:
    scenario_name: str
    base_delta: float
    base_percent_change: float | None
    total_variations_tested: int
    reductions_count: int
    is_qualitatively_stable: bool
    min_percent_change: float | None
    max_percent_change: float | None
    mean_percent_change: float | None
    disclaimer: str
    variations: list[SensitivityScenarioResult]


def run_counterfactual_sensitivity(
    baseline: CounterfactualBaseline,
    scenario_name: str = "reduce_runoff_0.2",
    reduction_amount: float = 0.2,
) -> SensitivityAnalysisReport:
    """Run multi-parameter sensitivity analysis across +/-10% and +/-20% input variations."""
    variations_to_test = [
        ("nominal", 1.0, 1.0, 1.0),
        ("runoff_+10%", 1.1, 1.0, 1.0),
        ("runoff_-10%", 0.9, 1.0, 1.0),
        ("runoff_+20%", 1.2, 1.0, 1.0),
        ("runoff_-20%", 0.8, 1.0, 1.0),
        ("capacity_+10%", 1.0, 1.1, 1.0),
        ("capacity_-10%", 1.0, 0.9, 1.0),
        ("capacity_+20%", 1.0, 1.2, 1.0),
        ("capacity_-20%", 1.0, 0.8, 1.0),
        ("rainfall_+10%", 1.0, 1.0, 1.1),
        ("rainfall_-10%", 1.0, 1.0, 0.9),
        ("rainfall_+20%", 1.0, 1.0, 1.2),
        ("rainfall_-20%", 1.0, 1.0, 0.8),
        ("compound_high_stress", 1.1, 0.9, 1.1),
        ("compound_low_stress", 0.9, 1.1, 0.9),
    ]

    results: list[SensitivityScenarioResult] = []
    base_delta = 0.0
    base_pct: float | None = None

    for label, r_mult, c_mult, rain_mult in variations_to_test:
        var_base = CounterfactualBaseline(
            rainfall_mm=baseline.rainfall_mm * rain_mult,
            contributing_area_km2=baseline.contributing_area_km2,
            runoff_coefficient=min(1.0, max(0.1, baseline.runoff_coefficient * r_mult)),
            effective_capacity=max(0.0, baseline.effective_capacity * c_mult),
            upstream_impervious_fraction=baseline.upstream_impervious_fraction,
            drainage_path_km=baseline.drainage_path_km,
        )
        var_modified = reduce_runoff_coefficient(var_base, reduction_amount)
        base_out, cf_out, delta, pct = compute_counterfactual(var_base, var_modified)

        if label == "nominal":
            base_delta = delta
            base_pct = pct

        results.append(SensitivityScenarioResult(
            variation_label=label,
            runoff_coeff_multiplier=r_mult,
            capacity_multiplier=c_mult,
            rainfall_multiplier=rain_mult,
            baseline_excess_flow=round(base_out.excess_flow_proxy, 2),
            counterfactual_excess_flow=round(cf_out.excess_flow_proxy, 2),
            delta=round(delta, 2),
            percent_change=round(pct, 2) if pct is not None else None,
            is_reduction=delta < 0,
        ))

    pct_values = [r.percent_change for r in results if r.percent_change is not None]
    reductions = sum(1 for r in results if r.is_reduction)
    stable = reductions == len(results)

    return SensitivityAnalysisReport(
        scenario_name=scenario_name,
        base_delta=round(base_delta, 2),
        base_percent_change=round(base_pct, 2) if base_pct is not None else None,
        total_variations_tested=len(results),
        reductions_count=reductions,
        is_qualitatively_stable=stable,
        min_percent_change=min(pct_values) if pct_values else None,
        max_percent_change=max(pct_values) if pct_values else None,
        mean_percent_change=round(sum(pct_values) / len(pct_values), 2) if pct_values else None,
        disclaimer=DISCLAIMER,
        variations=results,
    )

