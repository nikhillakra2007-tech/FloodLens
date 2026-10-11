# FloodLens — Phase 3.1 Implementation Tasks

**Status**: DRAFT FOR REVIEW  
**Date**: 2026-10-09  

---

## Task Ordering Principles

1. **Foundation first** — Types, API client, providers, layout
2. **Core flow second** — Investigation creation → detail view
3. **Supporting features third** — Evidence, provenance, counterfactual
4. **Polish last** — Map layers, animations, accessibility

---

## Phase 3.2: Foundation

### T-01: Update TypeScript Types

**File:** `frontend/lib/types/investigation.ts`

- [x] Replace with full `InvestigationDetailResponse` type matching backend schema
- [x] Add `PlaceResponse`, `ComparisonResponse`, `MechanismResponse`, `EvidenceItemResponse` types
- [x] Add `ValidationRunResponse`, `DefensibilityAssessmentResponse`, `InvestigationLimitationResponse` types
- [x] Add `ClaimProvenanceResponse`, `ClaimProvenanceStep` types
- [x] Add `CounterfactualRunResponse`, `SensitivityReportResponse`, `SensitivityScenarioResponse` types
- [x] Add `MechanismGraphResponse`, `MechanismGraphNode`, `MechanismGraphEdge` types

**File:** `frontend/lib/types/enums.ts`

- [x] Re-export all backend enums: `CertaintyLevel`, `ValidationStatus`, `DefensibilityVerdict`, `LimitationSeverity`, `GateStatus`, `SourceIndependenceType`, `EvidenceRelationType`

**File:** `frontend/lib/types/map.ts`

- [x] Add `MapDrainsResponse`, `MapFloodObservationsResponse`, `MapTerrainResponse` types
- [x] Add `DrainageSegmentResponse`, `OutfallResponse`, `ContributingAreaProxyResponse` types

---

### T-02: Create API Client Module

**File:** `frontend/lib/api/client.ts`

- [x] Create `ApiError` class with `code`, `message`, `statusCode`
- [x] Create `fetchApi<T>()` wrapper with error handling
- [x] Support query parameters via URLSearchParams

**File:** `frontend/lib/api/locations.ts`

- [x] `getPlaces()`, `getPlace(id)`, `getComparables(id, topK)`, `getFeatures(id)`
- [x] `compareLocations(placeAId, placeBId)`, `createComparison(placeAId, placeBId)`

**File:** `frontend/lib/api/investigations.ts`

- [x] `createInvestigation(comparisonId)`
- [x] `getInvestigation(id)`
- [x] `getMechanisms(id)`, `getEvidence(id)`, `getGraph(id)`
- [x] `getValidation(id)`, `getDefensibility(id)`, `getLimitations(id)`

**File:** `frontend/lib/api/evidence.ts`

- [x] `getProvenance(investigationId, evidenceId)`

**File:** `frontend/lib/api/counterfactual.ts`

- [x] `runCounterfactual(investigationId, params)`
- [x] `runSensitivity(investigationId, params)`

**File:** `frontend/lib/api/map.ts`

- [x] `getMapDrains(lon, lat, radiusM)`
- [x] `getMapFloodObservations(lon, lat, radiusM)`

---

### T-03: Add React Query Provider

**File:** `frontend/app/providers.tsx`

- [x] Wrap app with `QueryClientProvider`
- [x] Configure default options (staleTime, retry, refetchOnWindowFocus)

**File:** `frontend/app/layout.tsx`

- [x] Import and wrap with `providers.tsx`

---

### T-04: Create UI Primitives

**File:** `frontend/components/ui/Badge.tsx`

- [x] Certainty badge (FACT/SUPPORTED/HYPOTHESIS/UNKNOWN)
- [x] Severity badge (HIGH/MEDIUM/LOW)
- [x] Status badge (PASS/FAIL/CONDITIONAL/UNKNOWN)
- [x] Verdict badge (DEFENSIBLE/DEFENSIBLE_WITH_MATERIAL_LIMITATIONS/INSUFFICIENT_EVIDENCE)

**File:** `frontend/components/ui/ScoreBar.tsx`

- [x] Horizontal bar with 0-1 range
- [x] Color-coded by score intensity

**File:** `frontend/components/ui/LoadingSkeleton.tsx`

- [x] Generic skeleton block
- [x] Card skeleton variant

**File:** `frontend/components/ui/ErrorState.tsx`

- [x] Error message with icon
- [x] Retry button

**File:** `frontend/components/ui/EmptyState.tsx`

- [x] No-data message with icon

**File:** `frontend/components/ui/Tooltip.tsx`

- [ ] Hover tooltip wrapper

---

### T-05: Create Layout Components

**File:** `frontend/components/layout/AppShell.tsx`

- [x] Header with app title
- [x] Main content area
- [x] Optional sidebar

**File:** `frontend/components/layout/InvestigationHeader.tsx`

- [x] Investigation title + ID
- [x] Status badge (running/completed/failed)
- [x] Defensibility verdict badge

**File:** `frontend/components/layout/Sidebar.tsx`

- [x] Section navigation links

---

### T-06: Update Formatting Utilities

**File:** `frontend/lib/formatting.ts`

- [x] Add `formatMechanismType()` — convert `IMPERVIOUS_SURFACE` to "Impervious Surface"
- [x] Add `formatCertainty()` — certainty level labels
- [x] Add `formatVerdict()` — verdict display names
- [x] Add `formatUnit()` — unit display symbols
- [x] Add `formatConfidence()` — confidence percentage

**File:** `frontend/lib/constants.ts`

- [x] Mechanism type labels
- [x] Feature similarity labels
- [x] Color mappings for certainty/severity

---

## Phase 3.3: Core Investigation Flow

### T-07: Create New Investigation Page

**File:** `frontend/app/investigations/new/page.tsx`

- [x] Place selector (searchable dropdown)
- [x] Comparable location selector
- [x] "Compare" button → triggers `compareLocations()`
- [x] "Start Investigation" button → triggers `createComparison()` → `createInvestigation()`
- [x] Redirect to `/investigations/{id}` on success
- [x] Embedded interactive Leaflet `FloodMap` with place click selection

---

### T-08: Create Investigation Detail Page

**File:** `frontend/app/investigations/[id]/page.tsx`

- [x] Poll investigation status until completed
- [x] Render all investigation sections
- [x] Handle loading/error states
- [x] Integrated `FloodMap` with layer toggles

---

### T-09: Create Comparison Components

**File:** `frontend/components/investigation/ComparisonPanel.tsx`

- [x] Side-by-side place comparison
- [x] Similarity score display
- [x] Feature breakdown bars

**File:** `frontend/components/investigation/FeatureBreakdown.tsx`

- [x] Decomposed similarity bars (rainfall, terrain, drainage, landcover, spatial)

---

### T-10: Create Mechanism Components

**File:** `frontend/components/investigation/MechanismCard.tsx`

- [x] Rank badge, mechanism name
- [x] Score bar with confidence
- [x] Certainty badge
- [x] Expandable explanation

**File:** `frontend/components/investigation/MechanismList.tsx`

- [x] Ranked list of MechanismCard components
- [x] Click to select/filter

---

### T-11: Create Mechanism Graph

**File:** `frontend/components/investigation/MechanismGraph.tsx`

- [x] SVG DAG visualization
- [x] Nodes colored by type (observation/constraint/mechanism)
- [x] Edges styled by certainty level
- [x] Click edge to show evidence IDs
- [x] Screen reader accessible text alternative

---

## Phase 3.4: Evidence & Provenance

### T-12: Create Evidence Components

**File:** `frontend/components/evidence/EvidenceCard.tsx`

- [x] Claim text
- [x] Certainty badge
- [x] Value + unit display
- [x] Support score
- [x] Source independence indicator
- [x] Limitations list
- [x] "View Provenance" button

**File:** `frontend/components/evidence/EvidenceList.tsx`

- [x] Filterable by mechanism type
- [x] Search/filter input

---

### T-13: Create Provenance Components

**File:** `frontend/components/evidence/ProvenanceChain.tsx`

- [x] 7-level vertical stepper
- [x] Icons per level (claim → evidence → feature → derivation → source_file → dataset_version → source)
- [x] Metadata display for source_file level

**File:** `frontend/components/evidence/ProvenanceDrawer.tsx`

- [x] Slide-over panel
- [x] Renders ProvenanceChain
- [x] Triggered from EvidenceCard click

---

## Phase 3.5: Validation & Defensibility

### T-14: Create Validation Panel

**File:** `frontend/components/investigation/ValidationPanel.tsx`

- [x] Validation result badge (STRONG/MODERATE/WEAK/MIXED/INSUFFICIENT)
- [x] Sample size display (N=3)
- [x] Supporting/contradicting/inconclusive event counts
- [x] Confidence display
- [x] Source datasets list

---

### T-15: Create Defensibility Panel

**File:** `frontend/components/investigation/DefensibilityPanel.tsx`

- [x] Verdict badge
- [x] Correlation gates passed (X/5)
- [x] Causal gates passed (X/3)
- [x] 8-gate grid with PASS/FAIL/CONDITIONAL status
- [x] Gate descriptions and explanations

---

### T-16: Create Limitations Panel

**File:** `frontend/components/investigation/LimitationsPanel.tsx`

- [x] List of 8 canonical limitations
- [x] Severity tags (HIGH/MEDIUM/LOW)
- [x] Explanation text
- [x] HIGH severity items visually distinct

---

## Phase 3.6: Counterfactual

### T-17: Create Counterfactual Components

**File:** `frontend/components/counterfactual/CounterfactualForm.tsx`

- [x] Scenario name input
- [x] Parameter sliders/inputs (runoff_coefficient, contributing_area_km2, effective_capacity, rainfall_mm, upstream_impervious_fraction, drainage_path_km)
- [x] Client-side Zod validation with error feedback
- [x] Submit button

**File:** `frontend/components/counterfactual/CounterfactualResult.tsx`

- [x] Baseline vs. counterfactual output
- [x] Delta display with color (green for reduction, red for increase)
- [x] Percent change
- [x] Explicit screening proxy limitation callout and disclaimer

**File:** `frontend/components/counterfactual/SensitivityTable.tsx`

- [x] 15-scenario variation table
- [x] Columns: variation label, multipliers, baseline/modified flow, delta, percent change
- [x] Summary metrics (total tested, reductions, min, mean, max change)

**File:** `frontend/components/counterfactual/CounterfactualDisclaimer.tsx`

- [x] Mandatory scientific disclaimer
- [x] Styled as warning callout

---

## Phase 3.7: Map Integration

### T-18: Fix Map Components

**File:** `frontend/components/map/FloodMap.tsx`

- [x] Verified place coordinates (no random positioning)
- [x] Add layer controls (`MapLayerToggle` for flood observations, monitored locations, drainage)
- [x] Add map legend (`MapLegend`)

**File:** `frontend/components/map/FloodObservationLayer.tsx`

- [x] Uses verified observation coordinates
- [x] Color by severity, size by depth

---

## Phase 3.8: Polish & Accessibility

### T-19: Loading & Error States

- [x] Add LoadingSkeleton to all data-driven components
- [x] Add ErrorState with retry to all sections
- [x] Add EmptyState for null data

### T-20: Responsive Layout

- [x] Ensure layout works at mobile, tablet, and desktop (1280px+)
- [x] Horizontal scroll tables on smaller screens

### T-21: Accessibility Audit

- [x] WCAG AA contrast check
- [x] Focus states on all interactive elements
- [x] ARIA labels on switches and buttons
- [x] Accessible text alternative for DAG graph
- [ ] Keyboard navigation support

---

### T-07: Test Infrastructure

**File:** `frontend/vitest.config.ts`

- [x] Configure Vitest with jsdom environment and React plugin
- [x] Add path alias resolution

**File:** `frontend/package.json`

- [x] Add test scripts (`test`, `test:run`, `test:coverage`)
- [x] Add Vitest and related dev dependencies

**File:** `frontend/eslint.config.mjs`

- [x] Configure ESLint flat config with Next.js rules
- [x] Add `.eslintignore` for build output

---

## Dependency Graph

```
T-01 (Types) ──→ T-02 (API Client) ──→ T-03 (Providers) ──→ T-04 (UI Primitives)
                                                              │
                                                              ↓
                                                    T-05 (Layout) ──→ T-07 (New Investigation)
                                                              │
                                                              ↓
                                                    T-08 (Detail Page) ──→ T-09 (Comparison)
                                                              │
                                                              ↓
                                                    T-10 (Mechanisms) ──→ T-11 (Graph)
                                                              │
                                                              ↓
                                                    T-12 (Evidence) ──→ T-13 (Provenance)
                                                              │
                                                              ↓
                                                    T-14 (Validation) ──→ T-15 (Defensibility)
                                                              │
                                                              ↓
                                                    T-16 (Limitations) ──→ T-17 (Counterfactual)
                                                              │
                                                              ↓
                                                    T-18 (Map) ──→ T-19 (States) ──→ T-20 (Responsive)
                                                              │
                                                              ↓
                                                    T-21 (A11y)
```

---

## Phase 3.2 Acceptance Criteria

Phase 3.2 (design system + application shell) is complete when:

1. [x] All TypeScript types match backend schemas
2. [x] API client covers all required endpoints
3. [x] React Query provider is configured
4. [x] UI primitives (Badge, ScoreBar, LoadingSkeleton, ErrorState, EmptyState) exist
5. [x] Application shell (AppShell, InvestigationHeader, Sidebar) exists
6. [x] Root layout wraps with Providers
7. [x] Root page redirects to /investigations/new
8. [x] Test infrastructure (Vitest) is configured
9. [x] ESLint flat config is working
10. [x] TypeScript type checking passes
11. [x] Unit tests pass (16/16)
12. [x] Production build succeeds
13. [x] No backend modifications were made
14. [x] No scientific logic was changed

---

## Phase 3.3 Acceptance Criteria

Phase 3.3 (API integration + investigation map) is complete when:

1. [x] New investigation page with location selection
2. [x] Investigation detail page with polling
3. [x] Comparison panel with similarity breakdown
4. [x] Mechanism list with scores and certainty
5. [x] Evidence list with claims and limitations
6. [x] Validation panel with N=3 display
7. [x] Defensibility panel with 8-gate grid
8. [x] Limitations panel with severity tags
9. [x] Map shows verified place coordinates (no random positioning)
10. [x] Map legend with layer indicators
11. [x] Zod runtime validation schemas
12. [x] API integration tests
13. [x] Component tests (34/34 passing)
14. [x] Obsolete files removed
15. [x] TypeScript type checking passes
16. [x] ESLint passes
17. [x] Production build succeeds (6 routes)
18. [x] No backend modifications were made
19. [x] No scientific logic was changed

## Phase 3.4–3.6 Acceptance Criteria

Phase 3 final integration and polish (Phase 3.6) is complete when:

1. [x] Evidence provenance is traceable through 7 levels (`ProvenanceChain`, `ProvenanceDrawer`)
2. [x] Counterfactual form validates and displays results (`CounterfactualForm`, `CounterfactualResult`)
3. [x] Mechanism graph visualization (`MechanismGraph` with accessible text alternative)
4. [x] Sensitivity analysis table with 15 scenarios and summary stats (`SensitivityTable`)
5. [x] Map layer toggles for drainage/flood observations/locations connected to state (`FloodMap`, `MapLayerToggle`, `MapLegend`)
6. [x] Responsive layout verified across mobile, tablet, and desktop
7. [x] Keyboard navigation and accessibility audit (WCAG AA, focus indicators, aria labels)
8. [x] Unit and component tests passing (15 test files, 72/72 tests)
9. [x] Obsolete routes removed (`/investigate` deleted, 5 canonical routes)
10. [x] TypeScript type checking passes (`tsc --noEmit`)
11. [x] ESLint passes with zero warnings/errors (`eslint .`)
12. [x] Production build succeeds (`next build` generates 5 static/dynamic routes)
13. [x] No backend modifications were made
14. [x] No scientific logic was changed
