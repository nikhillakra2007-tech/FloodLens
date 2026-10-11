# Limitations

## Explicit Limitations

1. **Not a flood forecasting system.** FloodLens investigates why locations differ; it does not predict future floods.
2. **Not a calibrated hydraulic model.** Counterfactual outputs are bounded proxy estimates, not water depth predictions.
3. **Demo data is synthetic.** The demo dataset does not represent real flood events.
4. **Inferred geometry is not surveyed truth.** Inferred drain connections are always flagged.
5. **No street-level rainfall from IMERG.** IMERG resolution is ~11km; station data required for precise rainfall.
6. **Mechanism ranking is not causal proof.** Available data supports mechanisms but does not prove causality.
7. **Blockage claims cannot be established.** No direct observation of drain blockages exists in available data.
8. **Limited historical validation.** Demo contains one event; real validation requires multiple historical events.
9. **Strands/Bedrock mode requires AWS credentials.** Local mode is deterministic fallback.
10. **No real-time data integration.** Ingestion is batch-based.

## What FloodLens Is NOT

- A generic flood dashboard
- A generic flood prediction system
- A weather app
- A chatbot
- A digital twin
- A replacement for Chennai's official flood forecasting system
- A claim that it can prove undocumented drain blockages

## Known Constraints

- Counterfactual model assumes linear runoff response
- Drainage capacity proxy does not account for sedimentation, tide gates, or pump operations
- Terrain features are point-based, not surface-based
- Similarity engine does not account for spatial autocorrelation
