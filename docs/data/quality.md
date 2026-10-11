# Data Quality

## Validation Rules

### Geometry
- Must not be null or empty
- Must be valid (no self-intersections)
- Coordinates must be within valid ranges (lon: -180 to 180, lat: -90 to 90)

### Physical Values
- depth >= 0
- width >= 0
- length >= 0
- rainfall >= 0
- fractions (builtup, vegetation, water, runoff_coefficient) must be 0 to 1

### Dimensions
- No impossible dimensions (e.g., drain wider than 100m)
- Area must be positive

### Timestamps
- end_time >= start_time (when both present)
- Timestamps must be parseable

### Enumerations
- Controlled vocabulary enforced via database CHECK constraints

### Provenance
- Every record must have a source
- Inferred geometry must be flagged

## Quarantine Policy

- Malformed records are NOT deleted silently
- Records failing validation are either quarantined (marked invalid) or ingestion fails with a clear report
- Duplicate files (SHA-256 match) are rejected
- Validation reports stored in source_files.validation_report
