// Ward-aware baselines for the Bounded Counterfactual Simulation Lab.
//
// The simulation lab previously opened with the same generic constants on
// every investigation (C = 0.7, impervious fraction 0.6, ...), so a report
// for any ward pair ran its what-if scenarios on numbers that had nothing to
// do with the selected wards. This module derives the two land-cover-driven
// inputs from the inundated catchment's ward profile instead:
//
//   upstream_impervious_fraction = builtupFraction
//   runoff_coefficient           = 0.05 + 0.9 * builtupFraction
//
// The runoff rule is the standard rational-method rule of thumb
// C = 0.05 + 0.009 * i (i = percent impervious) used in urban drainage
// screening (e.g. ASCE/WEF design manuals). It is a DERIVED ESTIMATE, not a
// measurement: the note returned here states the source field, its per-ward
// data_status (calibrated demo dataset vs illustrative demo input), and the
// derivation rule so the UI can label it honestly. Rainfall, contributing
// area, conduit capacity and drainage path have no ward-level source in the
// repo, so they keep the form's editable defaults and are never described as
// ward-derived.

import { getWardProfile } from "@/lib/scoring/ward-profiles";
import mockData from "@/lib/mockData.json";

export interface CounterfactualBaseline {
  runoff_coefficient: number;
  upstream_impervious_fraction: number;
  /** Human-readable provenance note for the derived values. */
  note: string;
  /** Ward name the baseline was derived from. */
  wardName: string;
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function deriveCounterfactualBaseline(
  placeId: string | null | undefined
): CounterfactualBaseline | null {
  if (!placeId) return null;
  const profile = getWardProfile(placeId);
  if (!profile) return null;

  const place = mockData.places.find((p) => p.id === placeId);
  const wardName = place?.name ?? placeId;
  const statusNote =
    profile.dataStatus === "calibrated_demo_dataset"
      ? "calibrated demo dataset"
      : "illustrative demo input";

  const runoffCoefficient = round2(0.05 + 0.9 * profile.builtupFraction);
  const imperviousFraction = round2(profile.builtupFraction);

  return {
    runoff_coefficient: runoffCoefficient,
    upstream_impervious_fraction: imperviousFraction,
    wardName,
    note:
      `Baseline pre-filled from the ${wardName} ward profile: built-up fraction ` +
      `${profile.builtupFraction} (${statusNote}). Runoff coefficient uses the ` +
      `standard rational-method rule of thumb C = 0.05 + 0.9 x built-up fraction; ` +
      `a derived estimate, not a measurement. Rainfall, contributing area, conduit ` +
      `capacity and drainage path remain editable screening defaults.`,
  };
}
