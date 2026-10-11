from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class SimilarityBreakdown(BaseModel):
    rainfall_similarity: float | None = None
    terrain_similarity: float | None = None
    drainage_similarity: float | None = None
    landcover_similarity: float | None = None
    spatial_similarity: float | None = None
    event_similarity: float | None = None

    model_config = {"extra": "allow"}


class ComparisonResponse(BaseModel):
    id: UUID
    place_a_id: UUID
    place_b_id: UUID
    similarity_score: float
    weights_version: str
    feature_similarities: dict[str, float]
    similarity_breakdown: dict[str, float] = Field(default_factory=dict)
    reasons: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def sync_breakdown(self) -> "ComparisonResponse":
        if not self.similarity_breakdown and self.feature_similarities:
            mapped = dict(self.feature_similarities)
            for k, v in list(self.feature_similarities.items()):
                if not k.endswith("_similarity"):
                    mapped[f"{k}_similarity"] = v
                if k == "land_cover":
                    mapped["landcover_similarity"] = v
                if "drainage" in k:
                    mapped["drainage_similarity"] = v
            self.similarity_breakdown = mapped
        return self


class ComparisonCreateRequest(BaseModel):
    place_a_id: UUID
    place_b_id: UUID


class InvestigationCreateResponse(BaseModel):
    id: UUID
    comparison_id: UUID
    status: str
    agent_mode: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoricalValidationResult(BaseModel):
    investigation_id: UUID
    result: str
    event_count: int
    recurring_mechanisms: list[str]
    confidence: float
    explanation: str


class InvestigationResponse(BaseModel):
    id: UUID
    comparison_id: UUID
    status: str
    agent_mode: str
    summary: str | None
    strongest_mechanism: str | None
    agent_response: dict[str, Any]
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class InvestigationDetailResponse(InvestigationResponse):
    investigation_id: UUID | None = None
    place_a: dict[str, Any] | None = None
    place_b: dict[str, Any] | None = None
    comparison: dict[str, Any] | None = None
    mechanisms: list[Any] = []
    evidence: list[Any] = []
    validation: dict[str, Any] | None = None
    defensibility: dict[str, Any] | None = None
    counterfactual: dict[str, Any] | None = None
    limitations: list[Any] = []
    provenance_summary: dict[str, Any] | None = None

    model_config = {"from_attributes": True, "extra": "allow"}

