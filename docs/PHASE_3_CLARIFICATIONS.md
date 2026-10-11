# FloodLens — Phase 3.1 Clarifications & Resolved Assumptions

**Status**: DRAFT FOR REVIEW  
**Date**: 2026-10-09  

---

## 1. Resolved Assumptions

### 1.1 Frontend Stack

| Assumption | Resolution | Evidence |
|------------|------------|----------|
| Next.js is the framework | **Confirmed** | `package.json` shows `next: ^14.2.0` |
| TypeScript is enabled | **Confirmed** | `tsconfig.json` with `strict: true` |
| Tailwind CSS is the styling approach | **Confirmed** | `tailwind.config.js` + `globals.css` with `@tailwind` directives |
| Leaflet is the map library | **Confirmed** | `react-leaflet` + `leaflet` in dependencies |
| Recharts is available for charts | **Confirmed** | `recharts: ^2.12.0` in dependencies |
| TanStack React Query is available | **Confirmed** | `@tanstack/react-query: ^5.50.0` in dependencies |
| Zod is available for validation | **Confirmed** | `zod: ^3.23.0` in dependencies |
| No test framework is configured | **Confirmed** | No test runner in `package.json` |

### 1.2 Backend Contract

| Assumption | Resolution | Evidence |
|------------|------------|----------|
| API base URL is `/api/v1` | **Confirmed** | `router.py` with `APIRouter(prefix="/api/v1")` |
| All responses use Pydantic models | **Confirmed** | `backend/app/schemas/` contains strict Pydantic models |
| Error envelope is standardized | **Confirmed** | `API_CONTRACT.md` section 4 |
| Investigation detail is unified | **Confirmed** | `InvestigationDetailResponse` schema |
| Provenance chain is 7 levels | **Confirmed** | `ClaimProvenanceResponse` with `chain: list[ClaimProvenanceStep]` |
| Defensibility has 8 gates | **Confirmed** | `DefensibilityAssessmentResponse` with `total_gates: int` |
| Counterfactual disclaimer is mandatory | **Confirmed** | `CounterfactualRunResponse.disclaimer` field |

### 1.3 Data Scope

| Assumption | Resolution | Evidence |
|------------|------------|----------|
| Chennai-only dataset | **Confirmed** | 4 places (Wards 101, 102, 177, 178) |
| 3 historical flood events | **Confirmed** | 2015, 2021, 2023 |
| N=3 validation sample | **Confirmed** | `ValidationRunResponse.sample_size_n: int = 3` |
| No authentication required | **Confirmed** | `FRONTEND_HANDOFF.md` section F |

---

## 2. Clarifications Needed

### 2.1 Map Data Coordinates

**Issue:** `FloodMarkers.tsx` and `DrainageLayer.tsx` use random positioning instead of actual coordinates from the API.

**Current Code:**
```tsx
center={[center[0] + (Math.random() - 0.5) * 0.005, center[1] + (Math.random() - 0.5) * 0.005]}
```

**Question:** Do the map endpoints (`/map/drains`, `/map/flood-observations`) return actual coordinates, or do they return data that needs to be positioned relative to a center point?

**Backend Schema Review:**
- `MapDrainSegmentResponse` has no coordinate fields (only `id`, `drain_type`, `ward`, `street_name`, `is_inferred`, `length_m`)
- `MapFloodObservationItem` has no coordinate fields (only `id`, `event_id`, `severity`, `depth_cm`, `ward`)

**Resolution:** The map endpoints return metadata only, not geometry. The frontend must either:
1. Use the place coordinates from `GET /locations/places` as the center
2. Request geometry data from a different endpoint
3. Accept that precise spatial positioning is not available and use approximate placement

**Recommendation:** Use place coordinates as center points and display markers at those positions. For drainage segments, use the ward centroid. This is a known limitation to document.

---

### 2.2 Investigation Polling Strategy

**Issue:** `InvestigationCreateResponse` returns `status: "running"`. The frontend must poll until completion.

**Question:** What is the expected investigation completion time?

**Backend Review:** No explicit timeout or SLA documented.

**Resolution:** Poll every 2 seconds with a 30-second timeout. Show progress indicator. If timeout reached, show error with retry option.

---

### 2.3 Evidence Provenance Availability

**Issue:** Not all evidence items may have provenance chains.

**Question:** Should the frontend handle missing provenance gracefully?

**Backend Review:** `ClaimProvenanceResponse` is returned per evidence item. If provenance is unavailable, the endpoint may return 404 or an empty chain.

**Resolution:** Handle both cases:
- If 404: Show "Provenance unavailable for this evidence item"
- If empty chain: Show "No lineage data available"
- If chain exists: Render full 7-level stepper

---

### 2.4 Counterfactual Default Values

**Issue:** The counterfactual form needs default values.

**Question:** What are sensible defaults for Chennai?

**Backend Review:** `CounterfactualRequest` requires all fields. No defaults provided.

**Resolution:** Use Case 001 baseline values:
- `runoff_coefficient`: 0.7
- `contributing_area_km2`: 5.0
- `effective_capacity`: 100.0
- `rainfall_mm`: 100.0
- `upstream_impervious_fraction`: 0.6
- `drainage_path_km`: 2.0

These match the verified Case 001 output (baseline: 987.45 m³/s).

---

### 2.5 Sensitivity Sweep Trigger

**Issue:** The sensitivity endpoint runs 15 scenarios.

**Question:** Should this run automatically after a counterfactual, or only on demand?

**Resolution:** Run on demand via a "Run Sensitivity Analysis" button. This avoids unnecessary computation.

---

### 2.6 Map Layer Toggle Behavior

**Issue:** Multiple map layers (places, drainage, flood observations) can be toggled.

**Question:** What is the default layer state?

**Resolution:** Default to showing places only. Let users toggle drainage and flood observations on demand.

---

### 2.7 Investigation Retention

**Issue:** Investigations are persisted in the database.

**Question:** Should the frontend support viewing past investigations?

**Resolution:** Not in Phase 3 scope. Focus on creating and viewing a single investigation. Past investigation listing can be a future enhancement.

---

## 3. Design Decisions

### 3.1 Routing Strategy

**Decision:** Use Next.js App Router with dynamic segments.

| Route | Purpose |
|-------|---------|
| `/` | Redirect to `/investigations/new` |
| `/investigations/new` | Create new investigation |
| `/investigations/[id]` | View investigation detail |
| `/investigations/[id]/evidence/[evidenceId]` | View evidence provenance |

**Rationale:** Clean URLs, supports deep linking, follows Next.js conventions.

---

### 3.2 State Management

**Decision:** Use TanStack React Query for server state, React useState for client state.

**Rationale:** React Query is already installed. It provides caching, deduplication, and polling out of the box.

---

### 3.3 Component Granularity

**Decision:** One component per file, with test files only when appropriate.

**Rationale:** Follows the strict file-organization preference. Keeps components focused and testable.

---

### 3.4 Styling Approach

**Decision:** Tailwind CSS with custom `flood` color palette.

**Rationale:** Already configured. Provides utility-first styling with consistent design tokens.

---

### 3.5 API Client Structure

**Decision:** Modular API client with separate files per domain.

**Rationale:** `lib/api/` directory with `client.ts`, `locations.ts`, `investigations.ts`, `evidence.ts`, `counterfactual.ts`, `map.ts`. Each file exports typed functions.

---

## 4. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Investigation takes longer than expected | Medium | Low | Show progress indicator, handle timeout |
| Map geometry data incomplete | High | Medium | Use place coordinates as fallback |
| Evidence provenance missing for some items | Medium | Low | Handle gracefully with empty state |
| Counterfactual returns unexpected values | Low | Medium | Validate response, show error if invalid |
| Backend API changes | Low | High | Backend is frozen; types are locked |

---

## 5. Open Questions for Review

1. **Map Geometry:** Should we request additional geometry data from the backend, or is the current metadata-only approach acceptable for Phase 3?

2. **Investigation Listing:** Is there a need to view past investigations, or is single-investigation focus sufficient?

3. **Export/Download:** Should the frontend support exporting investigation results as PDF or JSON?

4. **Real-time Updates:** Is WebSocket/SSE support needed for investigation status, or is polling sufficient?

5. **Mobile Support:** Is there any expectation of mobile device support, or is this workstation-only?

---

## 6. Phase 3.2 Addendum — Map Coordinate Resolution

### 6.1 Verified Coordinate Availability

| Entity | Endpoint | Coordinates Available | Verified |
|--------|----------|----------------------|----------|
| Places | `GET /locations/places` | Yes — `longitude`, `latitude` fields in `PlaceResponse` | Confirmed via `backend/app/schemas/location.py` |
| Flood Observations (full) | `GET /flood-observations` | Yes — `longitude`, `latitude` fields in `FloodObservationResponse` | Confirmed via `backend/app/schemas/flood.py` |
| Flood Observations (map) | `GET /map/flood-observations` | No — `MapFloodObservationItem` strips coordinates | Confirmed via `backend/app/api/v1/map.py` |
| Drain Segments (map) | `GET /map/drains` | No — `MapDrainSegmentResponse` has no geometry | Confirmed via `backend/app/api/v1/map.py` |
| Drain Segments (full) | `GET /drainage/segments` | No — `DrainageSegmentResponse` has `geometry_provenance` string only | Confirmed via `backend/app/schemas/phase2.py` |
| Terrain | `GET /map/terrain` | No — returns `elevation_m: null, slope_degrees: null` | Confirmed via `backend/app/api/v1/map.py` |

### 6.2 Resolution

- **Place markers**: Use `Place.longitude` and `Place.latitude` directly — verified WGS84 coordinates
- **Flood observation markers**: Use `GET /flood-observations?event_id={id}` for coordinates; the map endpoint strips them
- **Drain segments**: No coordinates available in any endpoint. Display at ward/place level using place centroids. Document as precision limitation.
- **Terrain**: Returns null values. Display "Terrain data unavailable" fallback state.

### 6.3 Precision Limitations

- Place coordinates are point locations, not polygon centroids — representative but not exact ward boundaries
- Drain segments cannot be positioned precisely — ward-level approximation only
- No street-level geometry available for drain network visualization

---

## 7. Phase 3.2 Implementation Note

### 7.1 Git Repository Status

**Finding:** No Git repository exists in the project directory or any parent directory.

**Evidence:** `git status` returns `fatal: not a git repository` at `C:\Users\nikhi\OneDrive\Desktop\coding\AWSxENVIRONMENT`. Parent directory `C:\Users\nikhi\OneDrive\Desktop\coding` also has no `.git` directory.

**Resolution:** This is a repository-management issue. No version control is available for tracking changes. All Phase 3.2 changes are tracked only by file system state. This does not block implementation but means no commit history, no diff tracking, and no rollback capability.

**Recommendation:** Initialize a Git repository when convenient, but do not block Phase 3.2 work on this.

---

## 8. Sign-Off

Phase 3.1 specification APPROVED WITH REQUIRED CLARIFICATIONS.  
Phase 3.2 implementation IN PROGRESS.  
Map coordinates resolved. Git state verified. Design system and application shell implemented.

**Date:** 2026-10-09
