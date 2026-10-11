# Scientific Method

## Investigation Workflow

```
Location A (floods)
    ↓
Find comparable Location B (does not flood)
    ↓
Differential Analysis (feature comparison)
    ↓
Mechanism Scoring (deterministic, weighted)
    ↓
Evidence Generation (classified by certainty)
    ↓
Mechanism Graph (causal chain visualization)
    ↓
Counterfactual Challenge (bounded proxy model)
    ↓
Historical Validation (pattern recurrence)
    ↓
Structured Investigation Report
```

## Evidence Classification

### FACT
Directly supported by a dataset or deterministic computation.

Example: "Built-up fraction within contributing area = 0.78."

### SUPPORTED
A mechanism supported by multiple independent evidence signals but not directly observed as a physical causal measurement.

Example: "High upstream built-up fraction is consistent with greater runoff concentration."

### HYPOTHESIS
A plausible mechanism for which evidence is incomplete.

Example: "An undocumented local blockage may contribute."

### UNKNOWN
The available data cannot establish the claim.

Example: "No direct blockage observation is available."

## Mechanism Evaluation

All mechanism scores are deterministic and explainable:

| Mechanism | Key Signals |
|-----------|-------------|
| RUNOFF_CONCENTRATION | upstream built-up fraction, contributing area, rainfall |
| DRAINAGE_CAPACITY | effective capacity, dimensions, upstream load |
| DRAINAGE_CONNECTIVITY | connected/disconnected, path length, inferred geometry |
| TERRAIN_DEPRESSION | HAND, relative elevation, local basin |
| OUTFALL_RESTRICTION | distance to outfall, downstream path |
| WATERBODY_INTERACTION | water fraction, waterbody proximity |
| IMPERVIOUS_SURFACE | built-up fraction, vegetation fraction |
| INSUFFICIENT_EVIDENCE | activated when evidence cannot distinguish mechanisms |

## Counterfactual Model

Simple transparent proxy:

```
runoff_proxy = rainfall_mm × contributing_area_km2 × runoff_coefficient
excess_flow = max(0, runoff_proxy - effective_capacity)
```

Always labeled: "Simplified counterfactual proxy — not a calibrated hydraulic prediction."

## Similarity Weights

Default weights for comparable location matching:

| Dimension | Weight |
|-----------|--------|
| Rainfall | 0.25 |
| Terrain | 0.20 |
| HAND/Elevation | 0.15 |
| Land cover | 0.15 |
| Drainage context | 0.15 |
| Waterbody proximity | 0.10 |

Weights are configurable via the comparison engine.
