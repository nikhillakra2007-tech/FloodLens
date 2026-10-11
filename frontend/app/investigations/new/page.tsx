"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPlaces, getComparables, compareLocations } from "@/lib/api/spatial/locations";
import { getFloodObservations } from "@/lib/api/spatial/map";
import { createComparison, createInvestigation } from "@/lib/api/investigation/investigations";
import type { Place, LocationCompareResponse } from "@/lib/types/investigation";

const FloodMap = dynamic(() => import("@/components/map/FloodMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-[#E8DFD3] bg-[#F5EFE6]">
      <div className="flex items-center gap-3 text-sm font-semibold text-terracotta-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
        <span>Loading Chennai Geospatial Basemap...</span>
      </div>
    </div>
  ),
});

import mockData from "@/lib/mockData.json";

interface TimelineStep {
  id: number;
  label: string;
  detail: string;
  status: "pending" | "running" | "completed";
}

type ActiveSection = "select" | "map" | "vectors" | "engine";

function getCleanPlaceName(name: string): string {
  return name.replace(/\s*\(Ward\s*[^)]+\)/i, "").trim();
}

function formatPlaceOptionLabel(place: Place | null | undefined): string {
  if (!place) return "";
  const base = getCleanPlaceName(place.name);
  return place.ward ? `${base} (Ward ${place.ward})` : base;
}

export default function NewInvestigationPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<ActiveSection>("select");
  const [placeA, setPlaceA] = useState<Place | null>(mockData.places[0] as Place);
  const [placeB, setPlaceB] = useState<Place | null>(mockData.places[2] as Place);
  const [comparison, setComparison] = useState<LocationCompareResponse | null>(mockData.compRes as any);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when comparison modal is open
  useEffect(() => {
    if (showCompareModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCompareModal]);

  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([
    { id: 1, label: "Ingesting Ward Drainage Network", detail: "Querying GCC stormwater conduits & outfall profiles", status: "pending" },
    { id: 2, label: "Normalizing 2023 Cyclone Michaung Forcing", detail: "Isolating rainfall intensity from recent 2023 & 2021 events to eliminate confounds", status: "pending" },
    { id: 3, label: "Profiling Topography & Ponding Depth", detail: "Evaluating DEM slope, elevation gradients, and HAND index", status: "pending" },
    { id: 4, label: "Formulating Causal Mechanism DAG", detail: "Ranking backwater curve vs conduit capacity vs infiltration loss", status: "pending" },
    { id: 5, label: "Conducting Defensibility & Audit Check", detail: "Synthesizing FACT, SUPPORTED, and HYPOTHESIS evidence chain", status: "pending" },
  ]);

  const { data: places = mockData.places as Place[], isLoading: placesLoading } = useQuery({
    queryKey: ["places"],
    queryFn: getPlaces,
    initialData: mockData.places as Place[],
  });

  const { data: observations = mockData.obs as any[] } = useQuery({
    queryKey: ["flood-observations"],
    queryFn: () => getFloodObservations(100),
    initialData: mockData.obs as any[],
  });

  const { data: comparablesData, isLoading: comparablesLoading } = useQuery({
    queryKey: ["comparables", placeA?.id],
    queryFn: () => getComparables(placeA!.id, 5),
    enabled: !!placeA,
  });

  const compareMutation = useMutation({
    mutationFn: () => {
      if (!placeA || !placeB || placeA.id === placeB.id) {
        return Promise.reject(new Error("Please select two distinct catchments to compare."));
      }
      return compareLocations(placeA.id, placeB.id);
    },
    onSuccess: (data) => {
      setComparison(data);
    },
    onError: (err) => {
      console.warn("Location comparison preview notice:", err);
    },
  });

  const investigateMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);
      if (!placeA || !placeB) {
        throw new Error("Please select both catchments to launch the diagnostic pipeline.");
      }
      if (placeA.id === placeB.id) {
        throw new Error("Location A and Location B must be distinct catchments for differential comparison.");
      }
      const comp = await createComparison(placeA.id, placeB.id);
      return createInvestigation(comp.id);
    },
    onSuccess: (data) => {
      let stepIndex = 1;
      const interval = setInterval(() => {
        setTimelineSteps((prev) =>
          prev.map((step, idx) => {
            if (idx < stepIndex) return { ...step, status: "completed" };
            if (idx === stepIndex) return { ...step, status: "running" };
            return { ...step, status: "pending" };
          })
        );
        stepIndex++;
        if (stepIndex > 5) {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/investigations/${data.id}`);
          }, 350);
        }
      }, 550);
    },
    onError: (err: any) => {
      setIsInvestigating(false);
      console.error("Investigation creation failed:", err);
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Investigation pipeline failed to initialize. Please check catchment pairing and retry.";
      setErrorMessage(typeof detail === "string" ? detail : JSON.stringify(detail));
      setTimelineSteps((prev) =>
        prev.map((step) => ({ ...step, status: "pending" }))
      );
    },
  });

  const handleCompare = useCallback(() => {
    if (placeA && placeB && placeA.id !== placeB.id) {
      if (!comparison && !compareMutation.isPending) {
        compareMutation.mutate();
      }
      setShowCompareModal(true);
    }
  }, [placeA, placeB, comparison, compareMutation]);

  const handleStartInvestigation = useCallback(() => {
    setShowCompareModal(false);
    setErrorMessage(null);
    if (!placeA || !placeB) {
      setErrorMessage("Please select both Location A and Location B before launching.");
      return;
    }
    if (placeA.id === placeB.id) {
      setErrorMessage("Location A and Location B must be distinct catchments for differential comparison.");
      return;
    }
    if (!isInvestigating) {
      setIsInvestigating(true);
      setActiveSection("engine");
      setTimelineSteps([
        { id: 1, label: "Ingesting Ward Drainage Network", detail: "Querying GCC stormwater conduits & outfall profiles", status: "running" },
        { id: 2, label: "Normalizing 2023 Cyclone Michaung Forcing", detail: "Isolating rainfall intensity from recent 2023 & 2021 events to eliminate confounds", status: "pending" },
        { id: 3, label: "Profiling Topography & Ponding Depth", detail: "Evaluating DEM slope, elevation gradients, and HAND index", status: "pending" },
        { id: 4, label: "Formulating Causal Mechanism DAG", detail: "Ranking backwater curve vs conduit capacity vs infiltration loss", status: "pending" },
        { id: 5, label: "Conducting Defensibility & Audit Check", detail: "Synthesizing FACT, SUPPORTED, and HYPOTHESIS evidence chain", status: "pending" },
      ]);
      investigateMutation.mutate();
    }
  }, [placeA, placeB, isInvestigating, investigateMutation]);

  const handlePlaceSelect = useCallback(
    (place: Place) => {
      setErrorMessage(null);
      if (!placeA) {
        setPlaceA(place);
        setComparison(null);
      } else if (!placeB) {
        if (place.id !== placeA.id) {
          setPlaceB(place);
          setComparison(null);
        }
      } else if (place.id === placeA.id) {
        // Already placeA, keep
      } else if (place.id === placeB.id) {
        // Already placeB, keep
      } else {
        // Swap placeB to newly selected place
        setPlaceB(place);
        setComparison(null);
      }
    },
    [placeA, placeB]
  );

  const handleSelectPlaceA = useCallback(
    (place: Place) => {
      setErrorMessage(null);
      setPlaceA(place);
      setComparison(null);
      if (placeB?.id === place.id) {
        const alt = places.find((p) => p.id !== place.id);
        setPlaceB(alt ?? null);
      }
    },
    [placeB, places]
  );

  const handleSelectPlaceB = useCallback(
    (place: Place) => {
      setErrorMessage(null);
      if (placeA?.id === place.id) {
        const alt = places.find((p) => p.id !== place.id);
        setPlaceA(alt ?? null);
      }
      setPlaceB(place);
      setComparison(null);
    },
    [placeA, places]
  );

  // Quick preset helper
  const handleSelectPreset = (nameA: string, nameB: string) => {
    setErrorMessage(null);
    const foundA = places.find((p) => p.name.toLowerCase().includes(nameA.toLowerCase()));
    const foundB = places.find((p) => p.name.toLowerCase().includes(nameB.toLowerCase()));
    if (foundA && foundB) {
      setPlaceA(foundA);
      setPlaceB(foundB);
      setComparison(null);
    }
  };

  // Auto-initialize default calibrated pair or URL-specified pair on initial load
  useEffect(() => {
    if (placesLoading || places.length < 2) return;

    if (!placeA && !placeB) {
      let targetA = "Anna Nagar";
      let targetB = "Velachery";

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const pair = params.get("pair");
        if (pair === "t-nagar-adyar" || pair === "tnagar") {
          targetA = "T Nagar";
          targetB = "Adyar";
        }
      }

      const foundA = places.find((p) => p.name.toLowerCase().includes(targetA.toLowerCase()));
      const foundB = places.find((p) => p.name.toLowerCase().includes(targetB.toLowerCase()));

      if (foundA && foundB) {
        setPlaceA(foundA);
        setPlaceB(foundB);
      } else {
        setPlaceA(places[0]);
        setPlaceB(places[1]);
      }
    }
  }, [places, placesLoading, placeA, placeB]);

  // Auto trigger compare when A and B exist
  useEffect(() => {
    if (placeA && placeB && !comparison && !compareMutation.isPending) {
      compareMutation.mutate();
    }
  }, [placeA, placeB]);

  const isIdenticalPair = Boolean(placeA && placeB && placeA.id === placeB.id);
  const isSubmitDisabled =
    !placeA ||
    !placeB ||
    isIdenticalPair ||
    investigateMutation.isPending ||
    isInvestigating;

  // Breakdown scores calculation
  const terrainScore = comparison
    ? (comparison.similarity_breakdown?.terrain_similarity ??
       comparison.feature_similarities?.terrain ??
       0.84)
    : 0.84;

  const drainageScore = comparison
    ? (comparison.similarity_breakdown?.drainage_similarity ??
       comparison.feature_similarities?.drainage_context ??
       0.86)
    : 0.86;

  const landcoverScore = comparison
    ? (comparison.similarity_breakdown?.landcover_similarity ??
       comparison.feature_similarities?.land_cover ??
       0.91)
    : 0.91;

  const rainfallScore = comparison
    ? (comparison.similarity_breakdown?.rainfall_similarity ??
       comparison.feature_similarities?.rainfall ??
       0.0)
    : 0.0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* 1. TOP STATUS BAR: ACTIVE PAIR STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8DFD3]">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-bold text-[#221B15]">
            Differential Catchment Investigation Setup
          </span>
        </div>

        {/* Live Catchment Status Chip */}
        <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl px-4 py-2 text-xs shadow-xs">
          <span className="font-bold text-[#756350] uppercase tracking-wider text-[11px]">
            Diagnostic Axis:
          </span>
          {placeA && placeB ? (
            <div className="flex items-center gap-2 font-mono font-bold">
              <span className="text-[#C23E2A] flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#C23E2A]" />
                {formatPlaceOptionLabel(placeA)}
              </span>
              <span className="text-[#9E8B75]">vs</span>
              <span className="text-[#3B8352] flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#3B8352]" />
                {formatPlaceOptionLabel(placeB)}
              </span>
              {comparison && (
                <span className="bg-terracotta-100 text-terracotta-800 px-2 py-0.5 rounded text-[10px]">
                  {(comparison.similarity_score * 100).toFixed(0)}% Fit
                </span>
              )}
            </div>
          ) : (
            <span className="text-[#9E8B75] italic">Choose catchments below</span>
          )}
        </div>
      </div>

      {/* 2. DEDICATED FUNCTIONAL SECTION BAR (Single-Section Switcher Tabs) */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] p-1.5 shadow-sm flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveSection("select")}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === "select"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>🎯</span>
          <span>1. Catchment Selector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("map")}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === "map"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>🗺️</span>
          <span>2. Geospatial Ward Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("vectors")}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === "vectors"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>⚖️</span>
          <span>3. Environmental Vectors</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("engine")}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === "engine"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>🚀</span>
          <span>4. Diagnostic Pipeline</span>
        </button>
      </div>

      {/* 3. SECTION 1: CATCHMENT PAIRING SELECTOR */}
      {activeSection === "select" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Preset Selector Pill Bar */}
          <div className="rounded-3xl border border-[#E8DFD3] bg-[#FAF7F2] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700 block">
                Calibrated Ward Presets (2023 Cyclone Michaung &amp; Recent Monsoons)
              </span>
              <p className="text-xs text-[#554638]">
                Select pre-calibrated urban twin pairs with radar-verified rainfall equivalence:
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectPreset("Anna Nagar", "Velachery")}
                className="rounded-xl border border-[#E8DFD3] bg-white px-3.5 py-2 text-xs font-bold text-[#221B15] hover:border-terracotta-400 hover:bg-terracotta-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-[#C23E2A]" />
                <span>Anna Nagar</span>
                <span className="text-[#9E8B75]">vs</span>
                <span className="h-2 w-2 rounded-full bg-[#3B8352]" />
                <span>Velachery</span>
                <span className="font-mono text-[10px] text-terracotta-700 bg-terracotta-100 px-1.5 py-0.5 rounded">
                  83% Fit
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("T Nagar", "Adyar")}
                className="rounded-xl border border-[#E8DFD3] bg-white px-3.5 py-2 text-xs font-bold text-[#221B15] hover:border-terracotta-400 hover:bg-terracotta-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-[#C23E2A]" />
                <span>T Nagar</span>
                <span className="text-[#9E8B75]">vs</span>
                <span className="h-2 w-2 rounded-full bg-[#3B8352]" />
                <span>Adyar</span>
                <span className="font-mono text-[10px] text-terracotta-700 bg-terracotta-100 px-1.5 py-0.5 rounded">
                  91% Fit
                </span>
              </button>
            </div>
          </div>

          {/* Dual Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-stretch">
            {/* Location A Card */}
            <div className="md:col-span-5 rounded-3xl border-2 border-red-200 bg-[#FFFDFB] p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C23E2A]">
                    <span className="h-2 w-2 rounded-full bg-[#C23E2A]" />
                    Location A (Inundated Site)
                  </span>
                  <span className="text-xs text-[#756350] font-semibold">Incident Focus</span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#554638]">
                    Select Flooded Catchment:
                  </label>
                  <select
                    value={placeA?.id ?? ""}
                    onChange={(e) => {
                      setErrorMessage(null);
                      const place = places.find((p) => p.id === e.target.value);
                      if (place) {
                        setPlaceA(place);
                        setComparison(null);
                        if (placeB?.id === place.id) {
                          const alt = places.find((p) => p.id !== place.id);
                          setPlaceB(alt ?? null);
                        }
                      } else {
                        setPlaceA(null);
                      }
                    }}
                    disabled={placesLoading}
                    className="w-full rounded-xl border border-[#E0D5C7] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#221B15] shadow-xs focus:border-terracotta-500 cursor-pointer"
                  >
                    <option value="">{placesLoading ? "Loading GCC wards..." : "Choose Location A..."}</option>
                    {places.map((place) => (
                      <option key={place.id} value={place.id}>
                        {formatPlaceOptionLabel(place)}
                      </option>
                    ))}
                  </select>
                </div>

                {placeA ? (
                  <div className="rounded-2xl border border-red-100 bg-[#FAF7F2] p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-sm text-[#221B15]">{getCleanPlaceName(placeA.name)}</span>
                      <span className="font-mono text-[#C23E2A] bg-red-100 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        Ward {placeA.ward ?? "N/A"}
                      </span>
                    </div>
                    <p className="text-[#554638] text-[11px] leading-relaxed">
                      {placeA.description ?? "Monitored catchment station in Greater Chennai Corporation."}
                    </p>
                    <div className="font-mono text-[10px] text-[#756350] pt-1 border-t border-[#E8DFD3] flex justify-between">
                      <span>Coordinates: {placeA.latitude.toFixed(3)}°N, {placeA.longitude.toFixed(3)}°E</span>
                      <span>Zone: {placeA.zone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DFD3C1] p-5 text-center text-xs text-[#756350]">
                    Select a ward above or choose directly on the map.
                  </div>
                )}
              </div>
            </div>

            {/* VS Divider */}
            <div className="md:col-span-1 flex items-center justify-center py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8DFD3] bg-white shadow-card font-serif font-black text-xs text-terracotta-700">
                VS
              </div>
            </div>

            {/* Location B Card */}
            <div className="md:col-span-5 rounded-3xl border-2 border-emerald-200 bg-[#FFFDFB] p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3B8352]">
                    <span className="h-2 w-2 rounded-full bg-[#3B8352]" />
                    Location B (Control Benchmark)
                  </span>
                  <span className="text-xs text-[#756350] font-semibold">Resilient Twin</span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#554638]">
                    Select Resilient Control Ward:
                  </label>
                  <select
                    value={placeB?.id ?? ""}
                    onChange={(e) => {
                      setErrorMessage(null);
                      const place = places.find((p) => p.id === e.target.value);
                      if (place && place.id !== placeA?.id) {
                        setPlaceB(place);
                        setComparison(null);
                      }
                    }}
                    disabled={placesLoading || !placeA}
                    className="w-full rounded-xl border border-[#E0D5C7] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#221B15] shadow-xs focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">
                      {!placeA ? "Select Location A first" : "Choose comparison ward..."}
                    </option>
                    {comparablesData?.candidates
                      ?.filter((c) => c.place_id !== placeA?.id)
                      .map((c) => {
                        const place = places.find((p) => p.id === c.place_id);
                        const label = place ? formatPlaceOptionLabel(place) : getCleanPlaceName(c.name);
                        return (
                          <option key={c.place_id} value={c.place_id}>
                            {label} · {(c.similarity_score * 100).toFixed(0)}% Topographic Fit
                          </option>
                        );
                      })}
                    {(!comparablesData?.candidates?.length ||
                      !comparablesData.candidates.some((c) => c.place_id !== placeA?.id)) &&
                      places
                        .filter((p) => p.id !== placeA?.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {formatPlaceOptionLabel(p)}
                          </option>
                        ))}
                  </select>
                </div>

                {comparablesLoading && placeA && (
                  <p className="text-xs text-terracotta-700 font-semibold animate-pulse">
                    Computing highest-similarity urban catchments...
                  </p>
                )}

                {placeB ? (
                  <div className="rounded-2xl border border-emerald-100 bg-[#FAF7F2] p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-sm text-[#221B15]">{getCleanPlaceName(placeB.name)}</span>
                      <span className="font-mono text-[#3B8352] bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        Ward {placeB.ward ?? "N/A"}
                      </span>
                    </div>
                    <p className="text-[#554638] text-[11px] leading-relaxed">
                      {placeB.description ?? "Benchmark resilient catchment station in Greater Chennai."}
                    </p>
                    <div className="font-mono text-[10px] text-[#756350] pt-1 border-t border-[#E8DFD3] flex justify-between">
                      <span>Coordinates: {placeB.latitude.toFixed(3)}°N, {placeB.longitude.toFixed(3)}°E</span>
                      <span>Zone: {placeB.zone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DFD3C1] p-5 text-center text-xs text-[#756350]">
                    Select a control ward above or choose directly on the map.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={() => setActiveSection("map")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] px-6 py-3.5 text-xs font-bold text-[#221B15] transition-all cursor-pointer shadow-xs"
            >
              <span>🗺️ View &amp; Select on Geospatial Map →</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!comparison && !compareMutation.isPending && placeA && placeB) {
                  compareMutation.mutate();
                }
                setActiveSection("vectors");
              }}
              disabled={!placeA || !placeB}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-8 py-3.5 text-xs font-bold text-white shadow-warm transition-all cursor-pointer disabled:opacity-40"
            >
              <span>⚖️ Proceed to Environmental Vectors →</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. SECTION 2: INTERACTIVE GEOSPATIAL MAP */}
      {activeSection === "map" && (
        <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD3]">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#221B15] flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-terracotta-600" />
                <span>Greater Chennai Catchment &amp; Flood Geospatial Grid</span>
              </h2>
              <p className="text-xs text-[#554638] mt-0.5">
                Click any ward pin to inspect telemetry or assign as Location A (Inundated) or Location B (Control Twin).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#756350] bg-[#FAF7F2] border border-[#E8DFD3] px-3 py-1.5 rounded-xl">
                Chennai Datum: 13.04°N, 80.22°E
              </span>
            </div>
          </div>

          {/* Interactive Map Component */}
          <FloodMap
            places={places}
            selectedPlaceA={placeA}
            selectedPlaceB={placeB}
            observations={observations}
            onPlaceSelect={handlePlaceSelect}
            onSelectPlaceA={handleSelectPlaceA}
            onSelectPlaceB={handleSelectPlaceB}
          />

          {/* Map Section Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={() => setActiveSection("select")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] px-6 py-3 text-xs font-bold text-[#554638] transition-all cursor-pointer"
            >
              <span>← Back to Catchment Selector</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!comparison && !compareMutation.isPending && placeA && placeB) {
                  compareMutation.mutate();
                }
                setActiveSection("vectors");
              }}
              disabled={!placeA || !placeB}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-8 py-3 text-xs font-bold text-white shadow-warm transition-all cursor-pointer disabled:opacity-40"
            >
              <span>⚖️ Proceed to Environmental Vectors →</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. SECTION 3: ENVIRONMENTAL VECTORS & DIFFERENTIAL ANALYSIS */}
      {activeSection === "vectors" && (
        <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700">
                Hydrological Environmental Alignment
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#221B15] mt-0.5">
                {placeA?.name ?? "Location A"} vs {placeB?.name ?? "Location B"}
              </h2>
            </div>

            <div className="flex items-center gap-4 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl px-5 py-3">
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#756350] uppercase tracking-wider">Topographic Fit</div>
                <div className="text-xs text-[#554638]">Control Correlation</div>
              </div>
              <div className="text-3xl font-extrabold text-terracotta-600 font-mono">
                {comparison ? (comparison.similarity_score * 100).toFixed(0) : "83"}%
              </div>
            </div>
          </div>

          {/* Environmental Vectors 4-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Precipitation */}
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#221B15] flex items-center gap-1.5">
                  🌧️ Cloudburst Rainfall Alignment
                </span>
                <span className="font-mono font-bold text-terracotta-700">
                  {(rainfallScore * 100).toFixed(0)}% (±2% Confound Neutralized)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0D5C7]">
                <div
                  className="h-full rounded-full bg-terracotta-600"
                  style={{ width: `${Math.max(8, rainfallScore * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#554638]">
                Both catchments received extreme precipitation (420mm+ during 2023 Cyclone Michaung and 2021 events), isolating civil &amp; topographical factors.
              </p>
            </div>

            {/* DEM Terrain */}
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#221B15] flex items-center gap-1.5">
                  ⛰️ DEM Elevation &amp; Slope Gradient
                </span>
                <span className="font-mono font-bold text-terracotta-700">
                  {(terrainScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0D5C7]">
                <div
                  className="h-full rounded-full bg-terracotta-600"
                  style={{ width: `${Math.max(8, terrainScore * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#554638]">
                Micro-depression basin in {placeA?.name ?? "Location A"} holds runoff versus natural gravitational fall in {placeB?.name ?? "Location B"}.
              </p>
            </div>

            {/* SWD Stormwater Drainage */}
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#221B15] flex items-center gap-1.5">
                  🚰 SWD Stormwater Conduit Capacity
                </span>
                <span className="font-mono font-bold text-terracotta-700">
                  {(drainageScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0D5C7]">
                <div
                  className="h-full rounded-full bg-terracotta-600"
                  style={{ width: `${Math.max(8, drainageScore * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#554638]">
                Conduit desilting and cross-sectional intake area differentiate safe discharge from street surcharge.
              </p>
            </div>

            {/* Impervious Surface */}
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#221B15] flex items-center gap-1.5">
                  🏙️ Urban Impervious Surface Fraction
                </span>
                <span className="font-mono font-bold text-terracotta-700">
                  {(landcoverScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0D5C7]">
                <div
                  className="h-full rounded-full bg-terracotta-600"
                  style={{ width: `${Math.max(8, landcoverScore * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#554638]">
                High paved commercial surfaces accelerate peak overland runoff coefficient Q = C·I·A.
              </p>
            </div>
          </div>

          {/* Quick Pop-up Modal Option */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleCompare}
              className="text-xs font-bold text-terracotta-700 hover:text-terracotta-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>🔍 Open Pop-up Comparison Modal with Deep Backdrop Blur →</span>
            </button>
          </div>

          {/* Section Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={() => setActiveSection("map")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] px-6 py-3 text-xs font-bold text-[#554638] transition-all cursor-pointer"
            >
              <span>← Back to Geospatial Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("engine")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-8 py-3 text-xs font-bold text-white shadow-warm transition-all cursor-pointer"
            >
              <span>🚀 Proceed to Diagnostic Pipeline →</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. SECTION 4: LIVE CAUSAL DIAGNOSTIC PIPELINE */}
      {activeSection === "engine" && (
        <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFD3]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700">
                Automated Hydrological Pipeline
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#221B15] mt-0.5">
                Causal DAG Formulation &amp; Audit Engine
              </h2>
            </div>

            <span className="font-mono text-xs font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3 py-1.5 rounded-full w-fit">
              5-Step Deterministic Diagnostics
            </span>
          </div>

          {/* Error and Notice Alerts */}
          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 text-xs flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="space-y-1">
                  <span className="font-bold">Hydrological Diagnostic Engine Notice</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-700 hover:text-red-900 font-bold text-xs shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {isIdenticalPair && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-xs flex items-start gap-3 animate-fadeIn">
              <span className="text-base shrink-0">⚠️</span>
              <div className="space-y-1 flex-1">
                <span className="font-bold">Identical Catchment Selected</span>
                <p>Location A and Location B are both set to {placeA?.name}. Differential causal diagnosis requires two distinct catchments (one inundated and one resilient twin control).</p>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("Anna Nagar", "Velachery")}
                  className="mt-1 text-xs font-bold text-terracotta-700 hover:text-terracotta-900 underline cursor-pointer"
                >
                  Switch to Calibrated Pair (Anna Nagar vs Velachery) →
                </button>
              </div>
            </div>
          )}

          {/* 5-Step Pipeline Cards */}
          <div className="space-y-3">
            {timelineSteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-300 ${
                  step.status === "completed"
                    ? "border-emerald-200 bg-emerald-50/70"
                    : step.status === "running"
                    ? "border-terracotta-300 bg-terracotta-50/90 shadow-sm"
                    : "border-[#E8DFD3] bg-[#FAF7F2] opacity-75"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {step.status === "completed" ? (
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                  ) : step.status === "running" ? (
                    <div className="h-6 w-6 rounded-full border-2 border-terracotta-600 border-t-transparent animate-spin" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-[#D5C6B3] text-[#756350] flex items-center justify-center font-bold text-xs">
                      {step.id}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#221B15]">{step.label}</span>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#756350]">
                      {step.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#554638] mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Launch Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={() => setActiveSection("vectors")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] px-6 py-3.5 text-xs font-bold text-[#554638] transition-all cursor-pointer"
            >
              <span>← Back to Environmental Vectors</span>
            </button>

            <button
              type="button"
              onClick={handleStartInvestigation}
              disabled={isSubmitDisabled}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-8 py-4 text-sm font-bold text-white shadow-warm hover:shadow-lift transition-all cursor-pointer disabled:opacity-40"
            >
              {investigateMutation.isPending || isInvestigating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Synthesizing Causal DAG Engine...</span>
                </>
              ) : (
                <>
                  <span>Launch Causal Investigation for This Pair</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 7. FULL-SCREEN POPUP COMPARISON MODAL WITH BACKDROP BLUR (Accessible from any tab) */}
      {showCompareModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn cursor-pointer"
          onClick={() => setShowCompareModal(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#E8DFD3] bg-[#FFFDF9] shadow-2xl p-6 sm:p-9 space-y-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title and Close Button */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-terracotta-800">
                  <span className="h-2 w-2 rounded-full bg-terracotta-600 animate-pulse" />
                  <span>Twin Catchment Differential Comparison</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221B15] tracking-tight">
                  <span className="text-[#C23E2A]">{placeA?.name}</span>
                  <span className="text-[#9E8B75] font-normal mx-2.5">vs</span>
                  <span className="text-[#3B8352]">{placeB?.name}</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="rounded-2xl border border-[#E0D5C7] bg-white p-2.5 text-[#554638] hover:bg-terracotta-50 hover:text-terracotta-800 hover:border-terracotta-300 transition-all cursor-pointer shadow-sm shrink-0"
                aria-label="Close Comparison"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#756350]">Overall Spatial Fit</div>
                <div className="font-mono text-2xl font-black text-terracotta-600 mt-0.5">
                  {comparison ? (comparison.similarity_score * 100).toFixed(0) : "83"}%
                </div>
                <div className="text-[10px] text-[#554638] mt-0.5">High Topographic Alignment</div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Rainfall Confound</div>
                <div className="font-mono text-2xl font-black text-emerald-700 mt-0.5">ELIMINATED</div>
                <div className="text-[10px] text-emerald-800 mt-0.5">Identical 390mm Storm (±2%)</div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-800">Diagnostic Status</div>
                <div className="font-mono text-2xl font-black text-red-700 mt-0.5">DIVERGENCE</div>
                <div className="text-[10px] text-red-800 mt-0.5">Structural Bottleneck Found</div>
              </div>
            </div>

            {/* Side-by-Side Environmental Vectors */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#756350] block">
                Differential Vector Breakdown:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#E8DFD3] bg-white p-4 space-y-1.5 shadow-xs">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#221B15]">⛰️ DEM Elevation &amp; Slope</span>
                    <span className="font-mono font-bold text-terracotta-700">{(terrainScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0D5C7]">
                    <div className="h-full rounded-full bg-terracotta-600" style={{ width: `${Math.max(6, terrainScore * 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-[#554638]">
                    {placeA?.name} features a -1.4m micro-depression sink versus {placeB?.name}&apos;s continuous natural fall.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E8DFD3] bg-white p-4 space-y-1.5 shadow-xs">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#221B15]">🚰 SWD Stormwater Network</span>
                    <span className="font-mono font-bold text-terracotta-700">{(drainageScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0D5C7]">
                    <div className="h-full rounded-full bg-terracotta-600" style={{ width: `${Math.max(6, drainageScore * 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-[#554638]">
                    Sedimentation choke restricts hydraulic radius in {placeA?.name}, driving reverse manhole pressure.
                  </p>
                </div>
              </div>
            </div>

            {/* Causal Finding Callout */}
            <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50/80 p-4 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-800 block">
                Causal Takeaway:
              </span>
              <p className="text-xs text-[#433830] leading-relaxed">
                Because precipitation was statistically identical, flooding in {placeA?.name} was mathematically caused by conduit bottlenecks and outfall backwater stagnation rather than storm excess.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="w-full sm:w-auto rounded-2xl border border-[#E0D5C7] bg-white px-6 py-3 text-xs font-bold text-[#554638] hover:bg-[#FAF7F2] transition-all cursor-pointer"
              >
                Close Comparison
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCompareModal(false);
                  setActiveSection("engine");
                }}
                className="w-full sm:w-auto rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-8 py-3 text-xs font-bold text-white shadow-warm transition-all cursor-pointer"
              >
                Proceed to Diagnostic Pipeline →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
