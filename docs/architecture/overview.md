# FloodLens Architecture Overview

## System Architecture

FloodLens is a modular monolith with a clear dependency hierarchy:

```
Frontend (Next.js/Amplify)
    ↓ HTTP
API Layer (FastAPI/App Runner)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL + PostGIS / RDS)
    ↑
Agent Layer (Strands + Bedrock)
    ↓
Approved Tools (deterministic services)
```

## Core Domains

### Data Domain
- Ingestion pipeline with SHA-256 deduplication
- Validation and quarantine
- Source provenance tracking

### Geospatial Domain
- Terrain features (elevation, slope, HAND)
- Land cover fractions (built-up, vegetation, water)
- Drainage network analysis
- Spatial queries via PostGIS

### Comparison Domain
- Feature vector construction
- Weighted normalized similarity
- Configurable weights

### Investigation Domain
- Deterministic mechanism scoring
- Evidence generation with certainty classification
- Mechanism graph construction

### Counterfactual Domain
- Bounded proxy model (runoff coefficient × contributing area vs. effective capacity)
- Explicit disclaimer on all outputs

### Validation Domain
- Historical event pattern matching
- Recurring / Mixed / Weak / Insufficient classification

### Agent Domain
- Strands Agents SDK with Bedrock LLM
- Approved tools only (no arbitrary SQL)
- Evidence discipline enforcement
- Local fallback for offline development

## Key Design Decisions

1. **Deterministic engine owns facts** — mechanism ranking is computed, not learned
2. **Evidence classification** — every statement is FACT, SUPPORTED, HYPOTHESIS, or UNKNOWN
3. **No fabricated measurements** — missing data stays missing
4. **Bounded counterfactual** — transparent proxy, not a fake hydraulic model
5. **Idempotent ingestion** — SHA-256 checksums prevent duplicates
