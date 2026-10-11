"""Multi-event historical validation engine for evaluating mechanism recurrence.

Addresses Phase 1 Limitations L1 and L12:
- Case 001 only had the 2015 flood and returned WEAK_SUPPORT.
- Evaluates recurrence across multiple independent Chennai events (2015, 2021, 2023).
- Evaluates whether the same physical mechanism / relationship repeatedly appears.
- Produces scientifically defensible outcomes strictly compliant with DB constraints:
  * STRONG_SUPPORT
  * MODERATE_SUPPORT
  * WEAK_SUPPORT
  * MIXED
  * INSUFFICIENT_DATA
- Persists ValidationRun records with full event breakdown.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.flood_models import FloodEvent, FloodObservation
from app.db.models.investigation_models import Investigation
from app.db.models.location_models import Place
from app.db.models.phase2_models import ValidationRun


@dataclass
class EventSignalEvaluation:
    event_id: UUID
    event_year: int
    event_name: str
    observed_flooding_a: bool
    observed_flooding_b: bool
    supports_mechanism: bool
    contradicts_mechanism: bool
    notes: str


@dataclass
class MultiEventValidationResult:
    investigation_id: UUID
    proposed_mechanism: str | None
    event_count: int
    supporting_event_count: int
    contradicting_event_count: int
    inconclusive_event_count: int
    result: str  # 'STRONG_SUPPORT', 'MODERATE_SUPPORT', 'WEAK_SUPPORT', 'MIXED', 'INSUFFICIENT_DATA'
    confidence: float
    recurring_mechanisms: list[str]
    explanation: str
    event_evaluations: list[EventSignalEvaluation] = field(default_factory=list)


def evaluate_event_recurrence(
    db: Session,
    place_a_id: UUID,
    place_b_id: UUID,
    proposed_mechanism: str | None,
) -> list[EventSignalEvaluation]:
    """Evaluate whether flooding contrast between place A and B recurs across recorded events."""
    events = list(db.scalars(select(FloodEvent).order_by(FloodEvent.started_at.asc())).all())
    evaluations = []

    for event in events:
        year = event.started_at.year if event.started_at else 2015
        name = event.description or f"Chennai Flood {year}"

        # Fetch observations for A and B in this event
        obs_a = list(db.scalars(
            select(FloodObservation).where(
                FloodObservation.event_id == event.id,
                FloodObservation.place_id == place_a_id,
            )
        ).all())
        obs_b = list(db.scalars(
            select(FloodObservation).where(
                FloodObservation.event_id == event.id,
                FloodObservation.place_id == place_b_id,
            )
        ).all())

        depth_a = max(((o.depth_cm or 0.0) for o in obs_a), default=0.0) if obs_a else 0.0
        depth_b = max(((o.depth_cm or 0.0) for o in obs_b), default=0.0) if obs_b else 0.0
        flood_a = depth_a > 10.0
        flood_b = depth_b > 10.0

        # Mechanism-specific contrast logic:
        # If A experienced flooding and B had lower or no flooding -> consistent pattern
        supports = False
        contradicts = False

        if flood_a and not flood_b:
            supports = True
            notes = f"{year}: Consistent with candidate mechanism (A flooded, B mitigated/less flooded)."
        elif not flood_a and flood_b:
            contradicts = True
            notes = f"{year}: Contradicts candidate mechanism (B flooded while A did not)."
        elif flood_a and flood_b:
            # Differential depth disparity check:
            # Regional severe event inundated both A and B. Must show disparity (e.g. depth_a - depth_b >= 10.0 cm)
            if (depth_a - depth_b) >= 10.0:
                supports = True
                notes = f"{year}: Differential flood disparity observed (A: {depth_a}cm vs B: {depth_b}cm)."
            elif (depth_b - depth_a) >= 10.0:
                contradicts = True
                notes = f"{year}: Contradicts candidate mechanism (B flooded deeper than A: {depth_b}cm vs {depth_a}cm)."
            else:
                notes = f"{year}: Inconclusive - Uniform regional inundation without significant differential depth disparity (A: {depth_a}cm, B: {depth_b}cm)."
        else:
            notes = f"{year}: Inconclusive or no recorded local inundation for both locations."

        evaluations.append(EventSignalEvaluation(
            event_id=event.id,
            event_year=year,
            event_name=name,
            observed_flooding_a=flood_a,
            observed_flooding_b=flood_b,
            supports_mechanism=supports,
            contradicts_mechanism=contradicts,
            notes=notes,
        ))

    return evaluations


def validate_multi_event(
    db: Session,
    investigation_id: UUID,
    place_a_id: UUID,
    place_b_id: UUID,
    proposed_mechanism: str | None,
    method_version: str = "v2_multi_event",
) -> MultiEventValidationResult:
    """Run multi-event historical validation across all ingested flood events."""
    if not proposed_mechanism or proposed_mechanism == "INSUFFICIENT_EVIDENCE":
        return MultiEventValidationResult(
            investigation_id=investigation_id,
            proposed_mechanism=proposed_mechanism,
            event_count=0,
            supporting_event_count=0,
            contradicting_event_count=0,
            inconclusive_event_count=0,
            result="INSUFFICIENT_DATA",
            confidence=0.1,
            recurring_mechanisms=[],
            explanation="No candidate causal mechanism identified to validate against historical events.",
        )

    evaluations = evaluate_event_recurrence(db, place_a_id, place_b_id, proposed_mechanism)
    total_events = len(evaluations)

    if total_events == 0:
        return MultiEventValidationResult(
            investigation_id=investigation_id,
            proposed_mechanism=proposed_mechanism,
            event_count=0,
            supporting_event_count=0,
            contradicting_event_count=0,
            inconclusive_event_count=0,
            result="INSUFFICIENT_DATA",
            confidence=0.0,
            recurring_mechanisms=[],
            explanation="No independent historical flood events found in the database.",
        )

    supporting = sum(1 for e in evaluations if e.supports_mechanism)
    contradicting = sum(1 for e in evaluations if e.contradicts_mechanism)
    inconclusive = total_events - (supporting + contradicting)

    # Scientific Audit: Sample size N=3 with static land-cover cannot claim STRONG_SUPPORT (0.85).
    # Static 2020 ESA WorldCover is reused across all events. Historical land-cover change is unobserved.
    # Therefore confidence is bounded and categorized as MODERATE_SUPPORT at best.
    if total_events == 1:
        result = "WEAK_SUPPORT" if supporting == 1 else "MIXED"
        confidence = 0.25
        explanation = (
            f"Only 1 historical event available ({evaluations[0].event_year}). "
            f"Statistical confidence is bounded (WEAK_SUPPORT) to prevent overclaiming from single sample."
        )
    elif total_events >= 5 and supporting >= 4 and contradicting == 0:
        result = "STRONG_SUPPORT"
        confidence = 0.80
        explanation = (
            f"Strong historical support across {total_events} independent events "
            f"({', '.join(str(e.event_year) for e in evaluations)}). Candidate mechanism '{proposed_mechanism}' "
            f"consistently accounts for observed flood contrasts with 0 contradicting events."
        )
    elif supporting >= 2 and contradicting == 0:
        result = "MODERATE_SUPPORT"
        confidence = 0.60
        explanation = (
            f"Moderate historical support across {total_events} events ({', '.join(str(e.event_year) for e in evaluations)}). "
            f"Relative flood depth disparity (A > B) recurred across {supporting} events. "
            f"Statistical confidence is bounded to 0.60 because sample size is small (N={total_events}), "
            f"and static 2020 land-cover/terrain features are reused without multi-temporal historical land-cover observations."
        )
    elif supporting > 0 and contradicting > 0:
        result = "MIXED"
        confidence = 0.40
        explanation = (
            f"Mixed historical evidence across {total_events} events: {supporting} supporting vs {contradicting} contradicting. "
            f"Physical vulnerability may vary depending on event-specific rainfall intensity or antecedent wetness."
        )
    else:
        result = "WEAK_SUPPORT"
        confidence = 0.20
        explanation = (
            f"Weak historical support across {total_events} events ({supporting} supporting, {contradicting} contradicting). "
            f"Insufficient recurring signal for candidate mechanism '{proposed_mechanism}'."
        )

    recurring = [proposed_mechanism] if (supporting >= 2 and contradicting == 0) else []

    return MultiEventValidationResult(
        investigation_id=investigation_id,
        proposed_mechanism=proposed_mechanism,
        event_count=total_events,
        supporting_event_count=supporting,
        contradicting_event_count=contradicting,
        inconclusive_event_count=inconclusive,
        result=result,
        confidence=confidence,
        recurring_mechanisms=recurring,
        explanation=explanation,
        event_evaluations=evaluations,
    )


def save_validation_run(
    db: Session,
    validation_res: MultiEventValidationResult,
    method_version: str = "v2_multi_event",
) -> ValidationRun:
    """Persist validation run to database."""
    # Remove prior runs for this investigation to remain idempotent
    db.query(ValidationRun).filter(ValidationRun.investigation_id == validation_res.investigation_id).delete()

    run = ValidationRun(
        investigation_id=validation_res.investigation_id,
        proposed_mechanism=validation_res.proposed_mechanism,
        event_count=validation_res.event_count,
        supporting_event_count=validation_res.supporting_event_count,
        contradicting_event_count=validation_res.contradicting_event_count,
        inconclusive_event_count=validation_res.inconclusive_event_count,
        result=validation_res.result,
        confidence=validation_res.confidence,
        recurring_mechanisms={"mechanisms": validation_res.recurring_mechanisms},
        explanation=validation_res.explanation,
        method_version=method_version,
    )
    db.add(run)
    db.flush()
    return run

