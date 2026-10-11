"""Unit tests for Phase 2 drainage network versioning and temporal alignment."""

from datetime import datetime, timezone

from app.services.geospatial.drainage_versioning import assess_drainage_alignment


def test_drainage_temporal_mismatch_2015_vs_2023():
    event_date = datetime(2015, 12, 1, tzinfo=timezone.utc)
    net_version = {"version": "GCC_SWD_2023_SURVEY", "survey_year": 2023}

    res = assess_drainage_alignment(event_date, net_version)
    assert res.status == "TEMPORALLY_MISMATCHED"
    assert res.is_aligned is False
    assert res.temporal_gap_years == 8
    assert "Singara Chennai" in res.explanation


def test_drainage_event_aligned_2023_vs_2023():
    event_date = datetime(2023, 12, 4, tzinfo=timezone.utc)
    net_version = {"version": "GCC_SWD_2023_SURVEY", "survey_year": 2023}

    res = assess_drainage_alignment(event_date, net_version)
    assert res.status == "EVENT_ALIGNED"
    assert res.is_aligned is True
    assert res.temporal_gap_years == 0


def test_drainage_event_aligned_within_one_year():
    event_date = datetime(2022, 11, 15, tzinfo=timezone.utc)
    net_version = {"version": "GCC_SWD_2023_SURVEY", "survey_year": 2023}

    res = assess_drainage_alignment(event_date, net_version)
    assert res.status == "EVENT_ALIGNED"
    assert res.is_aligned is True
    assert res.temporal_gap_years == 1


def test_drainage_alignment_unknown_when_missing():
    res = assess_drainage_alignment(None, {"version": "GCC_SWD_2023_SURVEY", "survey_year": 2023})
    assert res.status == "UNKNOWN"
    assert res.is_aligned is False
