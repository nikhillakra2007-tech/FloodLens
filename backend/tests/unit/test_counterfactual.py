from app.services.counterfactual.model import CounterfactualBaseline, compute_baseline, compute_counterfactual


def test_baseline_runoff_positive():
    params = CounterfactualBaseline(
        rainfall_mm=100.0,
        contributing_area_km2=5.0,
        runoff_coefficient=0.7,
        effective_capacity=100.0,
    )
    result = compute_baseline(params)
    assert result.runoff_proxy == 350.0
    assert result.excess_flow_proxy == 250.0


def test_zero_capacity():
    params = CounterfactualBaseline(
        rainfall_mm=50.0,
        contributing_area_km2=2.0,
        runoff_coefficient=0.5,
        effective_capacity=0.0,
    )
    result = compute_baseline(params)
    assert result.excess_flow_proxy == 50.0


def test_zero_runoff():
    params = CounterfactualBaseline(
        rainfall_mm=100.0,
        contributing_area_km2=5.0,
        runoff_coefficient=0.0,
        effective_capacity=50.0,
    )
    result = compute_baseline(params)
    assert result.excess_flow_proxy == 0.0


def test_counterfactual_delta():
    baseline = CounterfactualBaseline(
        rainfall_mm=100.0,
        contributing_area_km2=5.0,
        runoff_coefficient=0.7,
        effective_capacity=100.0,
    )
    modified = CounterfactualBaseline(
        rainfall_mm=100.0,
        contributing_area_km2=5.0,
        runoff_coefficient=0.5,
        effective_capacity=100.0,
    )
    b_out, c_out, delta, pct = compute_counterfactual(baseline, modified)
    assert b_out.excess_flow_proxy == 250.0
    assert c_out.excess_flow_proxy == 150.0
    assert delta == -100.0
    assert pct is not None


def test_counterfactual_zero_baseline():
    baseline = CounterfactualBaseline(
        rainfall_mm=10.0,
        contributing_area_km2=1.0,
        runoff_coefficient=0.1,
        effective_capacity=100.0,
    )
    modified = CounterfactualBaseline(
        rainfall_mm=10.0,
        contributing_area_km2=1.0,
        runoff_coefficient=0.05,
        effective_capacity=100.0,
    )
    b_out, c_out, delta, pct = compute_counterfactual(baseline, modified)
    assert b_out.excess_flow_proxy == 0.0
    assert pct is None
