"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useInvestigation, useMechanisms, useEvidence } from "@/hooks/useInvestigation";
import { useQuery } from "@tanstack/react-query";
import { getPlaces } from "@/lib/api/spatial/locations";
import { getFloodObservations } from "@/lib/api/spatial/map";
import nextDynamic from "next/dynamic";
import { useAuth } from "@/lib/auth/context";
import InvestigationHeader from "@/components/layout/InvestigationHeader";
import {
  ComparisonPanel,
  MechanismList,
  ValidationPanel,
  DefensibilityPanel,
  LimitationsPanel,
} from "@/components/investigation";
import { EvidenceList } from "@/components/evidence";
import { ErrorState, LoadingSkeleton } from "@/components/ui";
import { CounterfactualForm } from "@/components/counterfactual";
import CausalFlowBanner from "@/components/investigation/flowchart/CausalFlowBanner";
import type { Mechanism } from "@/lib/types/investigation";
import mockData from "@/lib/mockData.json";

const FloodMap = nextDynamic(() => import("@/components/map/FloodMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-[#DCE6E9] bg-[#EAF1F3]">
      <div className="flex items-center gap-3 text-sm font-semibold text-[#126D66]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#126D66] border-t-transparent" />
        <span>Loading Chennai Geospatial Basemap...</span>
      </div>
    </div>
  ),
});

const MechanismGraph = nextDynamic(
  () => import("@/components/investigation/graph/MechanismGraph"),
  { ssr: false }
);

type ActiveInvestigationTab = "simulation" | "mechanisms" | "spatial" | "evidence" | "audit";

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ActiveInvestigationTab>("simulation");
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(null);

  const { experienceMode } = useAuth();

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
        <div className="h-28 w-full animate-pulse rounded-3xl border border-[#DCE6E9] bg-white" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 animate-pulse rounded-3xl border border-[#DCE6E9] bg-white" />
          <div className="h-64 animate-pulse rounded-3xl border border-[#DCE6E9] bg-white" />
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 min-w-0 overflow-x-hidden">
      {/* 1. HEADER WITH VERDICT & STATUS */}
      <InvestigationHeader
        title={`${investigation.place_a?.name ?? "Location A"} vs ${investigation.place_b?.name ?? "Location B"}`}
        status={investigation.status}
        verdict={investigation.defensibility?.verdict}
      />

      {investigation.status === "running" && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#DDF2EE] bg-[#ECF7F5] p-4 text-xs font-semibold text-[#101F2B] shadow-xs">
          <span className="h-3 w-3 animate-ping rounded-full bg-[#ECF7F5]0 shrink-0" />
          <span>Investigation engine in progress. Live results stream automatically.</span>
        </div>
      )}

      {investigation.error_message && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800" role="alert">
          {investigation.error_message}
        </div>
      )}

      {/* 2. ROLE-TAILORED EXPERIENCE DISPLAY */}
      {experienceMode === "citizen" ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Citizen Mode Advisory Header */}
          <div className="rounded-3xl border border-[#DDF2EE] bg-gradient-to-br from-[#F6F9FA] via-white to-[#ECF7F5] p-6 sm:p-8 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE6E9] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#126D66] text-white shadow-cool text-base font-semibold shrink-0">
                  🏘️
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg sm:text-xl text-[#172D3A] tracking-tight">
                      Resident Community Flood Advisory
                    </h2>
                    <span className="rounded-full border border-[#DDF2EE] bg-[#ECF7F5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#126D66]">
                      Citizen Mode
                    </span>
                  </div>
                  <p className="text-xs text-[#647C89] mt-0.5 font-normal">
                    Plain-language flood risk diagnosis, twin-ward comparison, and neighborhood precautions
                  </p>
                </div>
              </div>

              <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-[#DDF2EE] bg-[#ECF7F5] px-3 py-1.5 text-xs font-medium text-[#126D66]">
                <span>Verified Resident Advisory</span>
              </div>
            </div>

            {/* Plain-Language 4-Pillar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Location & Status */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#168C83]">
                    Location & Status
                  </span>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                </div>
                <h4 className="font-semibold text-sm text-[#172D3A]">
                  {investigation.place_a?.name ?? "Monitored Catchment"}
                </h4>
                <p className="text-xs text-[#344C59] leading-relaxed font-normal">
                  Ward {investigation.place_a?.ward || "178"} is situated in a low-elevation terrain pocket subject to runoff accumulation during high intensity downpours.
                </p>
              </div>

              {/* Pillar 2: Why It Flooded */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#168C83]">
                    Why It Flooded Here
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#126D66]" />
                </div>
                <h4 className="font-semibold text-sm text-[#172D3A]">
                  Canal Backwater & Siltation
                </h4>
                <p className="text-xs text-[#344C59] leading-relaxed font-normal">
                  Stormwater backed up from downstream canals into the local bowl-like basin. Neighboring {investigation.place_b?.name || "twin ward"} stayed dry due to steeper natural slope.
                </p>
              </div>

              {/* Pillar 3: Resident Actions */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#168C83]">
                    Recommended Actions
                  </span>
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <h4 className="font-semibold text-sm text-[#172D3A]">
                  Household Precautions
                </h4>
                <ul className="text-xs text-[#344C59] space-y-1 list-disc pl-3 leading-relaxed font-normal">
                  <li>Elevate ground-floor appliances &gt;30cm.</li>
                  <li>Avoid low-lying canal road underpasses.</li>
                  <li>Keep emergency flashlights & power banks charged.</li>
                </ul>
              </div>

              {/* Pillar 4: Helplines */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                    Emergency Helplines
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-semibold text-sm text-[#172D3A]">
                  Official Civic Contacts
                </h4>
                <div className="text-xs space-y-1 text-[#344C59] font-normal">
                  <p><span className="font-semibold text-[#172D3A]">GCC Control:</span> 1913</p>
                  <p><span className="font-semibold text-[#172D3A]">TNEB Power:</span> 94987 94987</p>
                  <p><span className="font-semibold text-[#172D3A]">Police/Disaster:</span> 112</p>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Map View */}
          <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE6E9] pb-3">
              <div>
                <h3 className="font-semibold text-lg text-[#172D3A]">
                  Neighborhood Flood Map & Verified Waterlogged Points
                </h3>
                <p className="text-xs text-[#344C59] mt-0.5 font-normal">
                  Interactive map showing your area, twin baseline comparison, and field observations.
                </p>
              </div>
              <span className="text-xs font-medium text-[#647C89] bg-[#F6F9FA] border border-[#DCE6E9] px-3 py-1 rounded-xl self-start sm:self-auto">
                Ward Community View
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
                note: `Monitoring Ward ${investigation.place_a?.ward || "A"} vs Ward ${investigation.place_b?.ward || "B"}.`,
              }}
            />
          </section>
        </div>
      ) : (
        /* TECHNICAL MODE EXPERIENCE */
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700 text-white text-xs font-semibold font-mono">
                T
              </span>
              <div>
                <p className="font-semibold text-[#172D3A]">
                  Technical Mode Active: Hydrological & Physical Engineering Depth
                </p>
                <p className="text-[11px] text-[#647C89] font-mono">
                  Manning Q = (1/n)AR^(2/3)S^(1/2) • Rational Q = CIA • GVF dy/dx = (S0 - Sf)/(1 - Fr²)
                </p>
              </div>
            </div>
            <div className="self-start sm:self-auto rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-medium text-amber-900 shadow-2xs">
              Role: GCC Hydrologist
            </div>
          </div>

          {/* FUNCTIONAL SECTION BAR (RESPONSIVE SINGLE-TAB DISPLAY FOR TECHNICAL MODE) */}
          <div className="bg-white rounded-2xl border border-[#DCE6E9] p-1.5 shadow-sm flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("simulation")}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "simulation"
                  ? "bg-[#126D66] text-white shadow-cool"
                  : "text-[#344C59] hover:bg-[#F6F9FA] hover:text-[#172D3A]"
              }`}
            >
              <span>🔬</span>
              <span>1. Simulation Lab</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mechanisms")}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "mechanisms"
                  ? "bg-[#126D66] text-white shadow-cool"
                  : "text-[#344C59] hover:bg-[#F6F9FA] hover:text-[#172D3A]"
              }`}
            >
              <span>🕸️</span>
              <span>2. Causal DAG</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("spatial")}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "spatial"
                  ? "bg-[#126D66] text-white shadow-cool"
                  : "text-[#344C59] hover:bg-[#F6F9FA] hover:text-[#172D3A]"
              }`}
            >
              <span>🗺️</span>
              <span>3. Geospatial Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("evidence")}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "evidence"
                  ? "bg-[#126D66] text-white shadow-cool"
                  : "text-[#344C59] hover:bg-[#F6F9FA] hover:text-[#172D3A]"
              }`}
            >
              <span>📜</span>
              <span>4. Evidence Registry</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-[#126D66] text-white shadow-cool"
                  : "text-[#344C59] hover:bg-[#F6F9FA] hover:text-[#172D3A]"
              }`}
            >
              <span>🛡️</span>
              <span>5. Defensibility Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. TECHNICAL MODE WORKING TABS (HIDDEN IN CITIZEN VIEW) */}
      {experienceMode !== "citizen" && (
        <>
          {/* 4. TAB 1: EXECUTIVE SUMMARY & BOUNDED SIMULATION LAB */}
          {activeTab === "simulation" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Executive Summary Card */}
              <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE6E9] pb-3">
                  <h2 className="font-semibold text-xl text-[#172D3A] tracking-tight">Executive Diagnostic Summary</h2>
                  {investigation.strongest_mechanism && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#DDF2EE] bg-[#ECF7F5] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#126D66]">
                      <span className="h-2 w-2 rounded-full bg-[#126D66]" />
                      Primary Driver: {investigation.strongest_mechanism.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-[#344C59] font-normal">
                  {investigation.summary ?? "No summary available."}
                </p>
              </section>

              {/* Bounded Counterfactual Simulation Lab - PROMINENTLY AT THE TOP */}
              <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE6E9] pb-3">
                  <div>
                    <h2 className="font-semibold text-xl text-[#172D3A] tracking-tight">
                      Bounded Counterfactual Simulation Lab
                    </h2>
                    <p className="text-xs text-[#647C89] mt-0.5 font-normal">
                      Simulate what-if engineering interventions (desilting percentage, conduit radius, runoff coefficient).
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#126D66] bg-[#ECF7F5] border border-[#DDF2EE] px-3 py-1 rounded-full w-fit">
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
              <section className="lg:col-span-5 rounded-3xl border border-[#DCE6E9] bg-white p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-3">
                  <div>
                    <h2 className="font-semibold text-lg text-[#172D3A] tracking-tight">Causal Mechanism Ranking</h2>
                    <p className="text-xs text-[#647C89]">Non-zero verified hypotheses</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#126D66] bg-[#ECF7F5] border border-[#DDF2EE] px-2.5 py-0.5 rounded-full">
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
              <section className="lg:col-span-7 rounded-3xl border border-[#DCE6E9] bg-white p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-3">
                  <div>
                    <h2 className="font-semibold text-lg text-[#172D3A] tracking-tight">Mechanism DAG Relationships</h2>
                    <p className="text-xs text-[#647C89]">Causal interaction graph with interactive node inspector</p>
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
                <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4">
                  <h2 className="font-semibold text-xl text-[#172D3A] tracking-tight">Differential Baseline Comparison</h2>
                  <ComparisonPanel comparison={investigation.comparison} />
                </section>
              )}

              {/* Interactive Chennai Map */}
              <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-3">
                  <div>
                    <h2 className="font-semibold text-xl text-[#172D3A] tracking-tight">Geographic Catchment Analysis Map</h2>
                    <p className="text-xs text-[#344C59] mt-0.5 font-normal">
                      Live OpenStreetMap tiles displaying monitored catchments, flood inundation points, and drainage grid.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#647C89] bg-[#F6F9FA] border border-[#DCE6E9] px-3 py-1 rounded-xl">
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
            <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE6E9] pb-3">
                <div>
                  <h2 className="font-semibold text-xl text-[#172D3A] tracking-tight">Evidence &amp; Provenance Registry</h2>
                  <p className="text-xs text-[#344C59] mt-0.5 font-normal">
                    Diagrammatic audit trail categorizing FACT, SUPPORTED, and HYPOTHESIS data elements.
                  </p>
                </div>
                <span className="text-xs font-medium text-[#647C89] bg-[#F6F9FA] border border-[#DCE6E9] px-3 py-1 rounded-xl">
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
                  <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4">
                    <h2 className="font-semibold text-lg text-[#172D3A] tracking-tight border-b border-[#DCE6E9] pb-2">
                      Historical Event Validation
                    </h2>
                    <ValidationPanel validation={investigation.validation} />
                  </section>
                )}

                {investigation.defensibility && (
                  <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4">
                    <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-2">
                      <h2 className="font-semibold text-lg text-[#172D3A] tracking-tight">
                        Defensibility &amp; Audit Assessment
                      </h2>
                      <span className="text-xs font-medium text-[#647C89] bg-[#F6F9FA] border border-[#DCE6E9] px-3 py-1 rounded-xl">
                        Regulatory Integrity Audit
                      </span>
                    </div>
                    <DefensibilityPanel assessment={investigation.defensibility} />
                  </section>
                )}
              </div>

              {/* Material Scope Limitations */}
              {investigation.limitations.length > 0 && (
                <section className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-3">
                    <h2 className="font-semibold text-lg text-[#172D3A] tracking-tight">Documented Limitations &amp; Scope Constraints</h2>
                    <span className="text-xs text-[#647C89]">Analytical Bounds</span>
                  </div>
                  <LimitationsPanel limitations={investigation.limitations} />
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
