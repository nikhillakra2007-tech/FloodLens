# FloodLens Phase 2.6 — Evidence & Provenance Specification

## 1. Overview & Objective

This document establishes the formal evidence, certainty, and provenance specifications for FloodLens as finalized in Phase 2.6.

Every scientific claim in FloodLens is traceable through a deterministic 7-level provenance chain:

```text
CLAIM
  ↓
EVIDENCE
  ↓
FEATURE
  ↓
DERIVATION
  ↓
SOURCE FILE
  ↓
DATASET VERSION
  ↓
SOURCE / PROVIDER
```

The system strictly prohibits silent claim generation without lineage, unjustified certainty upgrades, and conflation of statistical correlation with hydraulic causation.

---

## 2. Evidence Model

Evidence items represent atomic empirical or derived findings tied to an investigation and a candidate physical mechanism.

### 2.1 Database Schema (`evidence_items`)

- `id`: UUID (Primary Key)
- `investigation_id`: UUID (`FOREIGN KEY -> investigations.id ON DELETE RESTRICT`)
- `mechanism_type`: Enum string (`IMPERVIOUS_SURFACE`, `TERRAIN_DEPRESSION`, `DRAINAGE_CAPACITY`, `DRAINAGE_CONNECTIVITY`, `RUNOFF_CONCENTRATION`, `OUTFALL_RESTRICTION`, `WATERBODY_INTERACTION`, `INSUFFICIENT_EVIDENCE`)
- `certainty_level`: Enum string (`FACT`, `SUPPORTED`, `HYPOTHESIS`, `UNKNOWN`)
- `claim`: Natural language summary statement of empirical observation or derived finding
- `value`: Numeric metric value (e.g., `0.82`, `-2.4`, `1200.0`)
- `unit`: Standardized physical unit (`fraction`, `m`, `cm`, `mm`, `m3/s`, `km2`, `m/hr`, etc.)
- `source`: Algorithmic engine or field sensor provider
- `support_score`: Bounded support metric `[0.0, 1.0]`
- `explanation`: Detailed scientific rationale
- `metadata`: JSONB dictionary containing contextual signals

### 2.2 API Contract Representation (`EvidenceItemResponse`)

```json
{
  "id": "e45889fa-bb12-4217-91a5-81643c1eb3df",
  "evidence_id": "e45889fa-bb12-4217-91a5-81643c1eb3df",
  "investigation_id": "90ba95e1-fb85-4ae2-bc9d-c5aeec23ec5f",
  "mechanism_type": "IMPERVIOUS_SURFACE",
  "certainty_level": "SUPPORTED",
  "claim": "Built-up land cover fraction is 0.82 in Ward 101 vs 0.69 in Ward 102",
  "value": 0.13,
  "unit": "fraction",
  "source": "deterministic_engine",
  "support_score": 0.35,
  "source_independence": "DEPENDENT_DERIVATION",
  "limitations": [
    "Static 2023 land cover proxy does not represent parcel-level measured imperviousness",
    "Infiltration rate heterogeneity not directly measured"
  ],
  "created_at": "2026-10-09T03:30:00Z"
}
```

---

## 3. Epistemic Certainty Model

FloodLens adopts a 4-tier epistemic certainty model to prevent over-claiming:

| Certainty Level | Criteria & Applicability | Disallowed Transitions |
| :--- | :--- | :--- |
| `FACT` | Direct sensor reading, field survey observation, or mathematical invariant (e.g. cumulative station rainfall, observed flood waterline). | `UNKNOWN -> FACT` without verified observation; `HYPOTHESIS -> FACT`. |
| `SUPPORTED` | Deterministic comparative proxy with corroborating geospatial signals (e.g. relative DEM HAND deficit, built-up fraction disparity). | Unverified proxy elevated to ground truth. |
| `HYPOTHESIS` | Plausible physical mechanism with incomplete observation coverage (e.g. unobserved downstream outfall backwater restriction). | Converted to `FACT` or `SUPPORTED` without direct stage data. |
| `UNKNOWN` | Unobserved condition (e.g. sub-surface conduit blockage, internal pipe siltation, localized cloudburst burst < 500m). | Must NEVER be upgraded to `SUPPORTED` or `FACT`. |

### Hard Invariant Rules:
1. **Missing blockage evidence remains `UNKNOWN`**: Sub-surface conduit sedimentation and siltation are unobserved.
2. **Inferred geometry remains `INFERRED`**: Inferred drains are explicitly flagged; never counted as surveyed assets.
3. **Contributing-area proxy is not a measured catchment**: Exposes `is_true_catchment: false`.
4. **Built-up fraction is an imperviousness proxy**: Exposes proxy limitation; bounded confidence to 0.40.
5. **HAND is not flood depth**: HAND measures elevation relative to nearest drainage channel, not observed water depth.
6. **Correlation is not causation**: Statistical association or historical recurrence cannot prove sole cause.

---

## 4. Deterministic Provenance Chain

Every claim exposed by `GET /api/v1/investigations/{id}/provenance` or `GET /api/v1/investigations/{id}/evidence/{evidence_id}/provenance` resolves to a strict 7-level structure:

```text
1. claim            -> claim identifier and natural language text
2. evidence         -> EvidenceItem ID, support score, physical unit
3. feature          -> Extracted physical feature name and unit
4. derivation       -> Deterministic derivation algorithm and version
5. source_file      -> Logical dataset key (e.g. data/raw/esa_worldcover_10m.csv)
6. dataset_version  -> Semantic version tag and temporal epoch
7. source           -> Trusted data provider and authority tier
```

### Loud Failure Behavior on Broken Lineage:
If an evidence item has an unmapped or corrupted mechanism type, the backend **fails loudly** with HTTP 422:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot resolve provenance for unmapped mechanism claim 'CORRUPT_TYPE': broken scientific lineage",
    "details": {}
  }
}
```
If a claim genuinely has epistemic status `UNKNOWN` (such as unobserved blockage), the provenance chain explicitly marks all child levels as `UNKNOWN` rather than fabricating synthetic lineage.

---

## 5. Source Independence & Double-Counting Protections

To prevent multi-colinear features from artificially boosting mechanism scores or certainty, evidence items are classified into three source independence tiers:

1. `INDEPENDENT_SOURCE`:
   Derived from an independent sensor, agency, or physical survey (e.g., Copernicus DEM GLO-30 vs GCC SWD network survey).
2. `DEPENDENT_DERIVATION`:
   Derived through composite spatial analysis from one or more primary datasets (e.g., topographic contributing area proxy combining DEM and SWD vectors).
3. `SAME_SOURCE_SIGNAL`:
   Derived from the exact same underlying raster or table grid.

### Critical Implementation Safeguard:
- ESA WorldCover 10m provides both `builtup_fraction` and `vegetation_fraction`. Because vegetation fraction is the mathematical complement of built-up area in urban pixels, the mechanism engine treats vegetation as co-linear corroboration (`SAME_SOURCE_SIGNAL`) and strictly limits the score contribution to a single proxy signal (maximum score 0.35, confidence 0.40).

---

## 6. Mechanism $\to$ Evidence Graph

The investigation graph (`GET /api/v1/investigations/{id}/graph`) models causal processes without implying unearned causality:

### Edge Epistemic Classification (`relation_type`):
- `PROXY_INPUT`: Meteorological or boundary input (e.g. `rainfall -> catchment`).
- `ASSOCIATION`: Spatial or physical association (e.g. `catchment -> runoff`, `drain_network -> bottleneck`).
- `CORRELATION`: Empirical co-occurrence (e.g. `terrain_storage -> flood_observation`, `bottleneck -> flood_observation`).
- `CAUSAL_HYPOTHESIS`: Uncalibrated hydraulic conjecture (e.g. `bottleneck -> outfall`).

Every edge links directly to the supporting `evidence_ids` that justify it.

---

## 7. Counterfactual Provenance

Counterfactual runs (`POST /api/v1/investigations/{id}/counterfactual`) expose:
- `investigation_id`: UUID of parent investigation
- `mechanism_tested`: Physical mechanism evaluated (`RUNOFF_GENERATION_SURCHARGE`)
- `input_features`: Ordered list of sensitivity input variables
- `baseline_values`: Input parameters before intervention
- `transformed_values`: Intervened parameter values
- `transformation_rule`: Linear rational peak runoff proxy balance ($Q = C \times I \times A - \text{capacity}$)
- `output_metric`: `peak_discharge_proxy_m3_s`
- `baseline_feature_provenance`: Primary data sources utilized
- `is_calibrated_hydraulic_prediction`: Strictly `false`
- `limitation`: `"Simplified counterfactual proxy — not a calibrated hydraulic prediction."`
- `disclaimer`: Explicit notice that the output is a comparative proxy, not a 2D hydrodynamic simulation (SWMM/HEC-RAS).

---

## 8. Historical Validation Provenance

Historical multi-event validation (`GET /api/v1/investigations/{id}/validation`) exposes:
- `validation_run_id`: UUID
- `sample_size_n`: Fixed empirical count (`3`)
- `event_ids`: UUIDs of the 3 historical flood events (2015, 2021, 2023)
- `source_datasets`: List of recording agencies (`IMD/GPM rainfall`, `TNWRD water level records`, `Copernicus EMS extent`)
- `validation_method`: `multi_event_consistency_triangulation`
- `validation_status`: `STRONG_SUPPORT`, `MODERATE_SUPPORT`, `WEAK_SUPPORT`, or `MIXED`
- `limitations`: Explictly retains that $N=3$ multi-event historical records do not justify singular certainty.

---

## 9. Defensibility Gate Provenance

The defensibility evaluator tests 8 deterministic gates grouped into two tiers:

### Correlation Gates (Gates 1–5):
1. `direct_flood_observation` (`CORRELATION`)
2. `terrain_evidence` (`CORRELATION`)
3. `drainage_evidence` (`CORRELATION`)
4. `rainfall_comparability` (`CORRELATION`)
5. `multi_event_recurrence` (`CORRELATION`)

### Causal Specificity Gates (Gates 6–8):
6. `independent_mechanism_evidence` (`CAUSAL`): Requires independent non-proxy observations; fails for land-cover proxy alone.
7. `temporal_alignment` (`CAUSAL`): Audits temporal gaps between event year and infrastructure surveys.
8. `causal_mechanism_specificity` (`CAUSAL`): Audits whether competing physical drivers co-occur (e.g. -2.4m HAND depression alongside +0.13 built-up fraction). If confounders co-occur, Gate 8 fails.

### Reproducible Verdict Determination:
- Correlation gates passed $\ge 4$ AND causal gates passed $= 3 \implies$ `DEFENSIBLE`
- Correlation gates passed $\ge 4$ AND causal gates passed $< 3 \implies$ `DEFENSIBLE_WITH_MATERIAL_LIMITATIONS`
- Correlation gates passed $\ge 2 \implies$ `INSUFFICIENT_EVIDENCE`
- Otherwise $\implies$ `NOT_DEFENSIBLE`

The final verdict is derived directly from individual gate outcomes; there is no hard-coded verdict.

---

## 10. Database Integrity & Deletion Protections

To preserve auditability and prevent silent orphaning of scientific lineage:
- `evidence_items.investigation_id`: `ON DELETE RESTRICT`
- `source_files.source_id`: `ON DELETE RESTRICT`
- `dataset_versions.source_id`: `ON DELETE RESTRICT`
- `drain_segments.start_node_id`, `end_node_id`: `ON DELETE RESTRICT`
- `rainfall_event_features.event_id`: `ON DELETE RESTRICT`
- `flood_observations.event_id`: `ON DELETE RESTRICT`

Deleting a data source, flood event, or investigation that has active scientific dependencies will raise an `IntegrityError` in PostgreSQL.

---

## 11. Agent Safety Boundaries

The Bedrock/Strands agent is bound by strict guardrails:
1. **Tool Access Only**: Agent can only query data through approved read-only tools in `app.agent.tools`. Arbitrary SQL execution is impossible.
2. **Read-Only Operation**: Agent tools contain no `db.commit()` or table mutation logic.
3. **Forbidden Claims Filter**: Guardrails reject outputs containing:
   - `"drain was blocked"`, `"drain is blocked"`, `"blocked drain"`
   - `"proved causation"`, `"proves causation"`, `"definitely caused"`, `"is the cause"`
   - `"predicts exact flood depth"`, `"predicted flood depth"`
   - `"calibrated hydraulic simulation"`, `"hydraulic simulation proved"`
4. **Epistemic Upgrade Prohibition**: Agent output validation rejects any attempt to classify `UNKNOWN` as `FACT` or `SUPPORTED`, or `HYPOTHESIS` as `FACT`.
