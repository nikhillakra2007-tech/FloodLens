from dataclasses import dataclass, field
from uuid import UUID


@dataclass
class HistoricalEventAssessment:
    event_id: UUID
    event_type: str
    rainfall_mm: float | None
    observed_flood: bool
    mechanism_signals: dict[str, float] = field(default_factory=dict)


@dataclass
class HistoricalValidation:
    investigation_id: UUID
    result: str
    event_count: int
    recurring_mechanisms: list[str]
    confidence: float
    explanation: str


def validate_historical_pattern(
    investigation_id: UUID,
    events: list[HistoricalEventAssessment],
    proposed_mechanism: str | None,
) -> HistoricalValidation:
    if not events:
        return HistoricalValidation(
            investigation_id=investigation_id,
            result="INSUFFICIENT_DATA",
            event_count=0,
            recurring_mechanisms=[],
            confidence=0.0,
            explanation="No historical events available for this location",
        )

    flood_events = [e for e in events if e.observed_flood]
    if not flood_events:
        return HistoricalValidation(
            investigation_id=investigation_id,
            result="WEAK_SUPPORT",
            event_count=len(events),
            recurring_mechanisms=[],
            confidence=0.2,
            explanation=f"{len(events)} events found but none observed flooding",
        )

    if proposed_mechanism:
        matching = sum(
            1 for e in flood_events if proposed_mechanism in e.mechanism_signals
        )
        ratio = matching / len(flood_events)
        if ratio >= 0.7:
            result = "RECURRING_SUPPORT"
            confidence = min(0.9, 0.5 + ratio * 0.4)
        elif ratio >= 0.4:
            result = "MIXED"
            confidence = 0.4 + ratio * 0.3
        else:
            result = "WEAK_SUPPORT"
            confidence = 0.2 + ratio * 0.2
        recurring = [proposed_mechanism] if ratio >= 0.4 else []
    else:
        result = "INSUFFICIENT_DATA"
        confidence = 0.1
        recurring = []

    return HistoricalValidation(
        investigation_id=investigation_id,
        result=result,
        event_count=len(events),
        recurring_mechanisms=recurring,
        confidence=confidence,
        explanation=(
            f"{len(flood_events)}/{len(events)} events observed flooding; "
            f"proposed mechanism '{proposed_mechanism}' matched {len(flood_events) and sum(1 for e in flood_events if proposed_mechanism in e.mechanism_signals)} events"
        ),
    )
