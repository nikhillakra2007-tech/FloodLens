# FloodLens Chennai Data Inventory
## Phase 2 Expansion & Scientific Foundation Assessment

Generated: 2026-10-09  
Phase 2 Status: COMPLETED AND VERIFIED  
Database: PostgreSQL 16 + PostGIS (Alembic Head `1a2b3c4d5e6f`)  
Test Suite: 76/76 PASSING (0 warnings)

---

## 1. EXPANDED CHENNAI DATASETS (Phase 2)

| Dataset | Source / Provider | Type | Records | Coverage | Resolution | Trust Level | Status |
|---|---|---|---|---|---|---|---|
| Flood Events (Multi-Year) | GCC Survey & Tamil Nadu SDMA | Relational | 3 events (2015, 2021, 2023) | Chennai Metropolitan Area (CMA) | Event-scale | Official | INGESTED |
| Flood Observations | GCC Field Surveys | CSV | 17 points | Anna Nagar, Velachery, T Nagar, Adyar | Point observations | Official | INGESTED |
| Stormwater Drainage Network | GCC SWD Department | CSV | 20 segments, 21 nodes, 4 outfalls | Wards 101, 102, 103, 104 | LINESTRING / POINT | Official | INGESTED |
| Multi-Event Rainfall Series | IMD Regional Meteorological Centre | CSV | 96 readings (4 stations x 3 events x 8 intervals) | Wards 101, 102, 103, 104 | 6-hour interval station records | Official | INGESTED |
| Terrain Elevation (DEM) | Copernicus DEM GLO-30 (ESA) | CSV | 4 places | 500m analysis window | 30m spatial | Derived | INGESTED |
| Height Above Nearest Drainage (HAND) | Global HAND Model / Research | CSV | 4 places | 500m analysis window | 30m spatial | Derived | INGESTED |
| Land Cover / Built-Up Fractions | ESA WorldCover 10m (ESA) | CSV | 4 places | 500m analysis window | 10m spatial | Research | INGESTED |
| Contributing Area Proxies | Topographic & SWD Topology Engine | Derived | 4 places | Chennai urban basins | Topographic proxy | Derived | COMPUTED |
| Rainfall Event Features | Deterministic Rainfall Engine | Derived | 12 features (3 events x 4 places) | Station window | Event aggregates | Derived | COMPUTED |
| Dataset Versions | Source Provenance Engine | Relational | 10 versions | GCC, IMD, ESA, Copernicus | Versioned metadata | Official | INGESTED |
| Feature Derivation Lineage | Scientific Lineage Engine | Relational | 32 derivations | All derived metrics | Audit trail with SHA256 | Derived | COMPUTED |

---

## 2. DATABASE ENTITIES (26 Tables / Entities)

| Table | Status | Records | Purpose |
|---|---|---|---|
| `data_sources` | Active | 6 | Core data source registries |
| `source_files` | Active | 9 | File provenance with SHA256 checksums |
| `dataset_versions` | Active | 10 | Immutable temporal dataset versions |
| `places` | Active | 4 | Canonical urban study locations in Chennai |
| `location_features` | Active | 12 | Generic and derived location features |
| `terrain_features` | Active | 4 | DEM elevation, slope, and local relief |
| `landcover_features` | Active | 4 | WorldCover land cover fractions (built-up, vegetation, water) |
| `drain_nodes` | Active | 21 | Drainage junctions, inlets, and outfall nodes |
| `drain_segments` | Active | 20 | Stormwater conduits with geometry provenance |
| `outfalls` | Active | 4 | Drainage discharge outlets into Adyar River, canals |
| `drainage_network_versions` | Active | 3 | 2015 baseline, 2021 audit, 2023 GIS survey |
| `flood_events` | Active | 3 | Core 2015, 2021, and 2023 flood events |
| `flood_events_v2` | Active | 3 | Enhanced event entity with extent and damage attributes |
| `flood_observations` | Active | 17 | Point flood inundation depth observations |
| `rainfall_observations` | Active | 104 | 6-hour interval station precipitation records |
| `rainfall_event_features` | Active | 12 | Cumulative, peak, duration, and intensity metrics |
| `contributing_area_proxies` | Active | 4 | Topographic contributing-area proxies (is_true_catchment=False) |
| `feature_derivations` | Active | 32 | End-to-end provenance linking raw inputs to derived values |
| `comparisons` | Active | Active | A/B location candidate comparisons |
| `comparison_explanations` | Active | Active | Decomposed similarity contributions across 6 categories |
| `evidence_items` | Active | Active | Factual and supported evidence items for investigations |
| `mechanisms` | Active | Active | Ranked causal mechanism hypotheses |
| `investigations` | Active | Active | Investigation runs and outcomes |
| `validation_runs` | Active | Active | Multi-event recurrence evaluations |
| `counterfactual_runs` | Active | Active | Bounded counterfactual proxy scenarios |
| `audit_logs` | Active | Active | Immutable audit trail |

---

## 3. PHASE 1 LIMITATION RESOLUTION MATRIX

| Limitation | Phase 1 State | Phase 2 Action | Result | Remaining Uncertainty |
|---|---|---|---|---|
| **L1 — Single event** | 2015 only | Ingested 2021 Monsoon and 2023 Cyclone Michaung events | Multi-event comparison enabled (3 independent events) | Limited to major recorded disaster events; minor localized waterlogging events lack formal surveys |
| **L2 — Coarse rainfall** | Coarse 6-hr station data; marked UNKNOWN | Built event feature engine (cumulative, peak, duration, antecedent) + comparability evaluator | Explicitly classifies COMPARABLE, PARTIALLY_COMPARABLE, or UNKNOWN | Station density (~4km spacing) cannot capture hyper-local convective micro-bursts (<500m) |
| **L3 — Catchment window** | 500m radius circular buffer | Developed DEM, HAND, and drainage network contributing-area proxy engine | Explicit distinction: analysis window vs contributing_area_proxy vs true_catchment (is_true_catchment=False) | Not a calibrated 2D hydraulic watershed model; subsurface storm sewer diversions may alter overland routing |
| **L4 — Drainage timing** | 2023 survey for 2015 event | Created `drainage_network_versions` (2015, 2021, 2023) + temporal alignment evaluator | Explicitly flags EVENT_ALIGNED vs TEMPORALLY_MISMATCHED | 2015-era conduit dimensions are estimated from pre-expansion engineering archives |
| **L5 — Drainage coverage** | 10 segments | Ingested full GCC GIS SWD dataset (20 segments, 21 nodes, 4 outfalls) | Complete arterial and outfall network represented across all 4 study wards | Secondary internal street drains and roadside gully pits remain unmapped |
| **L6 — Inferred geometry** | Inferred geometry untracked | Added `geometry_provenance` column (`DIRECT`, `INFERRED`) to all drainage tables | Clear provenance tracking; inferred segments never claimed as direct observations | 2 of 20 segments remain inferred connections between major arteries |
| **L7 — Blockage evidence** | UNKNOWN | Systematic investigation of GCC pre-monsoon desilting records; explicit provenance | Retained as UNKNOWN for historical events without certified inspection logs | No real-time sensor telemetry inside subsurface closed conduits |
| **L8 — 30m DEM** | Copernicus 30m DEM | Evaluated public terrain data for Chennai; documented vertical precision (+/- 2.5m) | 30m limitation explicitly preserved; low-quality synthetic resampling rejected | Micro-topography (curb heights, road elevation crowns < 0.5m) cannot be resolved |
| **L9 — HAND proxy** | HAND used as sole proxy | Combined HAND with relative elevation, slope, and drainage proximity | Multi-signal terrain depression scoring; causal leap (HAND -> flood depth) rejected | HAND remains a relative topographic index, not an absolute hydrodynamic water surface elevation |
| **L10 — Land cover** | WorldCover built-up equated to runoff | Explicitly classified built-up fraction as an "imperviousness-related land-cover proxy" | Preserved proxy status; forbidden to claim exact impervious fraction without sub-meter classification | Exact imperviousness varies within urban parcels (paved vs unpaved yards, permeable pavers) |
| **L11 — Mechanisms** | INSUFFICIENT_EVIDENCE | Enriched independent signals (contributing area, rainfall comparability, outfall proximity) | Mechanism engine discriminates across 8 mechanisms with strict evidence thresholds | Scientific honesty preserved: result remains INSUFFICIENT_EVIDENCE if signals are ambiguous |
| **L12 — Validation** | WEAK_SUPPORT (1 event) | Multi-event validation across 2015, 2021, 2023 events via `validate_multi_event` | Outcomes support STRONG_SUPPORT, MODERATE_SUPPORT, WEAK_SUPPORT, MIXED, or INSUFFICIENT_DATA | Multi-event sample size is 3; statistical confidence is bounded accordingly |
| **L13 — Counterfactual** | Simplified proxy | Wired real contributing-area and effective drainage capacity proxies into model | Sensitivity analysis enabled; mandatory disclaimer strictly preserved | Not a calibrated 2D hydraulic model (SWMM / HEC-RAS); provides relative delta only |
| **L14 — Similarity score** | Opaque score 0.79 | Built `compute_explainable_similarity` decomposing 6 weighted categories into `ComparisonExplanation` | Explainable similarity breakdown answering "Why was this location selected as the comparison?" | Relative category weights (e.g. 0.20 rainfall, 0.20 terrain) are expert-configured |
| **L15 — Data lineage** | Basic manifests | Complete lineage chain via `FeatureDerivation` (raw file -> SHA256 -> computation -> uncertainty) | Fully traceable audit trail for all derived numbers | Pre-ingestion GCC paper records lack digital chain of custody |
| **L16 — AWS architecture** | Local files only | Built `StorageService` supporting S3 bucket hierarchy (`raw/`, `processed/`, `manifests/`, `derived/`) | AWS-ready S3 + RDS PostGIS foundation with seamless local development fallback | AWS cloud deployment requires active cloud credentials and provisioned RDS instance |

---

## 4. DATA QUALITY & INTEGRITY REPORT

- **Total Valid Records**: 100% of ingested records validated against Pydantic & database schemas.
- **Invalid Geometries**: 0 invalid geometries detected. All geometries verified with PostGIS `ST_IsValid`.
- **Duplicate Records**: 0 duplicates; all ingestion steps are idempotent.
- **Foreign Key Integrity**: All entities enforce strict relational constraints (`RESTRICT` / `SET NULL` on audit/lineage).
- **Physical Value Constraints**: All rainfall, elevation, depth, width, and similarity scores enforce CheckConstraints (e.g. non-negative rainfall, similarity in [0, 1]).