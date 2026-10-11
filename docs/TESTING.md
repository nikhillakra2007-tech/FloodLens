# Testing

## Test Suite Structure

```
backend/tests/
├── conftest.py              # Shared fixtures
├── unit/
│   ├── test_similarity.py      # Comparison similarity
│   ├── test_mechanisms.py       # Mechanism scoring
│   ├── test_counterfactual.py   # Counterfactual math
│   └── test_evidence.py         # Evidence generation
├── adversarial/
│   ├── test_guardrails.py       # Agent safety
│   └── test_edge_cases.py       # Edge case handling
├── api/
│   ├── test_health.py           # Health endpoint
│   └── test_locations.py        # Location endpoints
└── integration/
    └── test_investigation_flow.py # Full workflow
```

## Running Tests

```bash
# All tests
pytest backend/tests -v

# Unit only
pytest backend/tests/unit -v

# Adversarial
pytest backend/tests/adversarial -v

# API
pytest backend/tests/api -v

# Integration (requires seeded database)
pytest backend/tests/integration -v
```

## Frontend Checks

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

## Verification Gate

Before submission, verify:
- [ ] Database migration succeeds from empty database
- [ ] Seed succeeds and is idempotent
- [ ] Ingestion succeeds and is idempotent
- [ ] Spatial indexes exist
- [ ] Health endpoint returns 200
- [ ] Investigation completes with structured output
- [ ] Counterfactual executes with disclaimer
- [ ] Agent produces FACT/SUPPORTED/HYPOTHESIS/UNKNOWN classifications
- [ ] Frontend typechecks, lints, and builds
- [ ] All adversarial tests pass
