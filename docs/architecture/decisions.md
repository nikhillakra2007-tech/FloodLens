# Architecture Decision Records

## ADR-001: Modular Monolith over Microservices

**Decision:** Single FastAPI application with clear module boundaries.

**Rationale:** Hackathon scope does not justify distributed system complexity. Modular monolith provides clear separation of concerns while keeping deployment simple.

## ADR-002: Deterministic Mechanism Scoring

**Decision:** Mechanism scores computed from configured weights and signal thresholds, not ML.

**Rationale:** No training data exists for hackathon. Deterministic scoring is reproducible, explainable, and testable.

## ADR-003: Local Agent Fallback

**Decision:** Agent runs in deterministic local mode by default; Bedrock mode available via configuration.

**Rationale:** AWS credentials unavailable in all environments. Local mode ensures the full workflow is testable offline while production uses real Bedrock integration.

## ADR-004: Bounded Counterfactual Proxy

**Decision:** Simple runoff coefficient × contributing area vs. effective capacity model.

**Rationale:** No calibrated hydraulic model available. Proxy is transparent, bounded, and always labeled as such.

## ADR-005: SHA-256 Idempotent Ingestion

**Decision:** Every source file gets SHA-256 checksum; duplicates rejected.

**Rationale:** Ensures idempotent ingestion without complex deduplication logic.
