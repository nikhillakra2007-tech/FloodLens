"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { runCounterfactual } from "@/lib/api/counterfactual";
import { counterfactualRequestSchema } from "@/lib/schemas/counterfactual";
import type { CounterfactualRequest, CounterfactualRun } from "@/lib/types/counterfactual";
import CounterfactualResult from "../results/CounterfactualResult";
import CounterfactualDisclaimer from "./CounterfactualDisclaimer";
import { ErrorState, LoadingSkeleton } from "@/components/ui";

export interface CounterfactualFormProps {
  investigationId: string;
}

const DEFAULT_VALUES: CounterfactualRequest = {
  scenario_name: "reduce_runoff_20pct",
  runoff_coefficient: 0.7,
  contributing_area_km2: 5.0,
  effective_capacity: 100.0,
  rainfall_mm: 100.0,
  upstream_impervious_fraction: 0.6,
  drainage_path_km: 2.0,
};

export default function CounterfactualForm({ investigationId }: CounterfactualFormProps) {
  const [params, setParams] = useState<CounterfactualRequest>(DEFAULT_VALUES);
  const [result, setResult] = useState<CounterfactualRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (p: CounterfactualRequest) => {
      setError(null);
      const res = await runCounterfactual(investigationId, p);
      setResult(res);
      return res;
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "Counterfactual failed");
    },
  });

  const validate = (): boolean => {
    const parseResult = counterfactualRequestSchema.safeParse(params);
    if (!parseResult.success) {
      const errMap: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const fieldName = issue.path[0] as string;
        errMap[fieldName] = issue.message;
      }
      setValidationErrors(errMap);
      setError("Please fix the validation errors before submitting.");
      return false;
    }
    setValidationErrors({});
    setError(null);
    return true;
  };

  const handleRunCounterfactual = () => {
    if (!validate()) return;
    mutation.mutate(params);
  };

  const updateParam = (key: keyof CounterfactualRequest, value: string) => {
    setValidationErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    if (key === "scenario_name") {
      setParams((prev) => ({ ...prev, scenario_name: value }));
      return;
    }

    const num = parseFloat(value);
    setParams((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }));
  };

  const isPending = mutation.isPending;

  return (
    <div className="space-y-4">
      <CounterfactualDisclaimer />

      <div className="space-y-3">
        <div>
          <label htmlFor="scenario-name" className="mb-1 block text-xs font-medium text-gray-600">
            Scenario Name
          </label>
          <input
            id="scenario-name"
            type="text"
            value={params.scenario_name}
            onChange={(e) => updateParam("scenario_name", e.target.value)}
            aria-invalid={!!validationErrors.scenario_name}
            className={`w-full rounded border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
              validationErrors.scenario_name
                ? "border-red-400 focus-visible:outline-red-500"
                : "border-border focus-visible:outline-flood-500"
            }`}
          />
          {validationErrors.scenario_name && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {validationErrors.scenario_name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="runoff-coeff" className="mb-1 block text-xs font-medium text-gray-600">
              Runoff Coefficient (C) [0.0 - 1.0]
            </label>
            <input
              id="runoff-coeff"
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={params.runoff_coefficient}
              onChange={(e) => updateParam("runoff_coefficient", e.target.value)}
              aria-invalid={!!validationErrors.runoff_coefficient}
              className={`w-full rounded border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                validationErrors.runoff_coefficient
                  ? "border-red-400 focus-visible:outline-red-500"
                  : "border-border focus-visible:outline-flood-500"
              }`}
            />
            {validationErrors.runoff_coefficient && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {validationErrors.runoff_coefficient}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contributing-area" className="mb-1 block text-xs font-medium text-gray-600">
              Contributing Area (km²) [&gt; 0]
            </label>
            <input
              id="contributing-area"
              type="number"
              step="0.5"
              min="0.1"
              value={params.contributing_area_km2}
              onChange={(e) => updateParam("contributing_area_km2", e.target.value)}
              aria-invalid={!!validationErrors.contributing_area_km2}
              className={`w-full rounded border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                validationErrors.contributing_area_km2
                  ? "border-red-400 focus-visible:outline-red-500"
                  : "border-border focus-visible:outline-flood-500"
              }`}
            />
            {validationErrors.contributing_area_km2 && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {validationErrors.contributing_area_km2}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="effective-capacity" className="mb-1 block text-xs font-medium text-gray-600">
              Effective Capacity (m³/s) [≥ 0]
            </label>
            <input
              id="effective-capacity"
              type="number"
              step="10"
              min="0"
              value={params.effective_capacity}
              onChange={(e) => updateParam("effective_capacity", e.target.value)}
              aria-invalid={!!validationErrors.effective_capacity}
              className={`w-full rounded border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                validationErrors.effective_capacity
                  ? "border-red-400 focus-visible:outline-red-500"
                  : "border-border focus-visible:outline-flood-500"
              }`}
            />
            {validationErrors.effective_capacity && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {validationErrors.effective_capacity}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="rainfall" className="mb-1 block text-xs font-medium text-gray-600">
              Rainfall (mm) [≥ 0]
            </label>
            <input
              id="rainfall"
              type="number"
              step="5"
              min="0"
              value={params.rainfall_mm}
              onChange={(e) => updateParam("rainfall_mm", e.target.value)}
              aria-invalid={!!validationErrors.rainfall_mm}
              className={`w-full rounded border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                validationErrors.rainfall_mm
                  ? "border-red-400 focus-visible:outline-red-500"
                  : "border-border focus-visible:outline-flood-500"
              }`}
            />
            {validationErrors.rainfall_mm && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {validationErrors.rainfall_mm}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="impervious-fraction" className="mb-1 block text-xs font-medium text-gray-600">
              Upstream Impervious Fraction [0.0 - 1.0]
            </label>
            <input
              id="impervious-fraction"
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={params.upstream_impervious_fraction}
              onChange={(e) => updateParam("upstream_impervious_fraction", e.target.value)}
              aria-invalid={!!validationErrors.upstream_impervious_fraction}
              className={`w-full rounded border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                validationErrors.upstream_impervious_fraction
                  ? "border-red-400 focus-visible:outline-red-500"
                  : "border-border focus-visible:outline-flood-500"
              }`}
            />
            {validationErrors.upstream_impervious_fraction && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {validationErrors.upstream_impervious_fraction}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="drainage-path" className="mb-1 block text-xs font-medium text-gray-600">
              Drainage Path (km) [≥ 0]
            </label>
            <input
              id="drainage-path"
              type="number"
              step="0.5"
              min="0"
              value={params.drainage_path_km}
              onChange={(e) => updateParam("drainage_path_km", e.target.value)}
              aria-invalid={!!validationErrors.drainage_path_km}
              className={`w-full rounded border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                validationErrors.drainage_path_km
                  ? "border-red-400 focus-visible:outline-red-500"
                  : "border-border focus-visible:outline-flood-500"
              }`}
            />
            {validationErrors.drainage_path_km && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {validationErrors.drainage_path_km}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleRunCounterfactual}
            disabled={mutation.isPending}
            className="w-full rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-6 py-3.5 text-sm font-bold text-white shadow-warm hover:shadow-lift transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Simulating Bounded Counterfactual Discharge...</span>
              </>
            ) : (
              <>
                <span>Run Counterfactual</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null);
            handleRunCounterfactual();
          }}
        />
      )}

      {mutation.isPending && (
        <div className="space-y-2">
          <p className="text-xs text-[#756350] font-medium">Evaluating rational peak runoff proxy balance...</p>
          <LoadingSkeleton variant="card" />
        </div>
      )}

      {result && <CounterfactualResult result={result} />}
    </div>
  );
}
