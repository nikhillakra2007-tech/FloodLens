from app.services.comparison.similarity import FeatureVector, weighted_similarity


def test_identical_vectors_have_perfect_similarity():
    a = FeatureVector(rainfall_mm=100.0, mean_elevation=5.0, hand=2.0, builtup_fraction=0.7)
    b = FeatureVector(rainfall_mm=100.0, mean_elevation=5.0, hand=2.0, builtup_fraction=0.7)
    score, feats = weighted_similarity(a, b)
    assert score == 1.0


def test_different_vectors_have_lower_similarity():
    a = FeatureVector(rainfall_mm=100.0, mean_elevation=5.0, hand=2.0, builtup_fraction=0.7)
    b = FeatureVector(rainfall_mm=50.0, mean_elevation=15.0, hand=8.0, builtup_fraction=0.3)
    score, feats = weighted_similarity(a, b)
    assert score < 1.0
    assert score >= 0.0


def test_missing_values_do_not_crash():
    a = FeatureVector(rainfall_mm=None, mean_elevation=5.0)
    b = FeatureVector(rainfall_mm=100.0, mean_elevation=None)
    score, feats = weighted_similarity(a, b)
    assert 0.0 <= score <= 1.0


def test_weights_are_configurable():
    a = FeatureVector(rainfall_mm=100.0, mean_elevation=5.0)
    b = FeatureVector(rainfall_mm=50.0, mean_elevation=15.0)
    score_default, _ = weighted_similarity(a, b)
    score_custom, _ = weighted_similarity(a, b, {"rainfall": 1.0, "terrain": 0.0})
    assert score_default != score_custom
