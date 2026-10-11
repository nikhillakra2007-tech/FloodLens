# Final Repository Structure (Phase 2 Verified)

```
AWSxENVIRONMENT/
├── README.md                          # Project overview, quick start, and Phase 2 status
├── LICENSE                            # MIT License
├── .gitignore                         # Git ignore rules
├── .env.example                       # Environment template
├── docker-compose.yml                 # Local dev environment with PostgreSQL & PostGIS
├── Makefile                           # Common build and test commands
├── DATA_INVENTORY.md                  # Comprehensive Chennai dataset inventory & limitation resolution
├── scripts/
│   ├── ingest_chennai.py              # Automated batch ingestion script
│   ├── ingest_chennai_case001.py      # Case 001 verification ingestion script
│   ├── ingest_phase2.py               # Phase 2 expanded ingestion runner
│   ├── seed_demo.py                   # Demo data seeder
│   └── validate_data.py               # Pre-ingestion validation checks
├── data/
│   ├── manifests/
│   │   ├── chennai_case_001.json      # Case 001 dataset manifest with checksums
│   │   └── chennai_phase2.json        # Phase 2 multi-event dataset manifest
│   ├── raw/                           # Canonical source CSVs
│   │   ├── chennai_2015_flood_observations.csv
│   │   ├── chennai_2015_rainfall.csv
│   │   ├── chennai_flood_observations_all.csv
│   │   ├── chennai_gcc_drainage_network.csv
│   │   ├── chennai_gcc_drainage_network_full.csv
│   │   ├── chennai_hand_features.csv
│   │   ├── chennai_landcover_features.csv
│   │   ├── chennai_rainfall_all.csv
│   │   └── chennai_terrain_features.csv
│   └── processed/                     # Normalized processed artifacts
├── backend/
│   ├── Dockerfile                     # Backend container specification
│   ├── requirements.txt               # Python dependencies
│   ├── alembic.ini                    # Alembic migration configuration
│   ├── alembic/
│   │   ├── env.py                     # Migration environment
│   │   ├── script.py.mako             # Migration template
│   │   └── versions/
│   │       ├── eaa799ae9ef1_initial_schema.py   # Initial Case 001 schema migration
│   │       └── 1a2b3c4d5e6f_phase2_expansion.py # Phase 2 multi-event & lineage schema
│   ├── app/
│   │   ├── main.py                    # FastAPI application entry and middleware
│   │   ├── core/
│   │   │   ├── config.py              # Settings via pydantic-settings
│   │   │   ├── database.py            # SQLAlchemy engine, session, and PostGIS
│   │   │   └── logging.py             # Structured logging with request IDs
│   │   ├── db/
│   │   │   ├── base.py                # Declarative base and UUID/Timestamp mixins
│   │   │   ├── session.py             # Session helper
│   │   │   └── models/
│   │   │       ├── source_models.py       # DataSource, SourceFile
│   │   │       ├── location_models.py     # Place, LocationFeature, TerrainFeature, LandcoverFeature
│   │   │       ├── drainage_models.py     # DrainNode, DrainSegment, Outfall
│   │   │       ├── flood_models.py        # FloodEvent, FloodObservation, RainfallObservation
│   │   │       ├── investigation_models.py# Comparison, Mechanism, Investigation, CounterfactualRun, AuditLog
│   │   │       ├── evidence_models.py     # EvidenceItem
│   │   │       └── phase2_models.py       # FloodEventV2, DatasetVersion, FeatureDerivation, RainfallEventFeature, ContributingAreaProxy, DrainageNetworkVersion, ComparisonExplanation, ValidationRun
│   │   ├── schemas/
│   │   │   ├── location.py            # Place and feature schemas
│   │   │   ├── flood.py               # Flood event/observation schemas
│   │   │   ├── investigation.py       # Investigation/Comparison schemas
│   │   │   ├── evidence.py            # Evidence and mechanism schemas
│   │   │   ├── counterfactual.py      # Counterfactual schemas
│   │   │   └── phase2.py              # Phase 2 schemas (explanations, validations, versions, proxies)
│   │   ├── repositories/
│   │   │   ├── locations.py           # Place/feature queries
│   │   │   ├── drainage.py            # Drainage spatial queries
│   │   │   ├── floods.py              # Flood event queries
│   │   │   ├── investigations.py      # Comparison/investigation persistence
│   │   │   └── evidence.py            # Evidence queries
│   │   ├── services/
│   │   │   ├── aws/
│   │   │   │   └── storage.py         # AWS S3 and local-compatible object storage
│   │   │   ├── ingestion/
│   │   │   │   ├── pipeline.py        # CSV ingestion with dedup
│   │   │   │   ├── validation.py      # Record validation
│   │   │   │   ├── provenance.py      # SHA-256 checksums
│   │   │   │   ├── lineage.py         # Full feature derivation and provenance chain
│   │   │   │   └── phase2_ingestion.py# Multi-event and full drainage ingestion
│   │   │   ├── geospatial/
│   │   │   │   ├── geometry.py        # Geometry distance and buffer helpers
│   │   │   │   ├── terrain.py         # Elevation/slope/HAND helpers
│   │   │   │   ├── drainage.py        # Drainage network analysis
│   │   │   │   ├── features.py        # Feature computation orchestrator
│   │   │   │   ├── rainfall.py        # Event rainfall features & comparability engine
│   │   │   │   ├── catchment.py       # Catchment classification & contributing-area proxy
│   │   │   │   └── drainage_versioning.py # Temporal survey-to-event alignment
│   │   │   ├── comparison/
│   │   │   │   ├── similarity.py      # Weighted feature similarity
│   │   │   │   ├── candidates.py      # Candidate retrieval
│   │   │   │   ├── comparator.py      # Full A/B comparison orchestrator
│   │   │   │   └── explainable.py     # Decomposed explainable similarity engine
│   │   │   ├── investigation/
│   │   │   │   ├── mechanisms.py      # Mechanism scoring functions
│   │   │   │   ├── evidence.py        # Evidence generation
│   │   │   │   ├── ranking.py         # Mechanism ranking
│   │   │   │   └── graph.py           # Mechanism graph builder
│   │   │   ├── counterfactual/
│   │   │   │   ├── model.py           # Bounded proxy model with disclaimer
│   │   │   │   ├── scenarios.py       # Scenario modifiers
│   │   │   │   └── runner.py          # Counterfactual execution
│   │   │   └── validation/
│   │   │       ├── historical.py      # Historical pattern validation
│   │   │       ├── multi_event.py     # Multi-event recurrence evaluation
│   │   │       └── consistency.py     # Evidence consistency checks
│   │   ├── agent/
│   │   │   ├── agent.py               # Agent orchestration (local + Bedrock)
│   │   │   ├── tools.py               # Approved deterministic tools
│   │   │   ├── schemas.py             # Agent I/O schemas
│   │   │   ├── prompts.py             # System and investigation prompts
│   │   │   └── guardrails.py          # Safety and evidence discipline
│   │   ├── api/v1/
│   │   │   ├── router.py              # API router aggregator
│   │   │   ├── locations.py           # Location/place endpoints
│   │   │   ├── investigations.py      # Investigation, mechanism, and validation endpoints
│   │   │   ├── counterfactuals.py    # Counterfactual endpoints
│   │   │   ├── map.py                 # Map GeoJSON layer endpoints
│   │   │   ├── events.py              # Multi-event flood endpoints
│   │   │   ├── flood_observations.py  # Spatial observation endpoints
│   │   │   ├── rainfall.py            # Rainfall observation & comparability endpoints
│   │   │   ├── drainage.py            # Drainage version, segment, and outfall endpoints
│   │   │   ├── terrain.py             # Terrain & contributing-area proxy endpoints
│   │   │   └── data_sources.py        # Data source, version, and lineage endpoints
│   │   └── workers/
│   │       ├── ingestion_worker.py    # Batch ingestion worker
│   │       └── investigation_worker.py# Async investigation worker
│   └── tests/
│       ├── conftest.py                # Test database fixtures & engine
│       ├── unit/                      # 10 unit test modules (counterfactual, evidence, mechanisms, similarity, catchment, rainfall, drainage, explainable, lineage, multi-event)
│       ├── adversarial/               # Edge cases, guardrails, and Phase 2 scientific integrity tests
│       ├── api/                       # API route health and locations tests
│       └── integration/               # Full investigation flow and Phase 2 endpoints tests
├── frontend/                          # Next.js 14 investigation interface (Phase 3)
│   ├── app/                            # App Router pages
│   ├── components/                     # Domain components (map, investigation, evidence, counterfactual, ui)
│   ├── lib/                            # API client, types, schemas, hooks
│   ├── hooks/                          # React Query hooks
│   ├── styles/                         # Tailwind CSS
│   └── types/                          # TypeScript type definitions
└── docs/                              # Architecture, API, science, and testing documentation
```
