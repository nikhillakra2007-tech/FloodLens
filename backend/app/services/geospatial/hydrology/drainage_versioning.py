"""Drainage network versioning and event temporal alignment service.

Addresses Phase 1 Limitation L4:
- The flood event occurred in 2015 while initial drainage survey came from 2023.
- Tracks multiple network survey versions (2015-era baseline, 2021 survey, 2023 survey).
- Explicitly assesses alignment between EVENT DATE and DRAINAGE DATA DATE:
  * EVENT_ALIGNED: survey conducted within +/- 1 year of event.
  * TEMPORALLY_MISMATCHED: multi-year gap between event and network survey.
  * UNKNOWN: survey date or event date unrecorded.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.flood_models import FloodEvent
from app.db.models.phase2_models import DrainageNetworkVersion


@dataclass
class DrainageAlignmentAssessment:
    status: str  # 'EVENT_ALIGNED', 'TEMPORALLY_MISMATCHED', 'UNKNOWN'
    event_year: int | None
    drainage_survey_year: int | None
    temporal_gap_years: int | None
    network_version: str
    is_aligned: bool
    explanation: str


def assess_drainage_alignment(
    event_date: datetime | str | None,
    network_version: DrainageNetworkVersion | dict[str, Any] | None,
) -> DrainageAlignmentAssessment:
    """Assess whether drainage evidence is EVENT_ALIGNED, TEMPORALLY_MISMATCHED, or UNKNOWN."""
    if not event_date or not network_version:
        return DrainageAlignmentAssessment(
            status="UNKNOWN",
            event_year=None,
            drainage_survey_year=None,
            temporal_gap_years=None,
            network_version="unknown",
            is_aligned=False,
            explanation="Cannot determine temporal alignment because event date or drainage version is missing.",
        )

    # Extract event year
    if isinstance(event_date, datetime):
        event_year = event_date.year
    else:
        try:
            event_year = int(str(event_date)[:4])
        except Exception:
            event_year = None

    if event_year is None:
        return DrainageAlignmentAssessment(
            status="UNKNOWN",
            event_year=None,
            drainage_survey_year=None,
            temporal_gap_years=None,
            network_version="unknown",
            is_aligned=False,
            explanation="Invalid event date format.",
        )

    survey_year = (
        network_version.survey_year
        if hasattr(network_version, "survey_year")
        else network_version.get("survey_year")
    )
    version_name = (
        network_version.version
        if hasattr(network_version, "version")
        else network_version.get("version", "unknown")
    )

    if survey_year is None:
        return DrainageAlignmentAssessment(
            status="UNKNOWN",
            event_year=event_year,
            drainage_survey_year=None,
            temporal_gap_years=None,
            network_version=version_name,
            is_aligned=False,
            explanation=f"Survey year unrecorded for drainage network version {version_name}.",
        )

    gap = abs(event_year - survey_year)
    if gap <= 1:
        return DrainageAlignmentAssessment(
            status="EVENT_ALIGNED",
            event_year=event_year,
            drainage_survey_year=survey_year,
            temporal_gap_years=gap,
            network_version=version_name,
            is_aligned=True,
            explanation=(
                f"Drainage evidence is EVENT_ALIGNED: Flood event ({event_year}) occurred in the same temporal era "
                f"as the network survey ({survey_year}). Infrastructure modifications between event and survey are minimal."
            ),
        )
    else:
        direction = "post-event" if survey_year > event_year else "pre-event"
        return DrainageAlignmentAssessment(
            status="TEMPORALLY_MISMATCHED",
            event_year=event_year,
            drainage_survey_year=survey_year,
            temporal_gap_years=gap,
            network_version=version_name,
            is_aligned=False,
            explanation=(
                f"Drainage evidence is TEMPORALLY_MISMATCHED: Flood event occurred in {event_year}, while drainage "
                f"network data is from a {survey_year} {direction} survey ({gap} year difference). "
                f"Substantial infrastructure enhancements occurred in Chennai during this period (Singara Chennai 2.0 / World Bank SWD program)."
            ),
        )
