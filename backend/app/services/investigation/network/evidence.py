from dataclasses import dataclass, field
from typing import Any
from uuid import UUID


@dataclass
class EvidenceItemData:
    mechanism_type: str
    certainty_level: str
    claim: str
    value: float | None = None
    unit: str | None = None
    source: str = ""
    spatial_ref: str | None = None
    temporal_ref: str | None = None
    support_score: float = 0.0
    explanation: str = ""
    metadata_: dict[str, Any] = field(default_factory=dict)


def build_evidence_for_mechanism(
    mechanism_type: str,
    signal_values: dict[str, Any],
    source: str,
) -> list[EvidenceItemData]:
    items = []

    if mechanism_type == "RUNOFF_CONCENTRATION":
        if "upstream_built_diff" in signal_values:
            items.append(EvidenceItemData(
                mechanism_type=mechanism_type,
                certainty_level="SUPPORTED",
                claim="Higher upstream built-up fraction is consistent with greater runoff concentration",
                value=signal_values["upstream_built_diff"],
                unit="fraction",
                source=source,
                support_score=0.7,
                explanation="Upstream built-up fraction difference suggests differential runoff generation",
            ))
    elif mechanism_type == "DRAINAGE_CAPACITY":
        if "capacity_ratio" in signal_values:
            items.append(EvidenceItemData(
                mechanism_type=mechanism_type,
                certainty_level="SUPPORTED",
                claim="Lower estimated effective capacity is consistent with reduced drainage throughput",
                value=signal_values["capacity_ratio"],
                unit="ratio",
                source=source,
                support_score=0.6,
                explanation="Effective capacity proxy derived from segment dimensions",
            ))
    elif mechanism_type == "DRAINAGE_CONNECTIVITY":
        if signal_values.get("connectivity_diff") is not None:
            items.append(EvidenceItemData(
                mechanism_type=mechanism_type,
                certainty_level="SUPPORTED",
                claim="Network connectivity difference detected",
                value=signal_values["connectivity_diff"],
                unit="boolean_diff",
                source=source,
                support_score=0.6,
                explanation="Connectivity determined from segment graph analysis",
            ))
    elif mechanism_type == "TERRAIN_DEPRESSION":
        if "hand_diff" in signal_values:
            items.append(EvidenceItemData(
                mechanism_type=mechanism_type,
                certainty_level="FACT",
                claim="Height Above Nearest Drain (HAND) difference indicates terrain depression context",
                value=signal_values["hand_diff"],
                unit="m",
                source=source,
                support_score=0.8,
                explanation="HAND computed from Copernicus DEM GLO-30",
            ))
    elif mechanism_type == "OUTFALL_RESTRICTION":
        if "distance_diff" in signal_values:
            items.append(EvidenceItemData(
                mechanism_type=mechanism_type,
                certainty_level="SUPPORTED",
                claim="Greater distance to outfall is consistent with restricted outflow",
                value=signal_values["distance_diff"],
                unit="m",
                source=source,
                support_score=0.6,
                explanation="Outfall distance computed from drainage network geometry",
            ))
    elif mechanism_type == "WATERBODY_INTERACTION":
        if "water_fraction_diff" in signal_values:
            items.append(EvidenceItemData(
                mechanism_type=mechanism_type,
                certainty_level="SUPPORTED",
                claim="Higher water fraction indicates potential waterbody interaction",
                value=signal_values["water_fraction_diff"],
                unit="fraction",
                source=source,
                support_score=0.5,
                explanation="Water fraction from ESA WorldCover landcover data",
            ))
    elif mechanism_type == "IMPERVIOUS_SURFACE":
        if "builtup_diff" in signal_values:
            items.append(EvidenceItemData(
                mechanism_type=mechanism_type,
                certainty_level="SUPPORTED",
                claim="Built-up fraction difference (imperviousness-related proxy) suggests differential surface runoff potential",
                value=signal_values["builtup_diff"],
                unit="fraction",
                source=source,
                support_score=0.55,
                explanation="Built-up fraction proxy derived from ESA WorldCover 10m; does not represent parcel-level measured imperviousness.",
            ))

    if not items:
        items.append(EvidenceItemData(
            mechanism_type=mechanism_type,
            certainty_level="UNKNOWN",
            claim="Insufficient evidence to evaluate this mechanism",
            source=source,
            support_score=0.1,
            explanation="No discriminating signals detected from available data",
        ))

    return items

