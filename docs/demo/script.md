# Demo Script

## Prerequisites
- Backend running at localhost:8000
- Database seeded with demo data
- Frontend running at localhost:3000

## Demo Flow (3 minutes)

### 0:00 — Introduction
"FloodLens investigates why a location floods differently from a comparable location."

### 0:15 — Map & Location Selection
- Open http://localhost:3000
- Chennai map visible with 4 markers
- Red markers = flood locations (Anna Nagar, T Nagar)
- Green markers = comparable locations (Velachery, Adyar)
- Click Anna Nagar (Location A)

### 0:30 — Historical Context
- "Anna Nagar has 1 flood observation from Nov 2024 synthetic event"
- Show severity, depth

### 0:45 — Find Comparables
- Click "Find Comparables"
- Deterministic engine ranks Velachery (85%) and Adyar (72%)
- Select Velachery (Location B)

### 1:00 — A vs B Comparison
- Show similarity score
- Feature-by-feature comparison bars
- Key differences: HAND, built-up fraction, drain density

### 1:15 — Start Investigation
- Click "Start Investigation"
- Deterministic mechanism ranking appears
- Strongest: TERRAIN_DEPRESSION (score 0.65)
- Alternative: IMPERVIOUS_SURFACE (score 0.45)

### 1:30 — Mechanism Graph
- Directed graph: Rainfall → Catchment → Runoff → Drain Network → Bottleneck → Flood
- Click edge to inspect evidence

### 1:45 — Evidence Drawer
- FACT: "Built-up fraction = 0.78"
- SUPPORTED: "Higher upstream built-up fraction is consistent with greater runoff"
- UNKNOWN: "No direct blockage observation available"

### 2:00 — Counterfactual
- Set runoff coefficient reduction: 20%
- Run scenario
- Show: "Excess flow reduced by 28% (proxy, not calibrated prediction)"

### 2:15 — Historical Validation
- Result: RECURRING_SUPPORT or INSUFFICIENT_DATA
- Show confidence level

### 2:30 — Summary
- Strongest mechanism identified
- Evidence traceable to sources
- Counterfactual shows bounded improvement
- Unknowns explicitly stated

### 2:45 — AWS Services
- "Built with AWS: S3, RDS/PostGIS, Bedrock, Strands, Amplify, App Runner, CloudWatch"

## Reset Demo
```bash
cd backend
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
alembic upgrade head
cd .. && python scripts/seed_demo.py
```
