"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";

interface FeaturePortal {
  id: string;
  href: string;
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  description: string;
  highlights: string[];
  buttonText: string;
  buttonVariant: "primary" | "secondary";
  iconSvg: React.ReactNode;
}

interface CitizenWardInfo {
  id: string;
  wardName: string;
  wardNumber: string;
  status: "vulnerable" | "moderate" | "resilient";
  statusLabel: string;
  summary: string;
  whyItHappened: string;
  recommendedAction: string;
  safetyAdvice: string;
}

const CITIZEN_WARDS: CitizenWardInfo[] = [
  {
    id: "anna-nagar",
    wardName: "Anna Nagar",
    wardNumber: "Ward 101",
    status: "vulnerable",
    statusLabel: "Monitored — Local Basin Backwater Risk",
    summary: "Experienced road and basement flooding during intense cloudbursts due to canal backup, despite moderate rainfall.",
    whyItHappened: "Stormwater drains filled with sediment and downstream canal levels rose, causing water to back up through street grates rather than draining freely.",
    recommendedAction: "Request GCC pre-monsoon storm drain desilting; inspect ground-floor sump check valves to prevent reverse street flow.",
    safetyAdvice: "Move vehicles to elevated ramps when rainfall exceeds 100mm; keep household drinking sumps sealed tightly.",
  },
  {
    id: "velachery",
    wardName: "Velachery",
    wardNumber: "Ward 177",
    status: "moderate",
    statusLabel: "Actively Draining — Canal Outfall Dependent",
    summary: "Large portions of the ward drained effectively due to unobstructed trunk channels conveying water to marshland canals.",
    whyItHappened: "Open concrete conduit pathways allowed rainwater to flow out continuously by gravity without upstream clogging.",
    recommendedAction: "Keep roadside curb openings free of dry waste and plastic bags so street runoff can enter grates quickly.",
    safetyAdvice: "Report any blocked catch-basins directly to GCC Helpline 1913 before monsoon cloudbursts.",
  },
  {
    id: "t-nagar",
    wardName: "T. Nagar",
    wardNumber: "Ward 104",
    status: "vulnerable",
    statusLabel: "High Impervious Runoff Area",
    summary: "Commercial paved surfaces generate fast runoff that temporarily exceeds the capacity of older masonry drains.",
    whyItHappened: "Over 85% of land is covered by concrete and asphalt; rainwater cannot soak into the ground and rushes into street drains all at once.",
    recommendedAction: "Advocate for permeable pavement retrofit and rooftop rainwater harvesting recharge wells in apartment complexes.",
    safetyAdvice: "Avoid parking in underground basements during severe weather advisories.",
  },
  {
    id: "adyar",
    wardName: "Adyar",
    wardNumber: "Ward 103",
    status: "resilient",
    statusLabel: "Resilient Twin Catchment",
    summary: "Gentle natural slope toward the river and clear conduit trunks allowed rainwater to discharge safely with minimal street pooling.",
    whyItHappened: "A positive 1.5% ground gradient gives water natural downward momentum, allowing storm drains to self-clean at high velocity.",
    recommendedAction: "Maintain riverbank trash barriers and regular tidal gate inspection.",
    safetyAdvice: "Standard monsoon precautions; monitor river water level during high tide cycles.",
  },
];

export default function FeatureHubPage() {
  const { experienceMode } = useAuth();
  const [selectedCitizenWard, setSelectedCitizenWard] = useState<CitizenWardInfo>(CITIZEN_WARDS[0]);

  const technicalFeatures: FeaturePortal[] = [
    {
      id: "flowchart",
      href: "/flowchart",
      title: "Causal DAG & Flowchart Engine",
      category: "Hydrological Physics Simulator",
      badge: "Real Physics Engine",
      badgeColor: "bg-[#ECF7F5] text-[#126D66] border-[#DDF2EE]",
      description:
        "Trace exact mathematical failure sequences: Manning pipe discharge Q_cap, silt obstruction, tidal canal stage, and backwater surcharge.",
      highlights: [
        "Live interactive sliders (Rainfall, Silt %, Slope, Tidal Head)",
        "Animated SVG flow connectors with real-time status pulses",
        "Deep Hydrological Inspector with physical equations & GCC field datum",
      ],
      buttonText: "Launch Causal Flowchart",
      buttonVariant: "primary",
      iconSvg: (
        <svg className="h-6 w-6 text-[#168C83]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M9 6h6M6 9v6M18 9v6M9 18h6" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      id: "simulator",
      href: "/simulator",
      title: "Differential Twin Catchment Simulator",
      category: "Counterfactual Spatial Analysis",
      badge: "Twin Ward Analysis",
      badgeColor: "bg-[#EAF1F3] text-[#193344] border-[#BBDCE5]",
      description:
        "Pair inundated wards with resilient twins under identical Cyclone Michaung (2023) and recent cloudburst conditions to neutralize weather confounds and pinpoint failure points.",
      highlights: [
        "Anna Nagar vs Velachery (83.2% Twin Fitness)",
        "T Nagar vs Adyar (91.1% Twin Fitness)",
        "Differential meters: DEM depression, SWD diameter, and imperviousness",
      ],
      buttonText: "Explore Twin Simulator",
      buttonVariant: "secondary",
      iconSvg: (
        <svg className="h-6 w-6 text-[#126D66]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
      ),
    },
    {
      id: "console",
      href: "/investigations/new",
      title: "Spatial Diagnostic Console",
      category: "Live GIS Mapping Studio",
      badge: "Full Spatial Map",
      badgeColor: "bg-[#DDF2EE] text-[#0E544F] border-[#B0EAE3]",
      description:
        "Full-screen GIS map of Chennai showing GCC stormwater conduits, elevation contours, historical flood observation points, and automated causal formulation.",
      highlights: [
        "Interactive Chennai Basemap with custom CartoDB styling",
        "100+ Ground-truth GCC flood observation depth markers (2023 & recent events)",
        "Automated 5-stage causal inference and defensibility audit pipeline",
      ],
      buttonText: "Open Diagnostic Console",
      buttonVariant: "primary",
      iconSvg: (
        <svg className="h-6 w-6 text-[#168C83]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
    {
      id: "infrastructure",
      href: "/infrastructure",
      title: "Subsurface Infrastructure Cross-Section",
      category: "3D Physical Anatomy",
      badge: "Physical Anatomy",
      badgeColor: "bg-[#F6F9FA] text-[#344C59] border-[#DCE6E9]",
      description:
        "Dual 3D architectural cross-section revealing underground drainage dynamics: Block A silt backwater surcharge vs Block B unobstructed gravity discharge.",
      highlights: [
        "3D underground SWD pipe cross-section illustration",
        "Chennai River Basins: Cooum, Adyar, and Buckingham Canal datum",
        "Hydraulic gradient and outfall slope specifications",
      ],
      buttonText: "Inspect Cross-Section",
      buttonVariant: "secondary",
      iconSvg: (
        <svg className="h-6 w-6 text-[#344C59]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
  ];

  const isCitizenMode = experienceMode === "citizen";

  return (
    <div className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn">
      {/* Dynamic Header with Enforced Role Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#DCE6E9]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDF2EE] bg-[#ECF7F5] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#126D66]">
              <span className={`h-2 w-2 rounded-full ${isCitizenMode ? "bg-[#168C83]" : "bg-[#263C4A]"}`} />
              <span>{isCitizenMode ? "Citizen Resident Portal" : "Hydrological Engineering Hub"}</span>
            </span>
            <span className="font-mono text-xs text-[#647C89] bg-white border border-[#DCE6E9] px-2.5 py-0.5 rounded-lg">
              Greater Chennai Grid
            </span>
          </div>

          <h1 className="font-bold text-2xl sm:text-4xl text-[#172D3A] tracking-tight">
            {isCitizenMode
              ? "Understand Your Ward's Flood Risk & Practical Precautions"
              : "Hydrological Intelligence & Diagnostic Workspaces"}
          </h1>

          <p className="text-sm sm:text-base text-[#344C59] leading-relaxed max-w-2xl font-normal">
            {isCitizenMode
              ? "Simple, verified insights for Chennai residents. See why your neighborhood flooded or stayed safe, and explore practical safety steps."
              : "Full mathematical models, differential twin-catchment formulation, Manning conduit equations, and causal DAG diagnostic tools."}
          </p>
        </div>

        {/* Read-Only Enforced Role Badge & Optional Diagnostic Link */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#DCE6E9] bg-white px-3.5 py-2 text-xs font-medium text-[#344C59] shadow-xs">
            <span className="font-semibold text-[#172D3A]">Role:</span>
            <span>{isCitizenMode ? "Citizen Resident Observer" : "GCC Senior Hydrologist"}</span>
          </div>

          {!isCitizenMode && (
            <Link
              href="/investigations/new"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#126D66] hover:bg-[#0E544F] px-4 py-2.5 rounded-xl transition-all shadow-cool"
            >
              <span>Diagnostic Console →</span>
            </Link>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* EXPERIENCE 1: CITIZEN RESIDENT EXPERIENCE                     */}
      {/* ============================================================== */}
      {isCitizenMode ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Ward Selection Row */}
          <div className="space-y-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[#647C89] block">
              Select Your Area / Ward to Check Assessed Status:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CITIZEN_WARDS.map((ward) => {
                const isSelected = selectedCitizenWard.id === ward.id;
                return (
                  <button
                    key={ward.id}
                    type="button"
                    onClick={() => setSelectedCitizenWard(ward)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#126D66] bg-white shadow-cool ring-2 ring-[#168C83]/20"
                        : "border-[#DCE6E9] bg-[#F6F9FA] hover:bg-white hover:border-[#C6D5DA]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#172D3A]">{ward.wardName}</span>
                      <span className="font-mono text-[10px] text-[#647C89]">{ward.wardNumber}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          ward.status === "vulnerable"
                            ? "bg-red-500"
                            : ward.status === "moderate"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-[11px] font-medium text-[#344C59] line-clamp-1">
                        {ward.status === "vulnerable" ? "Silt Backwater Risk" : ward.status === "moderate" ? "Canal Dependent" : "Resilient Drainage"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focused Ward Information Panel */}
          <div className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE6E9]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-xl sm:text-2xl text-[#172D3A]">
                    {selectedCitizenWard.wardName} ({selectedCitizenWard.wardNumber})
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      selectedCitizenWard.status === "vulnerable"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : selectedCitizenWard.status === "moderate"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {selectedCitizenWard.statusLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#344C59] mt-1 font-normal">
                  {selectedCitizenWard.summary}
                </p>
              </div>

              <Link
                href="/investigations/de9cda17-8daa-448d-813e-9378b97619fb"
                className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#126D66] hover:text-[#0E544F] bg-[#ECF7F5] hover:bg-[#DDF2EE] border border-[#DDF2EE] px-3.5 py-2 rounded-xl transition-colors"
              >
                <span>View Community Flood Map →</span>
              </Link>
            </div>

            {/* 3 Plain-Language Information Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1: Plain Language Explanation */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-[#F6F9FA] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#126D66]">
                  <span>💡</span>
                  <span>Why Did This Happen?</span>
                </div>
                <p className="text-xs sm:text-sm text-[#344C59] leading-relaxed font-normal">
                  {selectedCitizenWard.whyItHappened}
                </p>
              </div>

              {/* Pillar 2: Recommended Resident Action */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-[#F6F9FA] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#526B79]">
                  <span>🛠️</span>
                  <span>Recommended Resident Action</span>
                </div>
                <p className="text-xs sm:text-sm text-[#344C59] leading-relaxed font-normal">
                  {selectedCitizenWard.recommendedAction}
                </p>
              </div>

              {/* Pillar 3: Safety & Emergency Advice */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-[#F6F9FA] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  <span>🛡️</span>
                  <span>Monsoon Safety Advice</span>
                </div>
                <p className="text-xs sm:text-sm text-[#344C59] leading-relaxed font-normal">
                  {selectedCitizenWard.safetyAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Official Helplines & Emergency Advisory Card */}
          <div className="rounded-3xl border border-[#DDF2EE] bg-gradient-to-br from-[#ECF7F5] via-white to-[#EAF1F3] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#126D66] text-white text-xs font-semibold">
                ☎️
              </span>
              <h3 className="font-semibold text-base text-[#172D3A]">
                Verified Greater Chennai Corporation Civil Helplines
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="rounded-xl border border-[#DDF2EE] bg-white p-4 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#647C89] block">
                  GCC 24/7 Citizen Helpline
                </span>
                <span className="font-mono text-2xl font-bold text-[#126D66] block">1913</span>
                <span className="text-[11px] text-[#344C59]">Toll-free emergency &amp; water-logging support</span>
              </div>

              <div className="rounded-xl border border-[#DCE6E9] bg-white p-4 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#647C89] block">
                  State Disaster Control Room
                </span>
                <span className="font-mono text-xl font-bold text-[#172D3A] block">1070</span>
                <span className="text-[11px] text-[#344C59]">Tamil Nadu State Disaster Management Authority</span>
              </div>

              <div className="rounded-xl border border-[#DCE6E9] bg-white p-4 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#647C89] block">
                  District Operations Centre
                </span>
                <span className="font-mono text-xl font-bold text-[#172D3A] block">1077</span>
                <span className="text-[11px] text-[#344C59]">Chennai District Collectorate Control</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* EXPERIENCE 2: TECHNICAL HYDROLOGICAL WORKSPACE                */
        /* ============================================================== */
        <div className="space-y-8 animate-fadeIn">
          {/* Engineering Physical Formulary Strip */}
          <div className="rounded-2xl border border-[#BBDCE5] bg-[#EAF1F3] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#263C4A] text-white font-bold shrink-0">
                📐
              </span>
              <div>
                <span className="font-semibold text-[#172D3A] block font-sans text-sm">
                  Physical Hydro-Mechanic Formulations Active:
                </span>
                <span className="text-[#344C59] text-[11px]">
                  Manning Q = (1/n)·A·R^(2/3)·S^(1/2) • Rational Q = CIA • GVF dy/dx = (S0 - Sf)/(1 - Fr²)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <span className="rounded-md bg-white border border-[#C6D5DA] px-2 py-1 text-[11px] text-[#193344] font-medium">
                Copernicus GLO-30 DEM
              </span>
              <span className="rounded-md bg-white border border-[#C6D5DA] px-2 py-1 text-[11px] text-[#193344] font-medium">
                GCC SWD GIS Vector
              </span>
            </div>
          </div>

          {/* 4 Technical Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalFeatures.map((feature) => (
              <div
                key={feature.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#DCE6E9] bg-white p-7 sm:p-8 shadow-card hover:shadow-lift hover:border-[#C6D5DA] transition-all duration-300"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#647C89]">
                      {feature.category}
                    </span>
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F6F9FA] border border-[#DCE6E9] shadow-xs group-hover:scale-105 transition-transform duration-200">
                      {feature.iconSvg}
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg sm:text-xl text-[#172D3A] group-hover:text-[#168C83] transition-colors">
                        {feature.title}
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-[#344C59] leading-relaxed font-normal">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#DCE6E9]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647C89] block">
                      Engineering Capabilities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#344C59]">
                      {feature.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 font-normal">
                          <span className="text-[#168C83] font-semibold">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={feature.href}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      feature.buttonVariant === "primary"
                        ? "bg-[#126D66] text-white shadow-cool hover:bg-[#0E544F] hover:shadow-lift"
                        : "border border-[#DCE6E9] bg-[#F6F9FA] text-[#344C59] hover:bg-white hover:text-[#172D3A] hover:border-[#C6D5DA]"
                    }`}
                  >
                    <span>{feature.buttonText}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
