# FloodLens — Frontend Integration Handoff Specification

This document provides complete, definitive guidance for frontend engineers integrating with the FloodLens backend API.

> [!IMPORTANT]
> **BACKEND & DATA LAYER FREEZE**: Following Phase 2.7 verification, the backend API contract, scientific scoring algorithms, database schema, and evidence mechanisms are **FROZEN**. Frontend development can proceed against stable contracts.

---

## A. Backend Architecture Overview

FloodLens is an urban flood causal analysis system combining deterministic geospatial hydrology, empirical flood observations, and an explainable reasoning agent.

```
                      ┌─────────────────────────────────────────┐
                      │             Next.js Frontend            │
                      └────────────────────┬────────────────────┘
                                           │ HTTP/JSON
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          FastAPI Backend (v1)           │
                      └──────┬───────────────────────────┬──────┘
                             │                           │
                             ▼                           ▼
        ┌───────────────────────────────┐     ┌───────────────────────┐
        │     Deterministic Engines     │     │   Explainable Agent   │
        │ - Mechanistic Scoring         │     │ - Guardrailed LLM     │
        │ - Defensibility Evaluator     │     │ - Explanation Layer   │
        │ - Rational Counterfactual     │     │ - Read-Only DB Access │
        │ - Lineage & Provenance        │     └───────────────────────┘
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌───────────────────────────────┐
        │   PostgreSQL 16 + PostGIS     │
        │ - Spatio-Temporal Observ.     │
        │ - DEM / HAND Features         │
        │ - Stormwater Drain Topology   │
        │ - Lineage & Checksums         │
        └───────────────────────────────┘
```

---

## B. Local Development Startup

To run the backend server locally:

```bash
# 1. Activate Python virtual environment
.venv\Scripts\activate   # Windows
source .venv/bin/activate # Linux/macOS

# 2. Start Uvicorn development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --app-dir backend
```

Swagger UI documentation will be available at: `http://127.0.0.1:8000/docs`.

---

## C. Database Startup & Migration

FloodLens uses PostgreSQL with the PostGIS extension.

```bash
# Start via Docker Compose (recommended)
docker compose up -d db

# Apply migrations
alembic upgrade head

# Ingest canonical Chennai dataset (Phase 2)
python scripts/ingest_phase2.py
```

Current Alembic migration head: `1a2b3c4d5e6f` (Clean state reproducible).

---

## D. Required Environment Variables

Configure the frontend `.env.local` with:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=<your_mapbox_or_maplibre_token>
```

Backend `.env`:
```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/floodlens
POSTGIS_ENABLE=true
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

---

## E. API Base URL

- **Production/Staging**: `https://<api-domain>/api/v1`
- **Local Development**: `http://127.0.0.1:8000/api/v1`
- **Root Healthcheck**: `GET /health` and `GET /api/v1/health`

---

## F. Authentication Requirements

Currently, all endpoints operate under read-only or session-scoped investigation creation without API keys (internal development phase).
Standard error envelopes (`ErrorEnvelope`) apply to 4xx/5xx responses.

---

## G. Canonical Frontend API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/health` | Service status and readiness |
| **Locations** | `GET` | `/locations/places` | List monitored wards/places |
| | `GET` | `/locations/places/{id}` | Place metadata and bounding coordinates |
| | `GET` | `/locations/places/{id}/features` | Place terrain and landcover features |
| | `GET` | `/locations/places/{id}/comparables` | Recommended comparative locations |
| | `POST` | `/locations/compare` | Compare two locations |
| **Events** | `GET` | `/events` | Historical storm/flood event catalog |
| **Observations** | `GET` | `/flood-observations` | Observed ward flood points/levels |
| **Rainfall** | `GET` | `/rainfall/observations` | Daily station observations |
| | `GET` | `/rainfall/event-features` | Multi-day cumulative event metrics |
| **Drainage** | `GET` | `/drainage/segments` | Stormwater drain conduits (with `is_inferred`) |
| | `GET` | `/drainage/outfalls` | Coastal/river outfall points |
| **Terrain** | `GET` | `/terrain/features` | Slope, elevation, and HAND features |
| | `GET` | `/terrain/contributing-area` | Topographic contributing-area proxies |
| **Provenance** | `GET` | `/data-sources` | Registered data sources and checksums |
| | `GET` | `/data-sources/lineage` | Feature derivation audit trail |
| **Investigations** | `POST` | `/investigations/comparisons` | Create/retrieve pairwise comparison |
| | `POST` | `/investigations` | Run investigation pipeline |
| | `GET` | `/investigations/{id}` | Complete unified investigation payload |
| | `GET` | `/investigations/{id}/mechanisms` | Ranked mechanisms and confidence |
| | `GET` | `/investigations/{id}/evidence` | Evidence items with limitations & citations |
| | `GET` | `/investigations/{id}/graph` | Graph nodes and edges for visualization |
| | `GET` | `/investigations/{id}/history` | Historical validation summary |
| | `GET` | `/investigations/{id}/validation` | Multi-event empirical validation runs |
| | `GET` | `/investigations/{id}/defensibility` | Scientific defensibility gates and verdict |
| | `GET` | `/investigations/{id}/limitations` | Canonical 8 material limitations |
| | `GET` | `/investigations/{id}/provenance` | Investigation primary claim provenance |
| | `GET` | `/investigations/{id}/evidence/{evidence_id}/provenance` | Evidence item deep provenance chain |
| | `POST` | `/investigations/{id}/counterfactual` | Simplified runoff reduction scenario |
| | `POST` | `/investigations/{id}/counterfactual/sensitivity` | Multi-parameter parameter variation sweep |

---

## H. Investigation Lifecycle

```mermaid
sequenceDiagram
    participant FE as Frontend UI
    participant API as FastAPI Backend
    participant DB as PostGIS DB

    FE->>API: POST /locations/compare (place_a_id, place_b_id)
    API->>DB: get_or_create_comparison()
    API-->>FE: ComparisonResponse (similarity_score, breakdown)

    FE->>API: POST /investigations (comparison_id)
    Note over API: Deterministic scoring + Agent reasoning
    API-->>FE: InvestigationCreateResponse (id, status="completed")

    FE->>API: GET /investigations/{id}
    API-->>FE: InvestigationDetailResponse (unified payload)
    
    FE->>API: POST /investigations/{id}/counterfactual
    API-->>FE: CounterfactualRunResponse (screening delta)
```

---

## I. Case 001 Example Flow

Canonical Pair:
- **Place A**: Anna Nagar (Ward 101) — Substantially drained, inland, elevated.
- **Place B**: Velachery (Ward 177) — Low-lying former marshland, high builtup, depressed HAND.

**Expected Baseline Outputs**:
- **Similarity Score**: `0.812` (Explainable breakdown: rainfall 1.00, terrain 0.90, drainage 0.70, landcover 0.85, spatial 0.61).
- **Dominant Mechanisms**:
  - `RUNOFF_CONCENTRATION` (Score: 0.35, Conf: 0.50)
  - `TERRAIN_DEPRESSION` (Score: 0.35, Conf: 0.50)
  - `IMPERVIOUS_SURFACE` (Score: 0.35, Conf: 0.40)
- **Historical Validation**: `MODERATE_SUPPORT` (Confidence: 0.60, Sample N=3 events).
- **Defensibility Verdict**: `DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`.
  - Correlation Gates: 5/5 PASS.
  - Causal Mechanism Specificity: FAIL (Co-occurring terrain and imperviousness confounders).
- **Counterfactual Runoff Delta**: ~ -20.10% screening peak flow reduction.

---

## J. Response Schemas & Types

All endpoints return standard Pydantic models. Key interfaces:

### Unified Investigation Detail (`GET /investigations/{id}`)
```typescript
interface InvestigationDetailResponse {
  id: string;
  comparison_id: string;
  status: "pending" | "running" | "completed" | "failed";
  agent_mode: string;
  summary: string | null;
  strongest_mechanism: string | null;
  place_a: PlaceResponse;
  place_b: PlaceResponse;
  comparison: ComparisonResponse;
  mechanisms: MechanismResponse[];
  evidence: EvidenceItemResponse[];
  validation: ValidationRunResponse | null;
  defensibility: DefensibilityAssessmentResponse | null;
  limitations: InvestigationLimitationResponse[];
  primary_claim_provenance: ClaimProvenanceResponse | null;
  created_at: string;
}
```

### Standard Error Envelope
On HTTP 4xx/5xx:
```json
{
  "error": "INVESTIGATION_NOT_FOUND",
  "detail": "Investigation with id ... was not found.",
  "status_code": 404
}
```

---

## K. Scientific Status Enums

The frontend **MUST** use these standardized enum values:

| Enum Name | Allowed Values | Frontend Styling Guidance |
|---|---|---|
| `DefensibilityVerdict` | `DEFENSIBLE`<br>`DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`<br>`NOT_DEFENSIBLE`<br>`INSUFFICIENT_EVIDENCE` | `DEFENSIBLE`: Green<br>`DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`: Amber<br>`NOT_DEFENSIBLE`: Red<br>`INSUFFICIENT_EVIDENCE`: Gray |
| `CertaintyLevel` | `FACT`<br>`MEASURED`<br>`DERIVED`<br>`SUPPORTED`<br>`PROXY`<br>`INFERRED`<br>`UNKNOWN` | `FACT` / `MEASURED`: Solid badge<br>`PROXY` / `INFERRED`: Dashed border badge<br>`UNKNOWN`: Warning icon badge |
| `ValidationStatus` | `STRONG_SUPPORT`<br>`MODERATE_SUPPORT`<br>`WEAK_SUPPORT`<br>`INCONSISTENT`<br>`INSUFFICIENT_DATA` | Display with sample size `(N=3)` |
| `LimitationSeverity` | `LOW`<br>`MEDIUM`<br>`HIGH`<br>`CRITICAL` | `HIGH` / `CRITICAL` must be pinned to main report header |

---

## L. Physical Units

The frontend **MUST** render explicit units alongside every numeric value:

| Parameter | Unit | Display Symbol | Source Reference |
|---|---|---|---|
| Rainfall (cumulative) | Millimeters | `mm` | IMD Daily Rain Gauge |
| Elevation | Meters Above Mean Sea Level | `m MSL` | Copernicus DEM GLO-30 |
| Height Above Nearest Drainage (HAND) | Meters | `m` | Topographic HAND model |
| Drain Conduit Length | Meters | `m` | GCC SWD GIS Survey |
| Drain Conduit Cross-Section | Meters | `m` (width × depth) | GCC Survey / Inferred |
| Drain System Total Length | Kilometers | `km` | Aggregated Ward SWD |
| Topographic Contributing Area | Square Kilometers | `km²` | Topographic Gradient Proxy |
| Peak Runoff Rate | Cubic Meters per Second | `m³/s` | Rational Method Proxy |
| Runoff Coefficient | Dimensionless (0.00 – 1.00) | `C` | Rational Method |
| Built-up / Vegetation Fraction | Fraction (0.00 – 1.00) | `%` (display ×100) | ESA WorldCover 10m |

---

## M. Evidence & Provenance Flow

Every claim displayed on the frontend has a verifiable lineage chain accessible via:
`GET /investigations/{id}/evidence/{evidence_id}/provenance`

Provenance structure:
```typescript
interface ClaimProvenanceResponse {
  investigation_id: string;
  claim_id: string;
  claim_text: string;
  mechanism_type: string;
  certainty_level: "FACT" | "MEASURED" | "DERIVED" | "SUPPORTED" | "PROXY" | "INFERRED" | "UNKNOWN";
  derivation_chain: FeatureDerivationResponse[];
  dataset_versions: DatasetVersionResponse[];
  source_files: SourceFileResponse[];
  data_sources: DataSourceResponse[];
  checksum_verified: boolean;
  limitations: string[];
}
```

---

## N. Limitations that Frontend MUST Display

The frontend **MUST NOT** hide material limitations in collapsible accordions. The canonical 8 limitations must be visible:

1. **30m DEM Micro-Topography**: Copernicus DEM does not capture street curbs or compound walls.
2. **Rainfall Spatial Resolution**: Regional interpolation smooths localized convective cloudbursts.
3. **Contributing Area Proxy**: Topographic approximation, not a calibrated hydrological basin.
4. **Drainage Temporal Mismatch**: 2023 GIS network shapefile mismatched against 2015 historical events.
5. **Static Land Cover**: 10m satellite classification does not dynamically capture rapid densification.
6. **Drain Blockage Unobserved**: Siltation and trash blockage during extreme events are unobserved (`UNKNOWN`).
7. **Historical Sample Size**: Empirical multi-event validation bounded by N=3 recorded events.
8. **No Hydrodynamic Model**: Causal mechanisms derived from comparative signals, not 2D SWMM/HEC-RAS models.

---

## O. Counterfactual Disclaimer that Frontend MUST Display

Every counterfactual view (`/counterfactual` and `/counterfactual/sensitivity`) **MUST** render the following disclaimer:

> **SCIENTIFIC DISCLAIMER**:
> *"Simplified counterfactual calculations use the rational screening method (Q = C × I × A). This is a comparative screening tool for relative policy exploration, NOT a calibrated 2D hydraulic or hydrodynamic flood forecast."*

---

## P. Loading, Error, and Empty State Expectations

1. **Investigation Running**: Initial investigation creation triggers asynchronous mechanism scoring and agent synthesis (`status: "running"`). Poll `GET /investigations/{id}` until `status: "completed"`.
2. **Missing Observations**: If an area has no flood observations, render *"No verified flood reports recorded for this event"* rather than *"No flooding occurred"*.
3. **Empty Drainage Networks**: If no SWD segments are present, display *"SWD network unmapped for this ward; drainage connectivity is UNKNOWN"*.

---

## Q. Map Data Endpoints

- Place Geometries: Included in `GET /locations/places` (GeoJSON Feature / WKT Element).
- Drainage Segments: `GET /drainage/segments?ward={ward}` (LineString WKT with `is_inferred` flag).
- Drainage Outfalls: `GET /drainage/outfalls` (Point WKT).
- Flood Observations: `GET /flood-observations?event_id={event_id}` (Point WKT + depth).

---

## R. Recommended Frontend Query Sequence

1. `GET /locations/places` — Populate location selector dropdowns.
2. `GET /events` — Populate historical storm event timeline.
3. `POST /investigations/comparisons?place_a_id={}&place_b_id={}` — Fetch explainable similarity preview.
4. `POST /investigations?comparison_id={}` — Trigger investigation.
5. `GET /investigations/{id}` — Load unified investigation detail dashboard.
6. `POST /investigations/{id}/counterfactual` — Interactive runoff reduction slider.
7. `GET /investigations/{id}/evidence/{evidence_id}/provenance` — Deep modal drawer on evidence click.

---

## S. Known Backend Limitations

- All spatial data is currently bounded to Chennai Metropolitan Area (Wards 101, 102, 177, 178).
- Multi-event validation is bounded to 2015, 2021, and 2023 flood events.
- Historical network temporal versioning defaults to 2023 survey topology for prior events.
