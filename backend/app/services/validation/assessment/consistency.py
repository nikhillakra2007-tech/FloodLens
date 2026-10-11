# Final Repository Structure

```
AWSxENVIRONMENT/
├── README.md                          # Project overview, quick start
├── LICENSE                            # MIT
├── .gitignore                         # Git ignore rules
├── .env.example                       # Environment template
├── docker-compose.yml                 # Local dev environment
├── Makefile                           # Common commands
├── backend/
│   ├── Dockerfile                     # Backend container
│   ├── requirements.txt               # Python dependencies
│   ├── alembic.ini                    # Migration config
│   ├── alembic/
│   │   ├── env.py                     # Migration environment
│   │   ├── script.py.mako             # Migration template
│   │   └── versions/
│   │       └── eaa799ae9ef1_initial_schema.py  # Initial schema migration
│   ├── app/
│   │   ├── main.py                    # FastAPI application entry
│   │   ├── core/
│   │   │   ├── config.py              # Settings via pydantic-settings
│   │   │   ├── database.py            # SQLAlchemy engine and session
│   │   │   └── logging.py             # Structured logging with request IDs
│   │   ├── db/
│   │   │   ├── base.py                # Declarative base, mixins
│   │   │   ├── session.py             # Session helper
│   │   │   └── models/
│   │   │       ├── source_models.py       # DataSource, SourceFile
│   │   │       ├── location_models.py     # Place, LocationFeature, TerrainFeature, LandcoverFeature
│   │   │       ├── drainage_models.py     # DrainNode, DrainSegment, Outfall
│   │   │       ├── flood_models.py        # FloodEvent, FloodObservation, RainfallObservation
│   │   │       ├── investigation_models.py # Comparison, Mechanism, Investigation, CounterfactualRun, AuditLog
│   │   │       └── evidence_models.py     # EvidenceItem
│   │   ├── schemas/
│   │   │   ├── location.py            # Place and feature schemas
│   │   │   ├── flood.py               # Flood event/observation schemas
│   │   │   ├── investigation.py       # Investigation/Comparison schemas
│   │   │   ├── evidence.py            # Evidence and mechanism schemas
│   │   │   └── counterfactual.py      # Counterfactual schemas
│   │   ├── repositories/
│   │   │   ├── locations.py           # Place/feature queries
│   │   │   ├── drainage.py            # Drainage spatial queries
│   │   │   ├── floods.py              # Flood event queries
│   │   │   ├── investigations.py      # Comparison/investigation persistence
│   │   │   └── evidence.py            # Evidence queries
│   │   ├── services/
│   │   │   ├── ingestion/
│   │   │   │   ├── pipeline.py        # CSV ingestion with dedup
│   │   │   │   ├── validation.py      # Record validation
│   │   │   │   └── provenance.py      # SHA-256 checksums
│   │   │   ├── geospatial/
│   │   │   │   ├── geometry.py        # Geometry helpers
│   │   │   │   ├── terrain.py         # Elevation/slope/HAND
│   │   │   │   ├── drainage.py        # Drainage network analysis
│   │   │   │   └── features.py        # Feature computation orchestrator
│   │   │   ├── comparison/
│   │   │   │   ├── similarity.py      # Weighted feature similarity
│   │   │   │   ├── candidates.py      # Candidate retrieval
│   │   │   │   └── comparator.py      # Full A/B comparison
│   │   │   ├── investigation/
│   │   │   │   ├── mechanisms.py      # Mechanism scoring functions
│   │   │   │   ├── evidence.py        # Evidence generation
│   │   │   │   ├── ranking.py         # Mechanism ranking
│   │   │   │   └── graph.py           # Mechanism graph builder
│   │   │   ├── counterfactual/
│   │   │   │   ├── model.py           # Bounded proxy model
│   │   │   │   ├── scenarios.py       # Scenario modifiers
│   │   │   │   └── runner.py          # Counterfactual execution
│   │   │   └── validation/
│   │   │       ├── historical.py      # Historical pattern validation
│   │   │       └── consistency.py     # Evidence consistency checks
│   │   ├── agent/
│   │   │   ├── agent.py               # Agent orchestration (local + Bedrock)
│   │   │   ├── tools.py               # Approved deterministic tools
│   │   │   ├── schemas.py             # Agent I/O schemas
│   │   │   ├── prompts.py             # System and investigation prompts
│   │   │   └── guardrails.py          # Safety and evidence discipline
│   │   ├── api/v1/
│   │   │   ├── router.py              # API router aggregator
│   │   │   ├── locations.py           # Location/flood endpoints
│   │   │   ├── investigations.py      # Investigation endpoints
│   │   │   ├── counterfactuals.py    # Counterfactual endpoints
│   │   │   └── map.py                 # Map data endpoints
│   │   └── workers/
│   │       ├── ingestion_worker.py    # Batch ingestion worker
│   │       └── investigation_worker.py # Async investigation worker
│   └── tests/
│       ├── conftest.py                # Test fixtures
│       ├── unit/                      # Unit tests
│       ├── adversarial/               # Adversarial/safety tests
│       ├── api/                       # API tests
│       └── integration/               # Integration tests
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
