# FloodLens — Backend API Contract (Phase 2.5)

This document specifies the canonical, hardened REST API contract for the FloodLens backend.
It serves as the definitive reference for frontend integration.

---

## 1. Architectural & Scientific Guarantees

1. **Strict Pydantic Enforced Schemas**: Every endpoint returns an explicitly typed, deterministic Pydantic model. No arbitrary dictionaries are returned.
2. **Explicit Physical Units**: Physical quantities specify their measurement units directly in field names (e.g., `rainfall_mm`, `depth_cm`, `elevation_mean_m`, `hand_m`, `length_m`, `area_km2`).
3. **Scientific Status Enums**: Scientific categorizations are exposed via explicit enum strings—the frontend never infers status from numeric values.
4. **Unified Investigation Contract**: `GET /api/v1/investigations/{id}` delivers the complete investigation bundle (`place_a`, `place_b`, `comparison`, `mechanisms`, `evidence`, `validation`, `defensibility`, `counterfactual`, `limitations`, `provenance_summary`) in a single round-trip.
5. **Mandatory Material Limitations**: The defensibility verdict cannot be displayed without its material limitations. `has_material_limitations` and `material_limitations` are explicitly surfaced.
6. **Zero Filesystem Path Leakage**: Provenance and source metadata use logical IDs, dataset keys, and filenames. Internal server directory paths are never exposed to clients.
7. **Predictable Standard Error Envelope**: All 4xx and 5xx responses conform to `{"error": {"code": str, "message": str, "details": dict}}`.

---

## 2. Scientific Status Enums Reference

| Enum | Values | Scientific Meaning |
| :--- | :--- | :--- |
| **`CertaintyLevel`** | `FACT`<br>`SUPPORTED`<br>`HYPOTHESIS`<br>`UNKNOWN` | Degree of empirical grounding: direct measurement vs proxy-derived vs theoretical hypothesis. |
| **`ValidationStatus`** | `STRONG_SUPPORT`<br>`MODERATE_SUPPORT`<br>`WEAK_SUPPORT`<br>`MIXED`<br>`INSUFFICIENT_DATA` | Multi-event historical recurrence: whether disparity replicates across 2015, 2021, and 2023 flood events. |
| **`RainfallComparabilityStatus`** | `COMPARABLE`<br>`PARTIALLY_COMPARABLE`<br>`UNKNOWN` | Whether event rainfall disparity between place A and B is within meteorological tolerance ($\le 20\%$). |
| **`DrainageAlignmentStatus`** | `EVENT_ALIGNED`<br>`TEMPORALLY_MISMATCHED`<br>`UNKNOWN` | Whether drainage network survey epoch matches the flood event timeline. |
| **`GeometryProvenance`** | `DIRECT`<br>`DERIVED`<br>`INFERRED`<br>`UNKNOWN` | Physical origin of network geometry: survey shapefile vs inferred connectivity vs DEM stream burning. |
| **`DefensibilityVerdict`** | `DEFENSIBLE`<br>`DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`<br>`INSUFFICIENT_EVIDENCE` | 8-gate scientific defensibility outcome. |
| **`LimitationSeverity`** | `HIGH`<br>`MEDIUM`<br>`LOW` | Methodological severity of an observational limitation. |

---

## 3. Explicit Physical Units Reference

| Quantity | Field Name | Unit | Scientific Context |
| :--- | :--- | :--- | :--- |
| Rainfall depth | `rainfall_mm`, `cumulative_rainfall_mm` | mm | Gauge measurement or spatial interpolation |
| Rainfall intensity | `mean_intensity_mm_per_hr`, `max_intensity_mm_per_hr` | mm/hr | Derived from hourly gauge logs |
| Flood depth | `depth_cm` | cm | Field observation, crowdsourced, or news report |
| Elevation | `elevation_mean_m`, `min_elevation`, `max_elevation` | m MSL | Copernicus DEM GLO-30 |
| Relative elevation | `relative_elevation_m` | m | Differential height relative to local baseline |
| HAND | `hand_m` | m | Height Above Nearest Drain |
| Slope | `mean_slope_degrees` | degrees | Surface topographic gradient |
| Contributing area | `area_km2` | $\text{km}^2$ | Topographic upstream catchment proxy |
| Drain segment length | `length_m`, `total_length_m` | m | PostGIS projected length (EPSG:3857) |
| Drain dimensions | `depth_m`, `width_m` | m | GCC nominal conduit cross-section |
| Distance to outfall | `station_distance_m`, `drainage_path_length_m` | m | Euclidean or network distance |

---

## 4. Standard Error Contract

All error responses return HTTP status codes with a standardized JSON envelope:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Investigation not found",
    "details": {}
  }
}
```

### Standard Status Codes
- `400 INVALID_REQUEST`: Malformed parameters or conflicting query filters.
- `404 RESOURCE_NOT_FOUND`: Entity does not exist for the provided UUID.
- `409 CONFLICT`: Duplicate or conflicting resource state.
- `422 VALIDATION_ERROR`: Pydantic input validation failure (returns `details.validation_errors`).
- `500 INTERNAL_SERVER_ERROR`: Unhandled exception (sanitized; tracebacks logged server-side only).

---

## 5. Canonical API Inventory

| Method | Endpoint | Purpose | Request Parameters | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status | None | `dict` (`status`, `service`, `version`) |
| `GET` | `/api/v1/locations/places` | List all monitored urban places | None | `list[PlaceResponse]` |
| `GET` | `/api/v1/locations/places/{id}` | Single place details | `place_id` (UUID) | `PlaceResponse` |
| `GET` | `/api/v1/locations/places/{id}/features` | Terrain & land cover feature bundle | `place_id` (UUID) | `LocationFeaturesBundle` |
| `GET` | `/api/v1/locations/places/{id}/comparables` | Candidate comparable places | `place_id` (UUID), `top_k` (int) | `ComparablesResponse` |
| `POST` | `/api/v1/locations/compare` | Ad-hoc place comparison | `place_a_id`, `place_b_id` | `LocationCompareResponse` |
| `GET` | `/api/v1/events` | List historical flood events | None | `list[FloodEventResponse]` |
| `GET` | `/api/v1/events/{id}` | Flood event detail + observations | `event_id` (UUID) | `FloodEventDetailResponse` |
| `GET` | `/api/v1/flood-observations` | Filtered flood depth observations | `event_id`, `place_id`, `ward`, `limit`, `offset` | `list[FloodObservationResponse]` |
| `GET` | `/api/v1/rainfall/observations` | Raw rainfall observations | `place_id`, `ward`, `limit`, `offset` | `list[RainfallObservationResponse]` |
| `GET` | `/api/v1/rainfall/event-features` | Event-window rainfall aggregations | `event_id`, `place_id`, `limit`, `offset` | `list[RainfallEventFeatureResponse]` |
| `GET` | `/api/v1/rainfall/compare` | Evaluate rainfall comparability | `event_id`, `place_a_id`, `place_b_id` | `RainfallComparabilityResponse` |
| `GET` | `/api/v1/drainage/versions` | Drainage network survey versions | None | `list[DrainageNetworkVersionResponse]` |
| `GET` | `/api/v1/drainage/segments` | Drainage network line segments | `ward`, `provenance`, `limit`, `offset` | `list[DrainageSegmentResponse]` |
| `GET` | `/api/v1/drainage/outfalls` | Drainage network discharge outfalls | `ward`, `limit`, `offset` | `list[OutfallResponse]` |
| `GET` | `/api/v1/drainage/stats` | Ward-level drainage statistics | `ward` (str) | `DrainageStatsResponse` |
| `GET` | `/api/v1/terrain/features` | Terrain features for places | `place_id` (UUID) | `list[TerrainFeatureResponse]` |
| `GET` | `/api/v1/terrain/contributing-area` | Topographic contributing area proxy | `place_id` (UUID) | `list[ContributingAreaProxyResponse]` |
| `GET` | `/api/v1/data-sources` | Data source registry & versions | None | `list[DataSourceResponse]` |
| `GET` | `/api/v1/data-sources/lineage` | Feature derivation lineage | `feature_type`, `place_id`, `event_id`, `limit`, `offset` | `list[FeatureDerivationResponse]` |
| `POST` | `/api/v1/investigations/comparisons` | Create/retrieve place comparison | `place_a_id`, `place_b_id` | `ComparisonResponse` |
| `GET` | `/api/v1/investigations/comparisons/{id}/explanations` | Feature-level similarity breakdown | `comparison_id` (UUID) | `list[ComparisonExplanationResponse]` |
| `POST` | `/api/v1/investigations` | Run automated investigation | `comparison_id` (UUID) | `InvestigationCreateResponse` |
| `GET` | `/api/v1/investigations/{id}` | **Unified investigation response** | `investigation_id` (UUID) | `InvestigationDetailResponse` |
| `GET` | `/api/v1/investigations/{id}/mechanisms` | Ranked mechanisms with confidence meaning | `investigation_id` (UUID) | `list[MechanismResponse]` |
| `GET` | `/api/v1/investigations/{id}/evidence` | Evidence items with lineage & limitations | `investigation_id` (UUID) | `list[EvidenceItemResponse]` |
| `GET` | `/api/v1/investigations/{id}/graph` | Causal mechanism DAG | `investigation_id` (UUID) | `MechanismGraphResponse` |
| `GET` | `/api/v1/investigations/{id}/validation` | Multi-event validation result | `investigation_id` (UUID) | `ValidationRunResponse` |
| `GET` | `/api/v1/investigations/{id}/defensibility` | 8-gate scientific defensibility report | `investigation_id` (UUID) | `DefensibilityAssessmentResponse` |
| `POST` | `/api/v1/investigations/{id}/counterfactual` | Run counterfactual simulation scenario | `investigation_id`, `CounterfactualRequest` | `CounterfactualRunResponse` |
| `POST` | `/api/v1/investigations/{id}/counterfactual/sensitivity` | 15-scenario parameter sensitivity audit | `investigation_id`, `CounterfactualRequest` | `SensitivityReportResponse` |
| `GET` | `/api/v1/investigations/{id}/limitations` | 8 canonical Case 001 limitations | `investigation_id` (UUID) | `list[InvestigationLimitationResponse]` |
| `GET` | `/api/v1/investigations/{id}/provenance` | Primary claim deterministic lineage | `investigation_id` (UUID) | `ClaimProvenanceResponse` |
| `GET` | `/api/v1/investigations/{id}/evidence/{eid}/provenance` | Specific claim deterministic lineage | `investigation_id` (UUID), `evidence_id` | `ClaimProvenanceResponse` |
| `GET` | `/api/v1/map/drains` | Spatial bounding box drain segments | `lon`, `lat`, `radius_m` | `MapDrainsResponse` |
| `GET` | `/api/v1/map/flood-observations` | Spatial bounding box flood observations | `lon`, `lat`, `radius_m` | `MapFloodObservationsResponse` |
| `GET` | `/api/v1/map/terrain` | Spatial coordinate terrain raster query | `lon`, `lat` | `MapTerrainResponse` |

---

## 6. Key Endpoint Specifications

### 6.1 Unified Investigation Endpoint
- **Path**: `GET /api/v1/investigations/{id}`
- **Purpose**: Powers the main investigation dashboard in a single round-trip.
- **Response Structure**:
```json
{
  "id": "uuid",
  "investigation_id": "uuid",
  "status": "completed",
  "agent_mode": "local",
  "summary": "Mechanistic analysis summary...",
  "strongest_mechanism": "IMPERVIOUS_SURFACE",
  "place_a": { "id": "...", "name": "Anna Nagar West", "ward": "101", ... },
  "place_b": { "id": "...", "name": "Koyambedu", "ward": "102", ... },
  "comparison": {
    "similarity_score": 0.81,
    "similarity_breakdown": {
      "rainfall_similarity": 0.95,
      "terrain_similarity": 0.88,
      "drainage_similarity": 0.72,
      "landcover_similarity": 0.58,
      "spatial_similarity": 0.85,
      "event_similarity": 0.90
    },
    "reasons": [...]
  },
  "mechanisms": [
    {
      "mechanism_type": "IMPERVIOUS_SURFACE",
      "score": 0.35,
      "confidence": 0.40,
      "certainty": "SUPPORTED",
      "confidence_meaning": "Bounded to 0.40 confidence due to proxy land-cover classification and absence of calibrated 2D hydraulic run-off model.",
      "supporting_evidence_ids": ["uuid..."],
      "limiting_evidence_ids": []
    }
  ],
  "evidence": [
    {
      "evidence_id": "uuid",
      "mechanism_type": "IMPERVIOUS_SURFACE",
      "claim": "Built-up fraction difference (imperviousness-related proxy) suggests differential surface runoff potential",
      "certainty_level": "SUPPORTED",
      "support_score": 0.55,
      "unit": "fraction",
      "limitations": [
        "Static 2023 land cover proxy does not represent parcel-level measured imperviousness",
        "Infiltration rate heterogeneity not directly measured"
      ]
    }
  ],
  "validation": {
    "result": "MODERATE_SUPPORT",
    "confidence": 0.60,
    "event_count": 3,
    "supporting_event_count": 2
  },
  "defensibility": {
    "verdict": "DEFENSIBLE_WITH_MATERIAL_LIMITATIONS",
    "has_material_limitations": true,
    "material_limitations": [...],
    "correlation_gates_passed": 5,
    "causal_gates_passed": 1,
    "total_gates": 8,
    "gates": { ... }
  },
  "counterfactual": { ... },
  "limitations": [ ... ],
  "provenance_summary": {
    "sources_tracked": 5,
    "dataset_versions_tracked": 5,
    "feature_derivations_computed": 12,
    "lineage_available": true
  }
}
```

---

### 6.2 Limitations Endpoint
- **Path**: `GET /api/v1/investigations/{id}/limitations`
- **Purpose**: Explicitly exposes the 8 canonical Phase 2 limitations for transparent display.
- **Canonical Limitations Catalog**:
  1. `rainfall_spatial_resolution` (`MEDIUM`): Regional grid interpolation smooths localized convective cloudbursts.
  2. `dem_micro_topography` (`MEDIUM`): 30m DEM resolution fails to capture street-level crowns, curbs, and compound walls.
  3. `contributing_area_proxy` (`HIGH`): Topographic proxy rather than physically bounded catchment delineation.
  4. `drainage_temporal_mismatch` (`HIGH`): Modern 2023 network shapefiles mismatched against 2015/2021 historical flood events.
  5. `static_land_cover` (`MEDIUM`): Static 10m satellite classification misses multi-year urban densification.
  6. `drain_blockage_unknown` (`HIGH`): Sub-surface siltation and inlet obstructions are unobserved.
  7. `historical_sample_size` (`MEDIUM`): Empirical validation bounded by $N=3$ events (2015, 2021, 2023).
  8. `no_calibrated_hydraulic_model` (`HIGH`): Comparative multi-factor signals rather than calibrated 2D hydrodynamic simulation.

---

### 6.3 Deterministic Claim Provenance Endpoint
- **Path**: `GET /api/v1/investigations/{id}/evidence/{evidence_id}/provenance`
- **Purpose**: Traces an empirical claim back to its primary survey source without leaking internal filesystem paths.
- **Lineage Chain**:
  `claim` $\to$ `evidence` $\to$ `feature` $\to$ `derivation` $\to$ `source_file` $\to$ `dataset_version` $\to$ `source`

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

---

## 7. Performance & Security Best Practices

- **Bounded Queries**: All list routes accept `limit` (max 1000, default 100) and `offset` (default 0).
- **No N+1 Database Operations**: Related records (`DataSource` $\to$ `SourceFile` / `DatasetVersion`) are loaded in bulk using indexed foreign key batches.
- **SQL Injection Prevention**: 100% of queries use SQLAlchemy ORM expressions with parameterized bindings.
- **Path Sanitization**: `SourceFileResponse` strips absolute local paths (`C:\Users\...`) and exposes only the logical dataset key.
