# FloodLens — Phase 2 Backend & Data Layer Freeze

**Status**: FROZEN & VERIFIED  
**Phase**: 2.7 Clean-State Reproducibility & Backend Freeze  
**Declaration**: **Backend and data layer frozen for frontend integration.**

---

## 1. Executive Summary & Progression

FloodLens has completed the sequential hardening and verification cycle across all Phase 2 sub-phases:

| Phase | Milestone Name | Key Outcome | Verified Status |
|---|---|---|---|
| **Phase 2** | Multi-Factor Hydrology & Lineage | Expanded multi-event rainfall, contributing-area proxy, drainage versioning, explainable similarity. | VERIFIED |
| **Phase 2.5** | Backend API Contract Hardening | Standardized Pydantic schemas, physical units, defensibility enums, unified detail endpoints, docs/API_CONTRACT.md. | VERIFIED |
| **Phase 2.6** | Evidence & Provenance Finalization | SHA-256 source file checksums, deep claim-level lineage, limitations endpoint, evidence citations. | VERIFIED |
| **Phase 2.7** | Clean-State Reproducibility & Freeze | Clean DB rebuild, 0-drift idempotent ingestion, 14 scientific boundary tests, 27 API smoke tests, agent safety freeze. | VERIFIED |

---

## 2. Test Suite & Quality Metrics

- **Total Backend Tests**: 97 tests
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0
- **XFail**: 0
- **Warnings**: 0 (`pytest -W error backend/tests`)
- **Execution Speed**: ~7.1 seconds

### Test Coverage Distribution:
- `backend/tests/contract/test_phase2_7_reproducibility.py`: 5 tests (clean state rebuild, 14 boundary rules, 27 API endpoints, performance/security/agent guardrails).
- `backend/tests/contract/test_phase2_6_provenance.py`: 12 tests (SHA-256 verification, lineage endpoints, limitation schemas).
- `backend/tests/contract/test_api_contract.py`: 4 tests (Pydantic validation, schema compliance).
- `backend/tests/adversarial/`: 18 tests (prompt injection, scientific guardrails, tool restriction, schema validation).
- `backend/tests/api/`: 7 tests (health check, places, routing).
- `backend/tests/integration/`: 5 tests (investigation lifecycle, phase 2 endpoints).
- `backend/tests/unit/`: 46 tests (mechanisms, ranking, explainable similarity, counterfactual sensitivity, drainage topology).

---

## 3. Database Schema State & Migration Head

- **Database Engine**: PostgreSQL 16 + PostGIS Extension (`ST_DWithin`, `ST_Distance`, `WKTElement`).
- **ORM / Migrations**: SQLAlchemy 2.0 + Alembic.
- **Alembic Revision Head**: `1a2b3c4d5e6f` (`phase2_comprehensive_schema`).
- **Downgrade/Upgrade Integrity**: Verified clean rollback (`-1`) and re-application (`upgrade head`) without schema residue.
- **All Spatial Indexes Verified**:
  - `idx_places_location` on `places (location)`
  - `idx_drain_nodes_geom` on `drain_nodes (geom)`
  - `idx_drain_segments_geom` on `drain_segments (geom)`
  - `idx_outfalls_geom` on `outfalls (geom)`
  - `idx_flood_observations_geom` on `flood_observations (location)`
- **Foreign Keys & Constraints**: Complete referential integrity across sources, dataset versions, derivations, and investigations.

---

## 4. Dataset Counts (Deterministic Clean Ingestion)

Re-run ingestion executed twice on a pristine database. 0-drift idempotency verified:

| Table / Entity | Verified Row Count | Idempotency Check |
|---|---|---|
| `data_sources` | 7 | Zero duplication |
| `source_files` | 9 | Zero duplication |
| `dataset_versions` | 10 | Zero duplication |
| `places` | 4 (Anna Nagar 101/102, Velachery 177/178) | Zero duplication |
| `flood_events` | 3 (2015, 2021, 2023) | Zero duplication |
| `flood_observations` | 17 | Zero duplication |
| `rainfall_observations` | 104 | Zero duplication |
| `rainfall_event_features` | 12 | Zero duplication |
| `terrain_features` | 4 | Zero duplication |
| `landcover_features` | 4 | Zero duplication |
| `drain_nodes` | 32 | Zero duplication |
| `drain_segments` | 20 | Zero duplication |
| `outfalls` | 6 | Zero duplication |
| `drainage_network_versions` | 3 | Zero duplication |
| `contributing_area_proxies` | 4 | Zero duplication |
| `feature_derivations` | 16 | Zero duplication |
| `investigations` | 0 (Clean state prior to user runs) | Zero duplication |

---

## 5. Case 001 Scientific Verification

**Canonical Comparison**: Anna Nagar (Ward 101) vs Velachery (Ward 177) — 2015 Extreme Event.

- **Similarity Score**: `0.812`
  - Rainfall Similarity: `1.000` (Homogeneous regional storm)
  - Terrain Similarity: `0.900`
  - Drainage Similarity: `0.700`
  - Landcover Similarity: `0.850`
  - Spatial Proximity Similarity: `0.612`
- **Mechanism Rankings & Scores**:
  1. `RUNOFF_CONCENTRATION` — Score: `0.35`, Confidence: `0.50` (Certainty: `SUPPORTED`)
  2. `TERRAIN_DEPRESSION` — Score: `0.35`, Confidence: `0.50` (Certainty: `SUPPORTED`)
  3. `IMPERVIOUS_SURFACE` — Score: `0.35`, Confidence: `0.40` (Certainty: `SUPPORTED`)
  4. `DRAINAGE_CAPACITY` — Score: `0.00`, Confidence: `0.30` (Certainty: `UNKNOWN`)
  5. `DRAINAGE_CONNECTIVITY` — Score: `0.00`, Confidence: `0.30` (Certainty: `UNKNOWN`)
  6. `OUTFALL_RESTRICTION` — Score: `0.00`, Confidence: `0.30` (Certainty: `UNKNOWN`)
  7. `WATERBODY_INTERACTION` — Score: `0.00`, Confidence: `0.30` (Certainty: `UNKNOWN`)
  8. `INSUFFICIENT_EVIDENCE` — Score: `0.10`, Confidence: `0.30` (Certainty: `UNKNOWN`)
- **Historical Multi-Event Validation**:
  - Result: `MODERATE_SUPPORT`
  - Sample Size: `N=3` events (2015, 2021, 2023)
  - Recurring Mechanisms: `RUNOFF_CONCENTRATION`, `TERRAIN_DEPRESSION`, `IMPERVIOUS_SURFACE`
  - Confidence: `0.60`
- **Defensibility Verdict**:
  - Verdict: `DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`
  - Correlation Gates: 5/5 PASS
  - Causal Mechanism Specificity: FAIL (Co-occurring terrain and imperviousness confounders prevent singular causal attribution).
- **Counterfactual Runoff Screening**:
  - Baseline Runoff: `987.45 m³/s`
  - Modified Runoff (20% imperviousness reduction): `788.96 m³/s`
  - Delta: `-198.49 m³/s` (`-20.10%`)
  - Status: Rationally bounded screening calculation (`is_calibrated_hydraulic_prediction = False`).

---

## 6. Scientific Boundary Protections (Automated 14 Rules)

Automated regression test `test_scientific_boundary_protections_14_rules` validates:
1. Built-up land-cover fraction != exact imperviousness measurement (`CertaintyLevel != FACT`, proxy noted).
2. HAND != observed flood depth (unit is meters relative to drain, not flood depth).
3. Analysis window != true hydrological catchment (`is_true_catchment = False`).
4. Contributing-area proxy != calibrated catchment model (methodology tracked as proxy).
5. Missing flood observation != proof that flooding did not occur (absence is unobserved / insufficient evidence, never false negative).
6. Flooding != proof of drainage blockage (sub-surface blockage is explicitly unobserved).
7. Correlation != causation (verdict is bounded to `DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`).
8. N=3 historical events != strong statistical certainty (sample size N=3 explicitly exposed; confidence capped at 0.60).
9. Simplified counterfactual != calibrated hydraulic prediction (disclaimer enforced).
10. Inferred geometry != directly surveyed geometry (`is_inferred` flag preserved per segment).
11. 30m DEM limitation remains visible.
12. Rainfall station spatial limitation remains visible.
13. 2020 WorldCover temporal limitation remains visible.
14. Unknown blockage evidence remains `UNKNOWN`.

---

## 7. API Contract & Security Sanity

- **Endpoints Audited**: 27 frontend-critical endpoints tested against `docs/API_CONTRACT.md`.
- **Response Schemas**: 100% Pydantic models with strict typing.
- **Physical Units**: Explicit units exposed on every numeric response.
- **Security Check**:
  - 0 local file paths exposed (all paths abstracted to source dataset identifiers).
  - 0 database credentials exposed.
  - 0 internal stack traces leaked on 4xx/5xx errors.
  - Standardized error envelope: `{"error": str, "detail": str, "status_code": int}`.

---

## 8. Agent Safety Freeze

- The LLM agent is strictly constrained to an explanation and synthesis layer.
- Agent cannot fabricate evidence or observations.
- Agent cannot upgrade `UNKNOWN` evidence to `FACT`.
- Agent cannot mutate the database (read-only session enforced).
- Agent cannot override deterministic mechanism rankings or defensibility gates.
- Simplified counterfactuals cannot be described as hydraulic simulations.

---

## 9. AWS Readiness

- Local and AWS S3 storage adapters implemented (`StorageClient` abstraction).
- PostgreSQL + PostGIS container and RDS-ready connection handling.
- Environment-based configuration switching (`AWS_S3_BUCKET`, `AWS_REGION`).

---

## 10. Repository Hygiene

- Temporary files, scratch logs, and unused experiment artifacts removed.
- Documentation organized in `docs/`:
  - `docs/API_CONTRACT.md`
  - `docs/FRONTEND_HANDOFF.md`
  - `docs/EVIDENCE_PROVENANCE.md`
  - `docs/PHASE_2_BACKEND_FREEZE.md`
- Backend code organized cleanly into `api/`, `agent/`, `db/`, `repositories/`, `schemas/`, and `services/`.
- No monolithic files or utils dumps.

---

## 11. Final Freeze Declaration

The backend API, geospatial database, deterministic hydrology scoring, and provenance lineage are formally:

**FROZEN FOR FRONTEND INTEGRATION**

No further modifications will be made to:
- Scientific mechanism scoring
- Defensibility rules and gates
- Counterfactual equations
- API contract signatures
- Database schema or migrations
