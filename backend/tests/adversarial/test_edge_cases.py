from app.services.comparison.similarity import FeatureVector, weighted_similarity
from app.services.counterfactual.model import CounterfactualBaseline, compute_baseline
from app.services.validation.historical import HistoricalEventAssessment, validate_historical_pattern
from uuid import uuid4


def test_empty_candidate_set():
    a = FeatureVector(rainfall_mm=100.0)
    b = FeatureVector(rainfall_mm=100.0)
    score, _ = weighted_similarity(a, b)
    assert score == 1.0


def test_all_none_features():
    a = FeatureVector()
    b = FeatureVector()
    score, _ = weighted_similarity(a, b)
    assert score == 1.0


def test_counterfactual_zero_baseline_no_crash():
    params = CounterfactualBaseline(
        rainfall_mm=10.0,
        contributing_area_km2=1.0,
        runoff_coefficient=0.1,
        effective_capacity=100.0,
    )
    result = compute_baseline(params)
    assert result.excess_flow_proxy == 0.0


def test_historical_validation_no_events():
    result = validate_historical_pattern(uuid4(), [], None)
    assert result.result == "INSUFFICIENT_DATA"


def test_historical_validation_no_flood():
    events = [HistoricalEventAssessment(
        event_id=uuid4(),
        event_type="monsoon",
        rainfall_mm=50.0,
        observed_flood=False,
    )]
    result = validate_historical_pattern(uuid4(), events, None)
    assert result.result == "WEAK_SUPPORT"


def test_historical_validation_recurring():
    events = [HistoricalEventAssessment(
        event_id=uuid4(),
        event_type="monsoon",
        rainfall_mm=100.0,
        observed_flood=True,
        mechanism_signals={"RUNOFF_CONCENTRATION": 0.8},
    ) for _ in range(3)]
    result = validate_historical_pattern(uuid4(), events, "RUNOFF_CONCENTRATION")
    assert result.result == "RECURRING_SUPPORT"


def test_historical_validation_mixed():
    events = [
        HistoricalEventAssessment(
            event_id=uuid4(),
            event_type="monsoon",
            rainfall_mm=100.0,
            observed_flood=True,
            mechanism_signals={"RUNOFF_CONCENTRATION": 0.8},
        ),
        HistoricalEventAssessment(
            event_id=uuid4(),
            event_type="monsoon",
            rainfall_mm=100.0,
            observed_flood=True,
            mechanism_signals={"TERRAIN_DEPRESSION": 0.6},
        ),
    ]
    result = validate_historical_pattern(uuid4(), events, "RUNOFF_CONCENTRATION")
    assert result.result == "MIXED"
