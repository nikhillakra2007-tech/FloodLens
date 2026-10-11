"""Standardized error response schemas for FloodLens API contract."""

from typing import Any
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Predictable error details conforming to Phase 2.5 API contract."""
    code: str = Field(..., description="Machine-readable error code (e.g., NOT_FOUND, VALIDATION_ERROR)")
    message: str = Field(..., description="Human-readable explanation of the error")
    details: dict[str, Any] = Field(default_factory=dict, description="Structured contextual error details")


class ErrorResponse(BaseModel):
    """Standardized root error container."""
    error: ErrorDetail
