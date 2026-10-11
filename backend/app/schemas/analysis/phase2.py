"""Pydantic schemas for Phase 2 expanded entities and endpoints."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class DatasetVersionResponse(BaseModel):
    id: UUID
    source_id: UUID
    version: str
    valid_from: datetime | None
    valid_to: datetime | None
    description: str | None
    file_count: int | None
    record_count: int | None
    geometry_type: str | None
    status: str

    model_config = {"from_attributes": True}


class FeatureDerivationResponse(BaseModel):
    id: UUID
    feature_type: str
    place_id: UUID | None
    event_id: UUID | None
    computation_method: str
    computation_version: str
    output_feature_name: str
    output_value: float | None
    output_unit: str | None
    uncertainty: float | None
    input_source_file_ids: dict[str, Any]

    model_config = {"from_attributes": True}


class RainfallEventFeatureResponse(BaseModel):
    id: UUID
    event_id: UUID
    place_id: UUID | None
    station_id: str | None
    source: str
    spatial_method: str | None
    rainfall_window_start: datetime
    rainfall_window_end: datetime
    cumulative_rainfall_mm: float | None
    peak_interval_rainfall_mm: float | None
    peak_interval_hours: float | None
    mean_intensity_mm_per_hr: float | None
    max_intensity_mm_per_hr: float | None
    duration_hours: float | None
    antecedent_rainfall_24h_mm: float | None
    antecedent_rainfall_72h_mm: float | None
    station_distance_m: float | None
    interpolation_uncertainty: float | None
    confidence_level: str

    model_config = {"from_attributes": True}


class RainfallComparabilityResponse(BaseModel):
    status: str
    confidence: str
    difference_mm: float | None
    relative_difference_pct: float | None
    explanation: str
    feature_a: dict[str, Any] | None = None
    feature_b: dict[str, Any] | None = None


class ContributingAreaProxyResponse(BaseModel):
    id: UUID
    place_id: UUID
    method: str
    method_version: str
    analysis_radius_m: float | None
    area_km2: float | None
    drainage_path_length_m: float | None
    outfall_count: int | None
    upstream_drain_length_m: float | None
    upstream_builtup_fraction: float | None
    upstream_impervious_proxy: float | None
    depression_volume_m3: float | None
    uncertainty: float | None
    is_true_catchment: bool

    model_config = {"from_attributes": True}


class DrainageNetworkVersionResponse(BaseModel):
    id: UUID
    version: str
    survey_year: int | None
    survey_source: str | None
    description: str | None
    segment_count: int | None
    node_count: int | None
    outfall_count: int | None
    total_length_m: float | None
    geometry_provenance: dict[str, Any] | None
    is_event_aligned: bool
    aligned_event_id: UUID | None

    model_config = {"from_attributes": True}


class DrainageSegmentResponse(BaseModel):
    id: UUID
    street_name: str | None
    ward: str | None
    zone: str | None
    drain_type: str
    material: str | None
    is_open: bool | None
    is_inferred: bool
    depth_m: float | None
    width_m: float | None
    length_m: float | None
    condition_status: str | None
    geometry_provenance: str | None

    model_config = {"from_attributes": True}


class OutfallResponse(BaseModel):
    id: UUID
    name: str
    waterbody: str | None
    ward: str | None
    is_inferred: bool
    geometry_provenance: str | None

    model_config = {"from_attributes": True}


class ComparisonExplanationResponse(BaseModel):
    id: UUID
    comparison_id: UUID
    feature_name: str
    feature_category: str
    value_a: float | None
    value_b: float | None
    similarity_score: float
    weight: float
    weighted_contribution: float
    explanation: str | None
    data_quality: str | None

    model_config = {"from_attributes": True}


class ValidationRunResponse(BaseModel):
    id: UUID
    investigation_id: UUID
    proposed_mechanism: str | None
    event_count: int
    supporting_event_count: int
    contradicting_event_count: int
    inconclusive_event_count: int
    result: str
    confidence: float | None
    recurring_mechanisms: dict[str, Any] | None
    explanation: str | None
    method_version: str
    event_ids: list[UUID] = Field(default_factory=list)
    observation_ids: list[UUID] = Field(default_factory=list)
    feature_derivation_ids: list[UUID] = Field(default_factory=list)
    source_datasets: list[str] = Field(
        default_factory=lambda: [
            "IMD/GPM rainfall",
            "TNWRD water level / flood records",
            "Sentinel-1 / Copernicus EMS flood extent",
        ]
    )
    sample_size_n: int = 3
    validation_method: str = "multi_event_consistency_triangulation"
    validation_status: str | None = None
    limitations: list[str] = Field(
        default_factory=lambda: [
            "N=3 multi-event historical sample does not justify strong certainty; unobserved antecedent conditions and temporal drainage alterations may exist."
        ]
    )

    model_config = {"from_attributes": True}


class DrainageStatsResponse(BaseModel):
    ward: str | None = None
    segment_count: int
    total_length_m: float
    inferred_count: int


class SourceFileResponse(BaseModel):
    id: UUID
    source_id: UUID
    file_path: str
    file_key: str | None = None
    file_name: str | None = None
    sha256: str
    file_size_bytes: int | None
    record_count: int | None
    format: str | None
    validation_status: str
    ingested_at: datetime

    model_config = {"from_attributes": True}

    def __init__(self, **data: Any):
        super().__init__(**data)
        import os
        raw = self.file_path or ""
        self.file_name = os.path.basename(raw)
        norm = raw.replace("\\", "/")
        if "data" in norm.split("/"):
            parts = norm.split("/")
            idx = parts.index("data")
            self.file_key = "/".join(parts[idx:])
        else:
            self.file_key = os.path.basename(raw)
        self.file_path = self.file_key


class DataSourceResponse(BaseModel):
    id: UUID
    name: str
    trust_level: str
    license: str | None
    attribution: str | None
    url: str | None
    description: str | None
    version: str | None
    files: list[SourceFileResponse] = []
    versions: list[DatasetVersionResponse] = []

    model_config = {"from_attributes": True}


class GateResultResponse(BaseModel):
    gate_name: str
    status: str
    confidence: float
    description: str
    explanation: str | None = None
    reason: str | None = None
    gate_type: str = "CORRELATION"
    evidence_ids: list[UUID] = Field(default_factory=list)
    limitations: list[str] = []

    def __init__(self, **data: Any):
        if "explanation" not in data and "description" in data:
            data["explanation"] = data["description"]
        elif "description" not in data and "explanation" in data:
            data["description"] = data["explanation"]
        if "reason" not in data and "description" in data:
            data["reason"] = data["description"]
        name = data.get("name") or data.get("gate_name") or ""
        causal_gates = {"independent_mechanism_evidence", "temporal_alignment", "causal_mechanism_specificity"}
        if "gate_type" not in data or data["gate_type"] not in ("CORRELATION", "CAUSAL"):
            if name in causal_gates:
                data["gate_type"] = "CAUSAL"
            else:
                data["gate_type"] = "CORRELATION"
        super().__init__(**data)


class DefensibilityAssessmentResponse(BaseModel):
    investigation_id: UUID
    place_a_id: UUID
    place_b_id: UUID
    proposed_mechanism: str | None
    verdict: str
    correlation_gates_passed: int
    causal_gates_passed: int
    total_gates: int
    gates: dict[str, GateResultResponse]
    correlation_gates: dict[str, GateResultResponse] = Field(default_factory=dict)
    causal_gates: dict[str, GateResultResponse] = Field(default_factory=dict)
    material_limitations: list[str] = Field(default_factory=list)
    has_material_limitations: bool = True
    causal_vs_correlation_analysis: str
    recommendation: str

    def __init__(self, **data: Any):
        super().__init__(**data)
        corr_gates = {}
        caus_gates = {}
        all_lims = []
        causal_names = {"independent_mechanism_evidence", "temporal_alignment", "causal_mechanism_specificity"}
        for k, g in self.gates.items():
            if getattr(g, "gate_type", "") == "CAUSAL" or k in causal_names:
                caus_gates[k] = g
            else:
                corr_gates[k] = g
            if g.limitations:
                all_lims.extend(g.limitations)
        if not self.correlation_gates:
            self.correlation_gates = corr_gates
        if not self.causal_gates:
            self.causal_gates = caus_gates
        if not self.material_limitations:
            self.material_limitations = list(dict.fromkeys(all_lims))
        self.has_material_limitations = "LIMITATION" in self.verdict or len(self.material_limitations) > 0


class SensitivityScenarioResponse(BaseModel):
    variation_label: str
    runoff_coeff_multiplier: float
    capacity_multiplier: float
    rainfall_multiplier: float
    baseline_excess_flow: float
    counterfactual_excess_flow: float
    delta: float
    percent_change: float | None
    is_reduction: bool


class SensitivityReportResponse(BaseModel):
    scenario_name: str
    base_delta: float
    base_percent_change: float | None
    total_variations_tested: int
    reductions_count: int
    is_qualitatively_stable: bool
    min_percent_change: float | None
    max_percent_change: float | None
    mean_percent_change: float | None
    disclaimer: str
    variations: list[SensitivityScenarioResponse]

