export default function CounterfactualDisclaimer() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3" role="note" aria-label="Scientific disclaimer">
      <p className="text-xs font-semibold text-amber-800">SCIENTIFIC DISCLAIMER</p>
      <p className="mt-1 text-xs text-amber-700">
        Simplified counterfactual calculations use the rational screening method (Q = C × I × A).
        This is a comparative screening tool for relative policy exploration, NOT a calibrated
        2D hydraulic or hydrodynamic flood forecast.
      </p>
    </div>
  );
}
