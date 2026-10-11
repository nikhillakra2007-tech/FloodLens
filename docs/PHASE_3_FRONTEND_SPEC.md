# FloodLens — Phase 3.1 Frontend Specification

**Status**: DRAFT FOR REVIEW  
**Phase**: 3.1 — Reconnaissance & Specification  
**Date**: 2026-10-09  

---

## 1. Product Definition

FloodLens is an evidence-backed flood mechanism investigation platform. It answers:

> "Why did one location repeatedly flood while a comparable location under similar rainfall and environmental conditions had no recorded flood observation?"

The application is **not** a generic flood dashboard and **not** an ungrounded AI chatbot. It is a structured scientific investigation tool that traces every claim to deterministic evidence and source provenance.

---

## 2. User Journey

The frontend must support this exact journey:

| Step | Action | Screen/Component | Key Data |
|------|--------|-----------------|----------|
| 1 | Open an investigation | Investigation selector or new investigation flow | Places list, comparison preview |
| 2 | Compare affected vs. comparison location | Side-by-side comparison view | Similarity score, feature breakdown |
| 3 | Explore geographic & environmental differences | Map + feature panels | Terrain, landcover, drainage layers |
| 4 | Inspect candidate mechanisms | Mechanism ranking list | Scores, confidence, certainty levels |
| 5 | Trace findings to evidence & provenance | Evidence drawer + provenance chain | Claims, lineage, checksums |
| 6 | Review historical validation | Validation summary panel | Multi-event support, N=3 |
| 7 | Explore counterfactual scenario | Counterfactual form + results | Runoff delta, sensitivity sweep |
| 8 | Understand uncertainty & limitations | Limitations panel + defensibility gates | 8 canonical limitations, gate results |

---

## 3. Verified Frontend Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 14.2+ | App Router, React Server Components where possible |
| UI Library | React | 18.3+ | Client components for interactive views |
| Language | TypeScript | 5.5+ | Strict mode enabled |
| Styling | Tailwind CSS | 3.4+ | Custom `flood` color palette already defined |
| Map | react-leaflet + Leaflet | 4.2 / 1.9 | OpenStreetMap tiles, no API key required |
| Charts | Recharts | 2.12+ | Already installed |
| Data Fetching | @tanstack/react-query | 5.50+ | Already installed, not yet used |
| Validation | Zod | 3.23+ | Already installed, used only for counterfactual |
| Utility | clsx | 2.1+ | Already installed |

### What Exists Today

- `frontend/app/page.tsx` — Monolithic 258-line dashboard with all sections inline
- `frontend/app/investigate/page.tsx` — Stub form (non-functional)
- `frontend/app/layout.tsx` — Minimal root layout
- `frontend/components/` — 12 components across `map/`, `comparison/`, `investigation/`, `counterfactual/`
- `frontend/lib/api.ts` — Basic fetch wrapper (missing 60% of endpoints)
- `frontend/lib/formatting.ts` — Score/percent/certainty formatters
- `frontend/lib/validation.ts` — Zod schema for counterfactual only
- `frontend/hooks/useInvestigation.ts` — Manual state management (no React Query)
- `frontend/hooks/useMapData.ts` — Map data fetching
- `frontend/types/` — Incomplete type definitions
- `frontend/styles/globals.css` — Tailwind directives + body styles

### Critical Gaps Identified

1. **No routing structure** — Everything is on one page
2. **Incomplete API client** — Missing provenance, defensibility, limitations, validation, sensitivity endpoints
3. **Incomplete types** — `Investigation` type missing `place_a`, `place_b`, `comparison`, `defensibility`, `limitations`, `provenance_summary`
4. **No React Query integration** — Manual `useState`/`useEffect` for all data fetching
5. **No provenance views** — Evidence items cannot be traced to sources
6. **No defensibility display** — 8-gate assessment not shown
7. **No limitations panel** — 8 canonical limitations not displayed
8. **Map bugs** — `FloodMarkers.tsx` and `DrainageLayer.tsx` use random positioning instead of actual coordinates
9. **No loading/error/empty states** — Minimal skeleton handling
10. **Generic visual design** — Blue/gray dashboard aesthetic, not a polished geospatial investigation tool

---

## 4. Visual Direction

### Design Principles

1. **Light-first, professional geospatial investigation interface**
2. **Clear typography hierarchy** — Distinct heading levels, readable body text
3. **Consistent spacing** — 4px base grid, generous whitespace
4. **Restrained borders and shadows** — Subtle separation, no heavy card stacks
5. **Strong map and evidence visualization** — Map is the primary spatial context
6. **Subtle motion** — Transitions on state changes, no decorative animation
7. **Responsive layouts** — Works on 1280px+ investigation workstations
8. **Accessible contrast** — WCAG AA minimum, visible focus states
9. **Explicit scientific uncertainty** — Certainty badges, limitation callouts, confidence intervals

### Color System

| Token | Value | Usage |
|-------|-------|-------|
| `flood-50` through `flood-900` | Blue scale (already in tailwind.config) | Primary brand, selected states |
| `green-600/700` | Success | FACT certainty, PASS gates |
| `blue-600/700` | Info | SUPPORTED certainty |
| `amber-600/700` | Warning | HYPOTHESIS certainty, DEFENSIBLE_WITH_MATERIAL_LIMITATIONS |
| `red-600/700` | Danger | NOT_DEFENSIBLE, CRITICAL limitations |
| `gray-500/600/700` | Neutral | UNKNOWN certainty, secondary text |
| `gray-50/100` | Background | Page background, subtle fills |

### Typography

- **Headings**: System font stack, semibold weight, tight tracking
- **Body**: System font stack, regular weight, relaxed line-height
- **Data/Numbers**: Tabular figures (`font-mono` or `font-variant-numeric: tabular-nums`)
- **Labels**: Uppercase, letter-spaced, small size for section headers

### Component Patterns

- **Mechanism cards**: Rank badge, name, score bar, certainty badge, confidence tooltip
- **Evidence items**: Claim text, certainty badge, value+unit, support score, provenance link
- **Provenance chain**: Vertical stepper with 7 levels, icons per level
- **Limitations**: Severity-tagged list, HIGH/CRITICAL pinned to header
- **Defensibility gates**: 8-gate grid with PASS/FAIL/CONDITIONAL status
- **Counterfactual**: Form with sliders, results with delta visualization, mandatory disclaimer

---

## 5. Application Architecture

### Routing

| Route | Page | Purpose |
|-------|------|---------|
| `/` | InvestigationDashboard | Main investigation workspace |
| `/investigations/new` | NewInvestigation | Create new comparison + investigation |
| `/investigations/[id]` | InvestigationDetail | Full investigation results |
| `/investigations/[id]/evidence/[evidenceId]` | EvidenceProvenance | Deep provenance chain view |

### Component Hierarchy

```
app/
  layout.tsx
  page.tsx                          → redirects to /investigations/new or loads default
  investigations/
    new/page.tsx                    → NewInvestigation flow
    [id]/page.tsx                   → InvestigationDetail shell
    [id]/evidence/[evidenceId]/page.tsx → EvidenceProvenance detail

components/
  layout/
    AppShell.tsx                    → Header + sidebar + main content area
    InvestigationHeader.tsx         → Title, status, defensibility verdict badge
    Sidebar.tsx                     → Navigation sections

  investigation/
    InvestigationSummary.tsx        → Agent summary + strongest mechanism
    MechanismCard.tsx               → Single mechanism with score/confidence/certainty
    MechanismList.tsx               → Ranked list of mechanisms
    MechanismGraph.tsx              → SVG causal DAG visualization
    ComparisonPanel.tsx             → Side-by-side place comparison
    FeatureBreakdown.tsx            → Similarity score decomposition
    ValidationPanel.tsx             → Historical multi-event validation
    DefensibilityPanel.tsx          → 8-gate assessment grid
    LimitationsPanel.tsx            → 8 canonical limitations list

  evidence/
    EvidenceCard.tsx                → Single evidence item with certainty badge
    EvidenceList.tsx                → Filterable evidence list
    ProvenanceChain.tsx             → 7-level lineage stepper
    ProvenanceDrawer.tsx            → Slide-over provenance detail

  counterfactual/
    CounterfactualForm.tsx          → Scenario parameter inputs
    CounterfactualResult.tsx        → Delta visualization
    SensitivityTable.tsx            → 15-scenario variation table
    CounterfactualDisclaimer.tsx    → Mandatory scientific disclaimer

  map/
    FloodMap.tsx                    → Main Leaflet map container
    PlaceMarker.tsx                 → Location markers with popups
    DrainageLayer.tsx               → Drain segment polylines
    FloodObservationLayer.tsx       → Flood point markers
    MapLegend.tsx                   → Layer legend

  ui/
    Badge.tsx                       → Certainty/severity/status badges
    ScoreBar.tsx                    → Horizontal score indicator
    LoadingSkeleton.tsx             → Skeleton placeholder
    ErrorState.tsx                  → Error message with retry
    EmptyState.tsx                  → No-data message
    Tooltip.tsx                     → Hover tooltip wrapper
```

### Data Fetching Strategy

- **React Query** for all server state (investigations, mechanisms, evidence, provenance)
- **Optimistic UI** for counterfactual form submissions
- **Polling** for investigation status (`status: "running"` → poll every 2s)
- **Prefetch** provenance data on evidence hover

### API Client Architecture

```
lib/
  api/
    client.ts                       → Base fetch wrapper with error handling
    locations.ts                    → Place endpoints
    investigations.ts               → Investigation endpoints
    evidence.ts                     → Evidence + provenance endpoints
    counterfactual.ts               → Counterfactual endpoints
    map.ts                          → Map data endpoints
  types/
    investigation.ts                → Full investigation types
    evidence.ts                     → Evidence + provenance types
    counterfactual.ts               → Counterfactual types
    map.ts                          → Map data types
    enums.ts                        → Re-exported backend enums
  schemas/
    investigation.ts                → Zod schemas for runtime validation
    evidence.ts                     → Zod schemas for evidence
    counterfactual.ts               → Zod schemas for counterfactual
  formatting.ts                     → Display formatters
  hooks/
    useInvestigation.ts             → Investigation query hooks
    useEvidence.ts                  → Evidence query hooks
    useProvenance.ts                → Provenance query hooks
    useCounterfactual.ts            → Counterfactual mutation hooks
    useMapData.ts                   → Map data query hooks
```

---

## 6. File Organization Rules

**Strictly enforced:**

1. Each React component has its own `.tsx` file
2. At most 1–2 closely related files per component/feature
3. Test files only when a separate test file is appropriate (e.g., `MechanismCard.test.tsx`)
4. `api-client.ts` (or `api/` directory) for centralized transport
5. Separate domain type/schema files when they have meaningful shared responsibility
6. No giant dashboard files
7. No multiple unrelated components in a single file
8. No `misc/` or overloaded `utils/` dumping grounds
9. Modular but practical — reuse existing conventions

---

## 7. Backend API Contract Summary

### Endpoints Required by Screen

| Screen | Endpoints | Essential |
|--------|-----------|-----------|
| Location Selection | `GET /locations/places`, `GET /locations/places/{id}/comparables` | Yes |
| Comparison | `POST /locations/compare`, `POST /investigations/comparisons` | Yes |
| Investigation | `POST /investigations`, `GET /investigations/{id}` | Yes |
| Mechanisms | `GET /investigations/{id}/mechanisms` | Yes |
| Evidence | `GET /investigations/{id}/evidence` | Yes |
| Provenance | `GET /investigations/{id}/evidence/{eid}/provenance` | Yes |
| Validation | `GET /investigations/{id}/validation` | Yes |
| Defensibility | `GET /investigations/{id}/defensibility` | Yes |
| Limitations | `GET /investigations/{id}/limitations` | Yes |
| Counterfactual | `POST /investigations/{id}/counterfactual` | Yes |
| Sensitivity | `POST /investigations/{id}/counterfactual/sensitivity` | Optional |
| Map Data | `GET /map/drains`, `GET /map/flood-observations` | Yes |
| Events | `GET /events` | Optional |
| Data Sources | `GET /data-sources` | Optional |

### Response Schema Verification

All backend responses use strict Pydantic models. Key schemas verified:

- `InvestigationDetailResponse` — Unified payload with all investigation data
- `MechanismResponse` — Score, confidence, certainty, rank, supporting/limiting evidence IDs
- `EvidenceItemResponse` — Claim, certainty, value, unit, support score, limitations, source independence
- `ClaimProvenanceResponse` — 7-level chain (claim → evidence → feature → derivation → source_file → dataset_version → source)
- `DefensibilityAssessmentResponse` — 8 gates, verdict, material limitations
- `ValidationRunResponse` — Multi-event validation with N=3
- `CounterfactualRunResponse` — Baseline/counterfactual output, delta, disclaimer
- `SensitivityReportResponse` — 15-scenario variation sweep

### Error Contract

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Investigation not found",
    "details": {}
  }
}
```

Standard codes: `INVALID_REQUEST` (400), `RESOURCE_NOT_FOUND` (404), `CONFLICT` (409), `VALIDATION_ERROR` (422), `INTERNAL_SERVER_ERROR` (500).

---

## 8. Scientific Status Enums (Frontend MUST Use)

| Enum | Values | Styling |
|------|--------|---------|
| `CertaintyLevel` | `FACT`, `SUPPORTED`, `HYPOTHESIS`, `UNKNOWN` | Solid badge for FACT/SUPPORTED, dashed for HYPOTHESIS, warning icon for UNKNOWN |
| `ValidationStatus` | `STRONG_SUPPORT`, `MODERATE_SUPPORT`, `WEAK_SUPPORT`, `MIXED`, `INSUFFICIENT_DATA` | Display with sample size (N=3) |
| `DefensibilityVerdict` | `DEFENSIBLE`, `DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`, `INSUFFICIENT_EVIDENCE` | Green / Amber / Gray |
| `LimitationSeverity` | `HIGH`, `MEDIUM`, `LOW` | HIGH/CRITICAL pinned to header |
| `GateStatus` | `PASS`, `FAIL`, `CONDITIONAL`, `UNKNOWN` | Green / Red / Amber / Gray |
| `SourceIndependenceType` | `INDEPENDENT_SOURCE`, `DEPENDENT_DERIVATION`, `SAME_SOURCE_SIGNAL` | Icon + label |
| `EvidenceRelationType` | `CORRELATION`, `ASSOCIATION`, `PROXY_INPUT`, `CAUSAL_HYPOTHESIS` | Edge style in graph |

---

## 9. Physical Units (Frontend MUST Display)

| Quantity | Unit | Symbol |
|----------|------|--------|
| Rainfall | Millimeters | mm |
| Elevation | Meters Above Mean Sea Level | m MSL |
| HAND | Meters | m |
| Drain Length | Meters | m |
| Drain Dimensions | Meters | m (width × depth) |
| Contributing Area | Square Kilometers | km² |
| Peak Runoff | Cubic Meters per Second | m³/s |
| Runoff Coefficient | Dimensionless | C |
| Built-up Fraction | Fraction | % (display ×100) |

---

## 10. Mandatory Display Requirements

### 10.1 Limitations (Cannot Be Hidden)

The 8 canonical limitations must be visible without collapsing:

1. Rainfall spatial resolution
2. DEM micro-topography
3. Contributing area proxy
4. Drainage temporal mismatch
5. Static land cover
6. Drain blockage unknown
7. Historical sample size
8. No calibrated hydraulic model

### 10.2 Counterfactual Disclaimer

Every counterfactual view MUST display:

> **SCIENTIFIC DISCLAIMER**: Simplified counterfactual calculations use the rational screening method (Q = C × I × A). This is a comparative screening tool for relative policy exploration, NOT a calibrated 2D hydraulic or hydrodynamic flood forecast.

### 10.3 Empty States

- No flood observations → "No verified flood reports recorded for this event"
- No drainage segments → "SWD network unmapped for this ward; drainage connectivity is UNKNOWN"

---

## 11. Non-Goals

- No real-time sensor data display
- No user authentication (internal development phase)
- No multi-city support (Chennai only)
- No mobile-first design (workstation-class investigation tool)
- No backend modifications
- No scientific calculation changes
