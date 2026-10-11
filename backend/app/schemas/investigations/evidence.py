from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.schemas.enums import CertaintyLevel


class EvidenceItemResponse(BaseModel):
    id: UUID
    evidence_id: UUID | None = None
    investigation_id: UUID
    mechanism_type: str
    certainty_level: str = CertaintyLevel.SUPPORTED.value
    claim: str
    value: float | None = None
    unit: str | None = None
    source: str
    source_id: UUID | None = None
    dataset_version_id: UUID | None = None
    feature_derivation_id: UUID | None = None
    spatial_ref: str | None = None
    temporal_ref: str | None = None
    support_score: float = 0.0
    explanation: str | None = None
    source_independence: str = "INDEPENDENT_SOURCE"
    limitations: list[str] = Field(default_factory=list)
    extra_data: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def populate_evidence_id(self) -> "EvidenceItemResponse":
        if self.evidence_id is None:
            self.evidence_id = self.id
        return self


class MechanismResponse(BaseModel):
    id: UUID
    comparison_id: UUID
    mechanism_type: str
    score: float
    confidence: float
    certainty: str = CertaintyLevel.SUPPORTED.value
    confidence_meaning: str | None = None
    rank: int | None = None
    supporting_evidence_ids: list[UUID] = Field(default_factory=list)
    limiting_evidence_ids: list[UUID] = Field(default_factory=list)
    explanation: str | None = None
    signal_values: dict[str, Any] = Field(default_factory=dict)

    model_config = {"from_attributes": True}


class MechanismGraphNode(BaseModel):
    id: str
    label: str
    node_type: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class MechanismGraphEdge(BaseModel):
    source: str
    target: str
    mechanism: str
    evidence_ids: list[UUID]
    certainty_level: str
    relation_type: str = "CORRELATION"
    support_score: float
    label: str


class MechanismGraphResponse(BaseModel):
    investigation_id: UUID
    nodes: list[MechanismGraphNode]
    edges: list[MechanismGraphEdge]

