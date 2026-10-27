"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useInvestigation, useMechanisms, useEvidence } from "@/hooks/useInvestigation";
import { getPlaces } from "@/lib/api/spatial/locations";
import { getFloodObservations } from "@/lib/api/spatial/map";
import InvestigationHeader from "@/components/layout/InvestigationHeader";
import { ErrorState, LoadingSkeleton } from "@/components/ui";
import {
  ComparisonPanel,
  DefensibilityPanel,
  LimitationsPanel,
  MechanismGraph,
  MechanismList,
  ValidationPanel,
} from "@/components/investigation";
import EvidenceList from "@/components/evidence/EvidenceList";
import { CounterfactualForm } from "@/components/counterfactual";
import CausalFlowBanner from "@/components/investigation/flowchart/CausalFlowBanner";
import type { Mechanism } from "@/lib/types/investigation";
import mockData from "@/lib/mockData.json";
import { useAuth } from "@/lib/auth/context";

const FloodMap = dynamic(() => import("@/components/map/FloodMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-[#E8DFD3] bg-[#F5EFE6]">
      <div className="flex items-center gap-3 text-sm font-semibold text-terracotta-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
        <span>Loading Chennai Geospatial Map...</span>
      </div>
    </div>
  ),
});

type ActiveInvestigationTab = "simulation" | "mechanisms" | "spatial" | "evidence" | "audit";

export default function InvestigationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [activeTab, setActiveTab] = useState<ActiveInvestigationTab>("simulation");
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(null);

  const { experienceMode, setExperienceMode } = useAuth();

  const {
    data: investigation,
    isLoading: investigationLoading,
    error: investigationError,
    refetch,
  } = useInvestigation(id);

  const { data: mechanisms = [], isLoading: mechanismsLoading } = useMechanisms(id);
  const { data: evidence = [], isLoading: evidenceLoading } = useEvidence(id);

  const { data: places = mockData.places as any[] } = useQuery({
    queryKey: ["places"],
    queryFn: getPlaces,
    initialData: mockData.places as any[],
  });

  const { data: observations = mockData.obs as any[] } = useQuery({
    queryKey: ["flood-observations"],
    queryFn: () => getFloodObservations(100),
    initialData: mockData.obs as any[],
  });

  if (investigationLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="h-28 w-full animate-pulse rounded-3xl border border-[#E8DFD3] bg-white" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 animate-pulse rounded-3xl border border-[#E8DFD3] bg-white" />
          <div className="h-64 animate-pulse rounded-3xl border border-[#E8DFD3] bg-white" />
        </div>
      </div>
    );
  }

  if (investigationError || !investigation) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          message={investigationError?.message ?? "Investigation not found"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* 1. HEADER WITH VERDICT & STATUS */}
      <InvestigationHeader
        title={`${investigation.place_a?.name ?? "Location A"} vs ${investigation.place_b?.name ?? "Location B"}`}
        status={investigation.status}
        verdict={investigation.defensibility?.verdict}
      />

      {investigation.status === "running" && (
        <div className="flex items-center gap-3 rounded-2xl border border-terracotta-200 bg-terracotta-50 p-4 text-xs font-bold text-terracotta-900 shadow-xs">
          <span className="h-3 w-3 animate-ping rounded-full bg-terracotta-500" />
          <span>Investigation engine in progress. Live results stream automatically.</span>
        </div>
      )}

      {investigation.error_message && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800" role="alert">
          {investigation.error_message}
        </div>
      )}

      {/* 2. EXPERIENCE MODE TAILORED PRESENTATION BANNER */}
      {experienceMode === "citizen" ? (
        <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50/70 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta-600 text-white text-xs font-bold">
                C
              </span>
              <div>
                <h3 className="font-serif text-sm font-bold text-[#221B15]">
                  Citizen View: Why this area flooded
                </h3>
                <p className="text-[11px] text-[#756350]">
                  Plain-language breakdown for residents and community members
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExperienceMode("technical")}
              className="self-start sm:self-auto rounded-xl border border-terracotta-300 bg-white px-3 py-1.5 text-[11px] font-bold text-terracotta-800 hover:bg-terracotta-100 hover:text-terracotta-900 transition-colors shadow-2xs cursor-pointer"
            >
              Switch to Technical Mode →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="rounded-xl border border-[#E8DFD3] bg-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
                What the Evidence Shows
              </span>
              <p className="text-[#3A2F25] font-medium leading-relaxed">
                Both areas received nearly identical cloudburst rainfall (over 380mm). Meteorological rainfall alone did not cause the divergence.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8DFD3] bg-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
                Physical Failure Reason
              </span>
              <p className="text-[#3A2F25] font-medium leading-relaxed">
                Water backed up from downstream stormwater drain (SWD) canals into the local elevation depression basin, preventing gravity outflow.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8DFD3] bg-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
                What Is Still Uncertain
              </span>
              <p className="text-[#3A2F25] font-medium leading-relaxed">
                Tidal gate surge timing at the canal outfall during high tide is being verified with ground-truth sensor records.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700 text-white text-xs font-bold font-mono">
              T
            </span>
            <div>
              <p className="font-bold text-[#221B15]">
                Technical Mode Active: Hydrological & Physical Engineering Depth
              </p>
              <p className="text-[11px] text-[#756350] font-mono">
                Manning Q = (1/n)AR^(2/3)S^(1/2) • Rational Q = CIA • GVF dy/dx = (S0 - Sf)/(1 - Fr²)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExperienceMode("citizen")}
            className="self-start sm:self-auto rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
          >
            Switch to Citizen Mode
          </button>
        </div>
      )}

      {/* 3. FUNCTIONAL SECTION BAR (SINGLE-TAB DISPLAY) */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] p-1.5 shadow-sm flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("simulation")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "simulation"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>🔬</span>
          <span>1. Simulation Lab</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mechanisms")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "mechanisms"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>🕸️</span>
          <span>2. Causal DAG &amp; Ranking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("spatial")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "spatial"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>🗺️</span>
          <span>3. Geospatial Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("evidence")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "evidence"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>📜</span>
          <span>4. Evidence Registry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-terracotta-600 text-white shadow-warm"
              : "text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15]"
          }`}
        >
          <span>🛡️</span>
          <span>5. Defensibility Audit</span>
        </button>
      </div>

      {/* 4. TAB 1: EXECUTIVE SUMMARY & BOUNDED SIMULATION LAB */}
      {activeTab === "simulation" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Summary Card */}
          <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD3] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#221B15]">Executive Diagnostic Summary</h2>
              {investigation.strongest_mechanism && (
                <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
                  <span className="h-2 w-2 rounded-full bg-terracotta-600" />
                  Primary Driver: {investigation.strongest_mechanism.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-[#433830]">
              {investigation.summary ?? "No summary available."}
            </p>
          </section>

          {/* Bounded Counterfactual Simulation Lab - PROMINENTLY AT THE TOP */}
          <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD3] pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#221B15]">
                  Bounded Counterfactual Simulation Lab
                </h2>
                <p className="text-xs text-[#756350] mt-0.5">
                  Simulate what-if engineering interventions (desilting percentage, conduit radius, runoff coefficient).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3 py-1 rounded-full w-fit">
                What-If Intervention Engine
              </span>
            </div>
            <CounterfactualForm investigationId={id} />
          </section>

          {/* Causal Flow Banner */}
          <CausalFlowBanner
            investigation={investigation}
            mechanisms={mechanisms}
          />
        </div>
      )}

      {/* 5. TAB 2: CAUSAL MECHANISMS & EXPANDED DAG GRAPH */}
      {activeTab === "mechanisms" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn items-start">
          {/* Mechanism Ranking (Left, 5 cols) */}
          <section className="lg:col-span-5 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#221B15]">Causal Mechanism Ranking</h2>
                <p className="text-xs text-[#756350]">Non-zero verified hypotheses</p>
              </div>
              <span className="text-[11px] font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-2.5 py-0.5 rounded-full">
                Active Drivers
              </span>
            </div>
            {mechanismsLoading ? (
              <LoadingSkeleton variant="card" />
            ) : (
              <MechanismList
                mechanisms={mechanisms}
                onMechanismSelect={setSelectedMechanism}
                selectedMechanismId={selectedMechanism?.id}
              />
            )}
          </section>

          {/* Large Visible Mechanism DAG Relationships (Right, 7 cols) */}
          <section className="lg:col-span-7 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#221B15]">Mechanism DAG Relationships</h2>
                <p className="text-xs text-[#756350]">Causal interaction graph with interactive node inspector</p>
              </div>
            </div>
            <MechanismGraph
              investigationId={id}
              selectedMechanismId={selectedMechanism?.id}
            />
          </section>
        </div>
      )}

      {/* 6. TAB 3: SPATIAL MAP & BASELINE COMPARISON */}
      {activeTab === "spatial" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Topographic Comparison & Baseline */}
          {investigation.comparison && (
            <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#221B15]">Differential Baseline Comparison</h2>
              <ComparisonPanel comparison={investigation.comparison} />
            </section>
          )}

          {/* Interactive Chennai Map */}
          <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#221B15]">Geographic Catchment Analysis Map</h2>
                <p className="text-xs text-[#554638] mt-0.5">
                  Live OpenStreetMap tiles displaying monitored catchments, flood inundation points, and drainage grid.
                </p>
              </div>
              <span className="text-xs font-mono text-[#756350] bg-[#FAF7F2] border border-[#E8DFD3] px-3 py-1 rounded-xl">
                Chennai Basin
              </span>
            </div>
            <FloodMap
              places={places}
              selectedPlaceA={investigation.place_a}
              selectedPlaceB={investigation.place_b}
              observations={observations}
              drainageInfo={{
                wardA: investigation.place_a?.ward ?? undefined,
                wardB: investigation.place_b?.ward ?? undefined,
                note: `Drainage network attributes analyzed across Ward ${investigation.place_a?.ward || "A"} vs Ward ${investigation.place_b?.ward || "B"}.`,
              }}
            />
          </section>
        </div>
      )}

      {/* 7. TAB 4: EVIDENCE & PROVENANCE REGISTRY */}
      {activeTab === "evidence" && (
        <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD3] pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#221B15]">Evidence &amp; Provenance Registry</h2>
              <p className="text-xs text-[#554638] mt-0.5">
                Diagrammatic audit trail categorizing FACT, SUPPORTED, and HYPOTHESIS data elements.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#756350] bg-[#FAF7F2] border border-[#E8DFD3] px-3 py-1 rounded-xl">
              Audit Registry
            </span>
          </div>
          {evidenceLoading ? (
            <LoadingSkeleton variant="card" />
          ) : (
            <EvidenceList
              evidence={evidence}
              investigationId={id}
              selectedMechanism={selectedMechanism?.mechanism_type}
            />
          )}
        </section>
      )}

      {/* 8. TAB 5: DEFENSIBILITY AUDIT & DOCUMENTED LIMITATIONS */}
      {activeTab === "audit" && (
        <div className="space-y-6 animate-fadeIn">
          <div className={investigation.validation ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" : "w-full space-y-6"}>
            {investigation.validation && (
              <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4">
                <h2 className="font-serif text-lg font-bold text-[#221B15] border-b border-[#E8DFD3] pb-2">
                  Historical Event Validation
                </h2>
                <ValidationPanel validation={investigation.validation} />
              </section>
            )}

            {investigation.defensibility && (
              <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2">
                  <h2 className="font-serif text-lg font-bold text-[#221B15]">
                    Defensibility &amp; Audit Assessment
                  </h2>
                  <span className="text-xs font-semibold text-[#756350] bg-[#FAF7F2] border border-[#E8DFD3] px-3 py-1 rounded-xl">
                    Regulatory Integrity Audit
                  </span>
                </div>
                <DefensibilityPanel assessment={investigation.defensibility} />
              </section>
            )}
          </div>

          {/* Material Scope Limitations */}
          {investigation.limitations.length > 0 && (
            <section className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-3">
                <h2 className="font-serif text-lg font-bold text-[#221B15]">Documented Limitations &amp; Scope Constraints</h2>
                <span className="text-xs text-[#756350]">Analytical Bounds</span>
              </div>
              <LimitationsPanel limitations={investigation.limitations} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
