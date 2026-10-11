"""Pydantic schemas for scientific limitations and claim provenance tracing."""

from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.enums import LimitationSeverity


class InvestigationLimitationResponse(BaseModel):
    """Explicit scientific limitation for an investigation."""
    id: str = Field(..., description="Unique limitation identifier")
    limitation: str = Field(..., description="Short canonical name of the limitation")
    severity: LimitationSeverity = Field(..., description="Severity level: HIGH, MEDIUM, LOW")
    source: str = Field(..., description="Underlying data or methodology source")
    affected_feature: str = Field(..., description="Model or feature affected by this limitation")
    explanation: str = Field(..., description="Full scientific explanation of limitation impact")


class ClaimProvenanceStep(BaseModel):
    """Deterministic step in a claim's evidence provenance chain."""
    level: str = Field(..., description="Lineage level (claim, evidence, feature, derivation, source_file, dataset_version, source)")
    identifier: str = Field(..., description="Stable ID or key for this lineage node")
    name: str = Field(..., description="Human-readable node description")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Metadata or parameters (without filesystem paths)")


class ClaimProvenanceResponse(BaseModel):
    """End-to-end provenance response tracing claim to source without leaking server filesystem paths."""
    investigation_id: UUID
    evidence_id: UUID
    claim: str
    mechanism_type: str
    chain: list[ClaimProvenanceStep] = Field(default_factory=list)
