# FloodLens — Phase 3.1 API-to-Screen Mapping

**Status**: DRAFT FOR REVIEW  
**Date**: 2026-10-09  

---

## 1. Endpoint Inventory by Screen

### 1.1 Location Selection Screen (`/investigations/new`)

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/locations/places` | — | `PlaceResponse[]` | **Yes** | Populate location selector |
| `GET` | `/api/v1/locations/places/{id}/comparables?top_k=5` | `place_id` (UUID), `top_k` (int) | `ComparablesResponse` | **Yes** | Show recommended comparables |
| `GET` | `/api/v1/locations/places/{id}/features` | `place_id` (UUID) | `LocationFeaturesBundle` | Optional | Preview terrain/landcover |

**PlaceResponse Schema:**
```json
{
  "id": "uuid",
  "name": "Anna Nagar West",
  "ward": "101",
  "zone": "Anna Nagar",
  "place_type": "point",
  "description": "Substantially drained, inland, elevated",
  "longitude": 80.21,
  "latitude": 13.08,
  "created_at": "2026-10-09T03:30:00Z"
}
```

**ComparablesResponse Schema:**
```json
{
  "candidates": [
    {
      "place_id": "uuid",
      "name": "Velachery",
      "similarity_score": 0.812,
      "feature_similarities": {
        "rainfall": 1.0,
        "terrain": 0.9,
        "drainage": 0.7,
        "landcover": 0.85,
        "spatial": 0.612
      }
    }
  ]
}
```

**Loading Behavior:** Show skeleton list while fetching places.  
**Failure Behavior:** Show error state with retry button.  
**Empty State:** "No monitored locations available."

---

### 1.2 Comparison Screen

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `POST` | `/api/v1/locations/compare` | `place_a_id`, `place_b_id` (UUID) | `LocationCompareResponse` | **Yes** | Ad-hoc similarity preview |
| `POST` | `/api/v1/investigations/comparisons` | `place_a_id`, `place_b_id` (UUID) | `ComparisonResponse` | **Yes** | Persist comparison for investigation |

**LocationCompareResponse Schema:**
```json
{
  "place_a_id": "uuid",
  "place_b_id": "uuid",
  "similarity_score": 0.812,
  "feature_similarities": {
    "rainfall": 1.0,
    "terrain": 0.9,
    "drainage": 0.7,
    "landcover": 0.85,
    "spatial": 0.612
  },
  "reasons": ["Homogeneous regional storm", "Similar terrain profile"]
}
```

**ComparisonResponse Schema:**
```json
{
  "id": "uuid",
  "place_a_id": "uuid",
  "place_b_id": "uuid",
  "similarity_score": 0.812,
  "weights_version": "v2023.1",
  "feature_similarities": { ... },
  "similarity_breakdown": {
    "rainfall_similarity": 1.0,
    "terrain_similarity": 0.9,
    "drainage_similarity": 0.7,
    "landcover_similarity": 0.85,
    "spatial_similarity": 0.612,
    "event_similarity": null
  },
  "reasons": [...],
  "created_at": "2026-10-09T03:30:00Z"
}
```

**Loading Behavior:** Show skeleton while comparing.  
**Failure Behavior:** Show error message, allow retry.  
**Empty State:** "Select two locations to compare."

---

### 1.3 Investigation Screen (`/investigations/[id]`)

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `POST` | `/api/v1/investigations` | `comparison_id` (UUID) | `InvestigationCreateResponse` | **Yes** | Trigger investigation |
| `GET` | `/api/v1/investigations/{id}` | `investigation_id` (UUID) | `InvestigationDetailResponse` | **Yes** | Unified payload |
| `GET` | `/api/v1/investigations/{id}/mechanisms` | `investigation_id` (UUID) | `MechanismResponse[]` | **Yes** | Ranked mechanisms |
| `GET` | `/api/v1/investigations/{id}/evidence` | `investigation_id` (UUID) | `EvidenceItemResponse[]` | **Yes** | Evidence items |
| `GET` | `/api/v1/investigations/{id}/graph` | `investigation_id` (UUID) | `MechanismGraphResponse` | **Yes** | Causal DAG |
| `GET` | `/api/v1/investigations/{id}/validation` | `investigation_id` (UUID) | `ValidationRunResponse` | **Yes** | Historical validation |
| `GET` | `/api/v1/investigations/{id}/defensibility` | `investigation_id` (UUID) | `DefensibilityAssessmentResponse` | **Yes** | 8-gate assessment |
| `GET` | `/api/v1/investigations/{id}/limitations` | `investigation_id` (UUID) | `InvestigationLimitationResponse[]` | **Yes** | Canonical limitations |

**InvestigationCreateResponse Schema:**
```json
{
  "id": "uuid",
  "investigation_id": "uuid",
  "comparison_id": "uuid",
  "status": "running",
  "agent_mode": "local",
  "created_at": "2026-10-09T03:30:00Z"
}
```

**InvestigationDetailResponse Schema:**
```json
{
  "id": "uuid",
  "investigation_id": "uuid",
  "comparison_id": "uuid",
  "status": "completed",
  "agent_mode": "local",
  "summary": "Mechanistic analysis summary...",
  "strongest_mechanism": "IMPERVIOUS_SURFACE",
  "place_a": { "id": "...", "name": "Anna Nagar West", "ward": "101", ... },
  "place_b": { "id": "...", "name": "Velachery", "ward": "177", ... },
  "comparison": { "similarity_score": 0.812, ... },
  "mechanisms": [...],
  "evidence": [...],
  "validation": { ... },
  "defensibility": { ... },
  "counterfactual": { ... },
  "limitations": [...],
  "provenance_summary": {
    "sources_tracked": 5,
    "dataset_versions_tracked": 5,
    "feature_derivations_computed": 12,
    "lineage_available": true
  },
  "agent_response": {},
  "error_message": null,
  "started_at": "...",
  "completed_at": "...",
  "created_at": "..."
}
```

**Polling Behavior:** When `status === "running"`, poll `GET /investigations/{id}` every 2 seconds until `status === "completed"` or `status === "failed"`.

**Loading Behavior:** Show skeleton panels for each section.  
**Failure Behavior:** Show error state with retry. If investigation fails, show `error_message`.  
**Empty State:** N/A (investigation must exist to reach this screen).

---

### 1.4 Mechanisms Section

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/investigations/{id}/mechanisms` | `investigation_id` (UUID) | `MechanismResponse[]` | **Yes** | Ranked mechanism list |

**MechanismResponse Schema:**
```json
{
  "id": "uuid",
  "comparison_id": "uuid",
  "mechanism_type": "IMPERVIOUS_SURFACE",
  "score": 0.35,
  "confidence": 0.40,
  "certainty": "SUPPORTED",
  "confidence_meaning": "Bounded to 0.40 confidence due to proxy land-cover classification...",
  "rank": 3,
  "supporting_evidence_ids": ["uuid..."],
  "limiting_evidence_ids": [],
  "explanation": "...",
  "signal_values": { ... }
}
```

**Loading Behavior:** Show skeleton cards.  
**Failure Behavior:** Show error state.  
**Empty State:** "No mechanisms identified."

---

### 1.5 Evidence Section

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/investigations/{id}/evidence` | `investigation_id` (UUID) | `EvidenceItemResponse[]` | **Yes** | Evidence list |
| `GET` | `/api/v1/investigations/{id}/evidence/{eid}/provenance` | `investigation_id`, `evidence_id` (UUID) | `ClaimProvenanceResponse` | **Yes** | Deep provenance |

**EvidenceItemResponse Schema:**
```json
{
  "id": "uuid",
  "evidence_id": "uuid",
  "investigation_id": "uuid",
  "mechanism_type": "IMPERVIOUS_SURFACE",
  "certainty_level": "SUPPORTED",
  "claim": "Built-up land cover fraction is 0.82 in Ward 101 vs 0.69 in Ward 102",
  "value": 0.13,
  "unit": "fraction",
  "source": "deterministic_engine",
  "source_id": "uuid",
  "dataset_version_id": "uuid",
  "feature_derivation_id": "uuid",
  "spatial_ref": null,
  "temporal_ref": null,
  "support_score": 0.35,
  "explanation": "...",
  "source_independence": "DEPENDENT_DERIVATION",
  "limitations": [
    "Static 2023 land cover proxy does not represent parcel-level measured imperviousness",
    "Infiltration rate heterogeneity not directly measured"
  ],
  "extra_data": null,
  "created_at": "2026-10-09T03:30:00Z"
}
```

**ClaimProvenanceResponse Schema:**
```json
{
  "investigation_id": "uuid",
  "evidence_id": "uuid",
  "claim": "Built-up fraction difference...",
  "mechanism_type": "IMPERVIOUS_SURFACE",
  "chain": [
    { "level": "claim", "identifier": "claim-...", "name": "..." },
    { "level": "evidence", "identifier": "...", "name": "Evidence Item for IMPERVIOUS_SURFACE" },
    { "level": "feature", "identifier": "feat-builtup_fraction", "name": "Feature: builtup_fraction" },
    { "level": "derivation", "identifier": "deriv-builtup_fraction-v2023.1", "name": "Derivation calculation..." },
    { "level": "source_file", "identifier": "sf-esa_worldcover_10m", "metadata": { "logical_key": "data/raw/esa_worldcover_10m.csv" } },
    { "level": "dataset_version", "identifier": "ver-esa_worldcover_10m-v2023.1", "name": "ESA WorldCover 10m Land Cover (v2023.1)" },
    { "level": "source", "identifier": "src-esa_worldcover_10m", "name": "ESA WorldCover 10m Land Cover" }
  ]
}
```

**Loading Behavior:** Show skeleton cards.  
**Failure Behavior:** Show error state.  
**Empty State:** "No evidence items available."

---

### 1.6 Validation Section

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/investigations/{id}/validation` | `investigation_id` (UUID) | `ValidationRunResponse` | **Yes** | Multi-event validation |

**ValidationRunResponse Schema:**
```json
{
  "id": "uuid",
  "investigation_id": "uuid",
  "proposed_mechanism": "IMPERVIOUS_SURFACE",
  "event_count": 3,
  "supporting_event_count": 2,
  "contradicting_event_count": 0,
  "inconclusive_event_count": 1,
  "result": "MODERATE_SUPPORT",
  "confidence": 0.60,
  "recurring_mechanisms": { ... },
  "explanation": "...",
  "method_version": "v2023.1",
  "event_ids": ["uuid..."],
  "observation_ids": ["uuid..."],
  "feature_derivation_ids": ["uuid..."],
  "source_datasets": ["IMD/GPM rainfall", "TNWRD water level / flood records", "Sentinel-1 / Copernicus EMS flood extent"],
  "sample_size_n": 3,
  "validation_method": "multi_event_consistency_triangulation",
  "validation_status": null,
  "limitations": ["N=3 multi-event historical sample does not justify strong certainty..."]
}
```

---

### 1.7 Defensibility Section

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/investigations/{id}/defensibility` | `investigation_id` (UUID) | `DefensibilityAssessmentResponse` | **Yes** | 8-gate assessment |

**DefensibilityAssessmentResponse Schema:**
```json
{
  "investigation_id": "uuid",
  "place_a_id": "uuid",
  "place_b_id": "uuid",
  "proposed_mechanism": "IMPERVIOUS_SURFACE",
  "verdict": "DEFENSIBLE_WITH_MATERIAL_LIMITATIONS",
  "correlation_gates_passed": 5,
  "causal_gates_passed": 1,
  "total_gates": 8,
  "gates": {
    "direct_flood_observation": {
      "gate_name": "direct_flood_observation",
      "status": "PASS",
      "confidence": 0.9,
      "description": "...",
      "explanation": "...",
      "gate_type": "CORRELATION",
      "evidence_ids": ["uuid..."],
      "limitations": []
    },
    ...
  },
  "correlation_gates": { ... },
  "causal_gates": { ... },
  "material_limitations": ["..."],
  "has_material_limitations": true,
  "causal_vs_correlation_analysis": "...",
  "recommendation": "..."
}
```

---

### 1.8 Limitations Section

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/investigations/{id}/limitations` | `investigation_id` (UUID) | `InvestigationLimitationResponse[]` | **Yes** | Canonical limitations |

**InvestigationLimitationResponse Schema:**
```json
{
  "id": "rainfall_spatial_resolution",
  "limitation": "rainfall_spatial_resolution",
  "severity": "MEDIUM",
  "source": "IMD Daily Rain Gauge",
  "affected_feature": "rainfall_mm",
  "explanation": "Regional grid interpolation smooths localized convective cloudbursts."
}
```

---

### 1.9 Counterfactual Section

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `POST` | `/api/v1/investigations/{id}/counterfactual` | `CounterfactualRequest` | `CounterfactualRunResponse` | **Yes** | Run scenario |
| `POST` | `/api/v1/investigations/{id}/counterfactual/sensitivity` | `CounterfactualRequest` | `SensitivityReportResponse` | Optional | 15-scenario sweep |

**CounterfactualRequest Schema:**
```json
{
  "scenario_name": "reduce_runoff_20pct",
  "runoff_coefficient": 0.7,
  "contributing_area_km2": 5.0,
  "effective_capacity": 100.0,
  "rainfall_mm": 100.0,
  "upstream_impervious_fraction": 0.6,
  "drainage_path_km": 2.0
}
```

**CounterfactualRunResponse Schema:**
```json
{
  "id": "uuid",
  "investigation_id": "uuid",
  "scenario_name": "reduce_runoff_20pct",
  "parameters": { ... },
  "baseline_output": 987.45,
  "counterfactual_output": 788.96,
  "delta": -198.49,
  "percent_change": -20.10,
  "disclaimer": "Simplified counterfactual proxy — not a calibrated hydraulic prediction.",
  "mechanism_tested": "RUNOFF_GENERATION_SURCHARGE",
  "input_features": ["runoff_coefficient", "contributing_area_km2", ...],
  "baseline_values": { ... },
  "transformed_values": { ... },
  "transformation_rule": "Linear rational peak runoff proxy balance: Q = C * I * A - capacity",
  "output_metric": "peak_discharge_proxy_m3_s",
  "sensitivity_run_id": null,
  "baseline_feature_provenance": "ESA WorldCover 10m, Copernicus DEM GLO-30, GCC SWD network",
  "is_calibrated_hydraulic_prediction": false,
  "limitation": "Simplified counterfactual proxy — not a calibrated hydraulic prediction.",
  "created_at": "2026-10-09T03:30:00Z"
}
```

**SensitivityReportResponse Schema:**
```json
{
  "scenario_name": "reduce_runoff_20pct",
  "base_delta": -198.49,
  "base_percent_change": -20.10,
  "total_variations_tested": 15,
  "reductions_count": 12,
  "is_qualitatively_stable": true,
  "min_percent_change": -25.3,
  "max_percent_change": -15.2,
  "mean_percent_change": -20.1,
  "disclaimer": "...",
  "variations": [
    {
      "variation_label": "runoff_coeff_0.65",
      "runoff_coeff_multiplier": 0.93,
      "capacity_multiplier": 1.0,
      "rainfall_multiplier": 1.0,
      "baseline_excess_flow": 987.45,
      "counterfactual_excess_flow": 788.96,
      "delta": -198.49,
      "percent_change": -20.10,
      "is_reduction": true
    },
    ...
  ]
}
```

---

### 1.10 Map Data

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/map/drains` | `lon`, `lat`, `radius_m` | `MapDrainsResponse` | **Yes** | Drain segments |
| `GET` | `/api/v1/map/flood-observations` | `lon`, `lat`, `radius_m` | `MapFloodObservationsResponse` | **Yes** | Flood points |
| `GET` | `/api/v1/map/terrain` | `lon`, `lat` | `MapTerrainResponse` | Optional | Terrain query |

**MapDrainsResponse Schema:**
```json
{
  "drains": [
    {
      "id": "uuid",
      "drain_type": "stormwater",
      "ward": "101",
      "street_name": "Anna Nagar Main Road",
      "is_inferred": false,
      "length_m": 1200.0
    }
  ]
}
```

**MapFloodObservationsResponse Schema:**
```json
{
  "observations": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "severity": "high",
      "depth_cm": 45.0,
      "ward": "101"
    }
  ]
}
```

---

### 1.11 Supporting Endpoints (Optional)

| Method | Endpoint | Request | Response | Essential | Purpose |
|--------|----------|---------|----------|-----------|---------|
| `GET` | `/api/v1/events` | — | `FloodEventResponse[]` | Optional | Event timeline |
| `GET` | `/api/v1/data-sources` | — | `DataSourceResponse[]` | Optional | Source registry |
| `GET` | `/api/v1/data-sources/lineage` | `feature_type`, `place_id`, `event_id` | `FeatureDerivationResponse[]` | Optional | Lineage audit |
| `GET` | `/api/v1/rainfall/event-features` | `event_id`, `place_id` | `RainfallEventFeatureResponse[]` | Optional | Rainfall aggregations |
| `GET` | `/api/v1/terrain/features` | `place_id` (UUID) | `TerrainFeatureResponse[]` | Optional | Terrain features |
| `GET` | `/api/v1/drainage/segments` | `ward`, `provenance` | `DrainageSegmentResponse[]` | Optional | Drain segments |
| `GET` | `/api/v1/drainage/stats` | `ward` (str) | `DrainageStatsResponse` | Optional | Ward drainage stats |

---

## 2. Error Handling Matrix

| HTTP Status | Error Code | Frontend Behavior |
|-------------|------------|-------------------|
| 400 | `INVALID_REQUEST` | Show validation error message |
| 404 | `RESOURCE_NOT_FOUND` | Show "not found" state, offer navigation |
| 409 | `CONFLICT` | Show conflict message, offer retry |
| 422 | `VALIDATION_ERROR` | Show field-level validation errors |
| 500 | `INTERNAL_SERVER_ERROR` | Show generic error, log to console |

---

## 3. Endpoint Gaps & Blockers

### 3.1 No Blockers Identified

All required endpoints exist and are documented. The backend API contract is stable and verified.

### 3.2 Minor Gaps (Non-Blocking)

| Gap | Impact | Workaround |
|-----|--------|------------|
| No WebSocket/SSE for investigation status | Polling required | Poll `GET /investigations/{id}` every 2s |
| No bulk evidence provenance endpoint | N+1 if fetching multiple | Fetch provenance on-demand per evidence item |
| No map tile server for flood-specific tiles | Using OSM standard tiles | Acceptable for prototype |
| No export/download endpoint | Cannot export investigation | Future enhancement |

### 3.3 Assumptions

| Assumption | Risk | Mitigation |
|------------|------|------------|
| Investigation completes within 30 seconds | Low | Show progress indicator, handle timeout |
| All places have valid coordinates | Low | Validate on ingestion, fallback to Chennai center |
| Evidence items always have provenance | Medium | Handle null chain gracefully |
| Counterfactual always returns valid delta | Low | Validate response, show error if invalid |
