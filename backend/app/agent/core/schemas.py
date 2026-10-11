from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class AgentInvestigationInput(BaseModel):
    investigation_id: UUID
    place_a_id: UUID
    place_b_id: UUID
    comparison_id: UUID


class AgentInvestigationOutput(BaseModel):
    investigation_summary: str
    strongest_mechanism: str | None = None
    supporting_evidence: list[str] = []
    alternative_mechanisms: list[str] = []
    counterfactual_result: str | None = None
    historical_validation: str | None = None
    unknowns: list[str] = []
    confidence: float = Field(..., ge=0.0, le=1.0)
    certainty_classification: dict[str, str] = {}


class ToolResult(BaseModel):
    tool_name: str
    success: bool
    data: dict[str, Any] = {}
    error: str | None = None
