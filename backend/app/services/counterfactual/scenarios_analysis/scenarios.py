from app.services.counterfactual.model import CounterfactualBaseline


def reduce_runoff_coefficient(
    baseline: CounterfactualBaseline, reduction_fraction: float
) -> CounterfactualBaseline:
    return CounterfactualBaseline(
        rainfall_mm=baseline.rainfall_mm,
        contributing_area_km2=baseline.contributing_area_km2,
        runoff_coefficient=max(0.0, baseline.runoff_coefficient * (1.0 - reduction_fraction)),
        effective_capacity=baseline.effective_capacity,
        upstream_impervious_fraction=baseline.upstream_impervious_fraction,
        drainage_path_km=baseline.drainage_path_km,
    )


def increase_drainage_capacity(
    baseline: CounterfactualBaseline, increase_fraction: float
) -> CounterfactualBaseline:
    return CounterfactualBaseline(
        rainfall_mm=baseline.rainfall_mm,
        contributing_area_km2=baseline.contributing_area_km2,
        runoff_coefficient=baseline.runoff_coefficient,
        effective_capacity=baseline.effective_capacity * (1.0 + increase_fraction),
        upstream_impervious_fraction=baseline.upstream_impervious_fraction,
        drainage_path_km=baseline.drainage_path_km,
    )


def shorten_drainage_path(
    baseline: CounterfactualBaseline, reduction_fraction: float
) -> CounterfactualBaseline:
    return CounterfactualBaseline(
        rainfall_mm=baseline.rainfall_mm,
        contributing_area_km2=baseline.contributing_area_km2,
        runoff_coefficient=baseline.runoff_coefficient,
        effective_capacity=baseline.effective_capacity,
        upstream_impervious_fraction=baseline.upstream_impervious_fraction,
        drainage_path_km=baseline.drainage_path_km * (1.0 - reduction_fraction),
    )

