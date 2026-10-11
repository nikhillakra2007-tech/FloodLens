from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class CounterfactualRequest(BaseModel):
    scenario_name: str = Field(..., min_length=1, max_length=200)
    runoff_coefficient: float = Field(..., ge=0, le=1)
    contributing_area_km2: float = Field(..., gt=0)
    effective_capacity: float = Field(..., ge=0)
    rainfall_mm: float = Field(..., ge=0)
    upstream_impervious_fraction: float = Field(0.0, ge=0, le=1)
    drainage_path_km: float = Field(0.0, ge=0)


class CounterfactualRunResponse(BaseModel):
    id: UUID
    investigation_id: UUID
    scenario_name: str
    parameters: dict[str, Any]
    baseline_output: float
    counterfactual_output: float
    delta: float
    percent_change: float | None
    disclaimer: str
    mechanism_tested: str = "RUNOFF_GENERATION_SURCHARGE"
    input_features: list[str] = Field(
        default_factory=lambda: [
            "runoff_coefficient",
            "contributing_area_km2",
            "effective_capacity",
            "rainfall_mm",
            "upstream_impervious_fraction",
            "drainage_path_km",
        ]
    )
    baseline_values: dict[str, Any] = Field(default_factory=dict)
    transformed_values: dict[str, Any] = Field(default_factory=dict)
    transformation_rule: str = "Linear rational peak runoff proxy balance: Q = C * I * A - capacity"
    output_metric: str = "peak_discharge_proxy_m3_s"
    sensitivity_run_id: UUID | None = None
    baseline_feature_provenance: str = "ESA WorldCover 10m, Copernicus DEM GLO-30, GCC SWD network"
    is_calibrated_hydraulic_prediction: bool = False
    limitation: str = "Simplified counterfactual proxy — not a calibrated hydraulic prediction."
    created_at: datetime

    model_config = {"from_attributes": True}


class CounterfactualResult(BaseModel):
    baseline_output: float
    counterfactual_output: float
    delta: float
    percent_change: float | None
    disclaimer: str
    parameters: dict[str, Any]
