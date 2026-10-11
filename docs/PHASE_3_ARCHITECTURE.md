# FloodLens — Phase 3.1 Frontend Architecture

**Status**: DRAFT FOR REVIEW  
**Date**: 2026-10-09  

---

## 1. Proposed Repository Structure

```
frontend/
├── app/
│   ├── layout.tsx                      → Root layout with providers         [DONE]
│   ├── page.tsx                        → Redirect to /investigations/new    [DONE]
│   ├── providers.tsx                   → React Query provider wrapper       [DONE]
│   ├── investigations/
│   │   ├── new/
│   │   │   └── page.tsx                → New investigation flow             [DONE]
│   │   └── [id]/
│   │       ├── page.tsx                → Investigation detail shell        [DONE]
│   │       └── evidence/
│   │           └── [evidenceId]/
│   │               └── page.tsx        → Evidence provenance detail       [PENDING]
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx                → Header + main content area         [DONE]
│   │   ├── InvestigationHeader.tsx     → Title, status, verdict badge      [DONE]
│   │   └── Sidebar.tsx                 → Section navigation                 [DONE]
│   │
│   ├── investigation/
│   │   ├── InvestigationSummary.tsx    → Agent summary + strongest mechanism [PENDING]
│   │   ├── MechanismCard.tsx           → Single mechanism display            [PENDING]
│   │   ├── MechanismList.tsx           → Ranked mechanism list              [DONE]
│   │   ├── MechanismGraph.tsx          → SVG causal DAG visualization       [PENDING]
│   │   ├── ComparisonPanel.tsx         → Side-by-side place comparison      [DONE]
│   │   ├── FeatureBreakdown.tsx        → Similarity score decomposition     [PENDING]
│   │   ├── ValidationPanel.tsx         → Historical multi-event validation  [DONE]
│   │   ├── DefensibilityPanel.tsx      → 8-gate assessment grid            [DONE]
│   │   └── LimitationsPanel.tsx        → Canonical limitations list         [DONE]
│   │
│   ├── evidence/
│   │   ├── EvidenceCard.tsx            → Single evidence item with certainty badge [PENDING]
│   │   ├── EvidenceList.tsx            → Filterable evidence list           [DONE]
│   │   ├── ProvenanceChain.tsx         → 7-level lineage stepper            [PENDING]
│   │   └── ProvenanceDrawer.tsx        → Slide-over provenance detail       [PENDING]
│   │
│   ├── counterfactual/                                                           [PENDING]
│   │   ├── CounterfactualForm.tsx      → Scenario parameter inputs
│   │   ├── CounterfactualResult.tsx    → Delta visualization
│   │   ├── SensitivityTable.tsx        → 15-scenario variation table
│   │   └── CounterfactualDisclaimer.tsx → Mandatory scientific disclaimer
│   │
│   ├── map/
│   │   ├── FloodMap.tsx                → Main Leaflet map container          [DONE]
│   │   ├── PlaceMarker.tsx             → Location markers with popups        [PENDING]
│   │   ├── DrainageLayer.tsx           → Drain segment polylines            [DONE]
│   │   ├── FloodObservationLayer.tsx   → Flood point markers                [DONE]
│   │   └── MapLegend.tsx               → Layer legend                        [DONE]
│   │
│   └── ui/
│       ├── Badge.tsx                   → Certainty/severity/status badges   [DONE]
│       ├── ScoreBar.tsx                → Horizontal score indicator         [DONE]
│       ├── LoadingSkeleton.tsx         → Skeleton placeholder              [DONE]
│       ├── ErrorState.tsx              → Error message with retry          [DONE]
│       ├── EmptyState.tsx              → No-data message                   [DONE]
│       └── Tooltip.tsx                 → Hover tooltip wrapper              [PENDING]
│
├── lib/
│   ├── api/
│   │   ├── client.ts                   → Base fetch + error handling       [DONE]
│   │   ├── locations.ts                → Place endpoints                   [DONE]
│   │   ├── investigations.ts           → Investigation endpoints          [DONE]
│   │   ├── evidence.ts                 → Evidence + provenance endpoints   [DONE]
│   │   ├── counterfactual.ts           → Counterfactual endpoints         [DONE]
│   │   └── map.ts                      → Map data endpoints                [DONE]
│   ├── types/
│   │   ├── investigation.ts            → Full investigation types         [DONE]
│   │   ├── evidence.ts                 → Evidence + provenance types      [DONE]
│   │   ├── counterfactual.ts           → Counterfactual types             [DONE]
│   │   ├── map.ts                      → Map data types                   [DONE]
│   │   └── enums.ts                    → Backend enum re-exports           [DONE]
│   ├── schemas/
│   │   ├── investigation.ts            → Zod validation schemas            [DONE]
│   │   ├── evidence.ts                 → Evidence Zod schemas               [DONE]
│   │   └── counterfactual.ts           → Counterfactual Zod schemas        [DONE]
│   ├── formatting.ts                   → Display formatters                [DONE]
│   └── constants.ts                    → UI constants (colors, labels)     [DONE]
│
├── hooks/
│   ├── useInvestigation.ts             → Investigation query hooks         [DONE]
│   ├── useEvidence.ts                  → (merged into useInvestigation)    [DONE]
│   ├── useProvenance.ts                → Provenance query hooks            [PENDING]
│   ├── useCounterfactual.ts            → Counterfactual mutation hooks     [PENDING]
│   └── useMapData.ts                   → Map data query hooks              [DONE]
│
├── styles/
│   └── globals.css                     → Tailwind + custom styles          [DONE]
│
├── tailwind.config.js                  → Extended theme                    [DONE]
├── postcss.config.js                                                        [DONE]
├── tsconfig.json                                                             [DONE]
├── package.json                                                               [DONE]
├── vitest.config.ts                                                           [DONE]
├── eslint.config.mjs                                                          [DONE]
├── eslintignore                                                              [DONE]
└── next.config.js                      → Next.js configuration             [DONE]
```

---

## 2. Component Responsibilities

### 2.1 Layout Components

| Component | Responsibility |
|-----------|---------------|
| `AppShell` | Top-level layout: header, main content area, optional sidebar |
| `InvestigationHeader` | Investigation title, ID, status badge, defensibility verdict badge |
| `Sidebar` | Section navigation (Summary, Mechanisms, Evidence, Counterfactual, Validation) |

### 2.2 Investigation Components

| Component | Responsibility | Data Source |
|-----------|---------------|-------------|
| `InvestigationSummary` | Agent summary text, strongest mechanism callout | `InvestigationDetailResponse` |
| `MechanismCard` | Single mechanism: rank, name, score bar, certainty badge, confidence | `MechanismResponse` |
| `MechanismList` | Ranked list of all mechanisms | `MechanismResponse[]` |
| `MechanismGraph` | SVG DAG with epistemic edge styling | `MechanismGraphResponse` |
| `ComparisonPanel` | Side-by-side place comparison with similarity score | `ComparisonResponse` |
| `FeatureBreakdown` | Decomposed similarity bars (rainfall, terrain, drainage, etc.) | `SimilarityBreakdown` |
| `ValidationPanel` | Multi-event validation result with N=3 | `ValidationRunResponse` |
| `DefensibilityPanel` | 8-gate grid with PASS/FAIL status | `DefensibilityAssessmentResponse` |
| `LimitationsPanel` | 8 canonical limitations with severity tags | `InvestigationLimitationResponse[]` |

### 2.3 Evidence Components

| Component | Responsibility | Data Source |
|-----------|---------------|-------------|
| `EvidenceCard` | Claim, certainty badge, value+unit, support score, provenance link | `EvidenceItemResponse` |
| `EvidenceList` | Filterable list by mechanism type | `EvidenceItemResponse[]` |
| `ProvenanceChain` | 7-level vertical stepper | `ClaimProvenanceResponse` |
| `ProvenanceDrawer` | Slide-over panel with full chain | `ClaimProvenanceResponse` |

### 2.4 Counterfactual Components

| Component | Responsibility | Data Source |
|-----------|---------------|-------------|
| `CounterfactualForm` | Parameter inputs with sliders | `CounterfactualRequest` |
| `CounterfactualResult` | Baseline vs. counterfactual delta | `CounterfactualRunResponse` |
| `SensitivityTable` | 15-scenario variation table | `SensitivityReportResponse` |
| `CounterfactualDisclaimer` | Mandatory scientific disclaimer | Static text |

### 2.5 Map Components

| Component | Responsibility | Data Source |
|-----------|---------------|-------------|
| `FloodMap` | Leaflet container with layers | — |
| `PlaceMarker` | Location markers with popups | `PlaceResponse` |
| `DrainageLayer` | Drain segment polylines | `MapDrainsResponse` |
| `FloodObservationLayer` | Flood point markers | `MapFloodObservationsResponse` |
| `MapLegend` | Layer color/symbol legend | — |

### 2.6 UI Primitives

| Component | Responsibility |
|-----------|---------------|
| `Badge` | Certainty, severity, status badges |
| `ScoreBar` | Horizontal score indicator (0-1 or 0-100) |
| `LoadingSkeleton` | Skeleton placeholder for loading states |
| `ErrorState` | Error message with retry action |
| `EmptyState` | No-data message with icon |
| `Tooltip` | Hover tooltip wrapper |

---

## 3. Data Flow

### 3.1 Investigation Creation Flow

```
User selects Place A → User selects Place B → POST /locations/compare
    → POST /investigations/comparisons → POST /investigations
    → Poll GET /investigations/{id} until status === "completed"
    → GET /investigations/{id} (unified payload)
    → Render all investigation components
```

### 3.2 Evidence Provenance Flow

```
User clicks evidence item → GET /investigations/{id}/evidence/{eid}/provenance
    → Render ProvenanceChain in drawer
```

### 3.3 Counterfactual Flow

```
User adjusts parameters → POST /investigations/{id}/counterfactual
    → Render CounterfactualResult with delta
    → Optional: POST /investigations/{id}/counterfactual/sensitivity
    → Render SensitivityTable
```

### 3.4 Map Data Flow

```
Map viewport changes → GET /map/drains?lon&lat&radius_m
    → GET /map/flood-observations?lon&lat&radius_m
    → Render layers
```

---

## 4. State Management

### 4.1 Server State (React Query)

| Query Key | Endpoint | Stale Time |
|-----------|----------|------------|
| `["places"]` | `GET /locations/places` | 5 min |
| `["place", id]` | `GET /locations/places/{id}` | 5 min |
| `["comparables", id]` | `GET /locations/places/{id}/comparables` | 1 min |
| `["investigation", id]` | `GET /investigations/{id}` | 0 (polling) |
| `["evidence", id]` | `GET /investigations/{id}/evidence` | 1 min |
| `["provenance", id, eid]` | `GET /investigations/{id}/evidence/{eid}/provenance` | 5 min |
| `["map-drains", lon, lat]` | `GET /map/drains` | 1 min |
| `["map-observations", lon, lat]` | `GET /map/flood-observations` | 1 min |

### 4.2 Client State (React useState)

- Selected mechanism filter
- Map viewport center/zoom
- Counterfactual form values
- Sidebar open/closed state
- Active evidence drawer item

---

## 5. API Client Design

```typescript
// lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ 
      error: { code: "UNKNOWN", message: res.statusText } 
    }));
    throw new ApiError(error.error.code, error.error.message, res.status);
  }
  
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

---

## 6. Validation Strategy

### 6.1 Runtime Validation (Zod)

All API responses are validated at runtime using Zod schemas that mirror the backend Pydantic models. This catches:
- Missing fields
- Type mismatches
- Unexpected null values
- Enum value changes

### 6.2 Form Validation

Counterfactual form inputs are validated client-side before submission using existing `counterfactualSchema`.

---

## 7. Testing Strategy

### 7.1 Unit Tests

- Component rendering with mock data
- Formatter functions
- Zod schema validation

### 7.2 Integration Tests

- API client with mock fetch
- Hook behavior with React Query test utils

### 7.3 E2E Tests (Optional)

- Full investigation flow
- Map interaction
- Counterfactual submission

---

## 8. Performance Considerations

- **React Query** for caching and deduplication
- **Dynamic imports** for Leaflet (already implemented)
- **Debounced** map data fetching on viewport change
- **Skeleton screens** for loading states
- **Prefetch** provenance on evidence hover

---

## 9. Accessibility

- WCAG AA contrast minimum
- Visible focus states on all interactive elements
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- ARIA labels on icon-only buttons
- Keyboard navigation support for map markers
- Screen reader announcements for async operations
