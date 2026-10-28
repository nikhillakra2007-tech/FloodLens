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
  const { experienceMode, setExperienceMode } = useAuth();
  const [selectedCitizenWard, setSelectedCitizenWard] = useState<CitizenWardInfo>(CITIZEN_WARDS[0]);

  const technicalFeatures: FeaturePortal[] = [
    {
      id: "flowchart",
      href: "/flowchart",
      title: "Causal DAG & Flowchart Engine",
      category: "Hydrological Physics Simulator",
      badge: "Real Physics Engine",
      badgeColor: "bg-terracotta-100 text-terracotta-800 border-terracotta-200",
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
        <svg className="h-6 w-6 text-terracotta-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      badgeColor: "bg-sage-100 text-sage-800 border-sage-200",
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
        <svg className="h-6 w-6 text-sage-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
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
        <svg className="h-6 w-6 text-terracotta-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      badgeColor: "bg-[#F5EFE6] text-[#554638] border-[#E0D5C7]",
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
        <svg className="h-6 w-6 text-[#554638]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      {/* Dynamic Header with Role State & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E8DFD3]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
              <span className={`h-2 w-2 rounded-full ${isCitizenMode ? "bg-terracotta-600" : "bg-amber-600"}`} />
              <span>{isCitizenMode ? "Citizen Resident Portal" : "Hydrological Engineering Hub"}</span>
            </span>
            <span className="font-mono text-xs text-[#756350] bg-white border border-[#E8DFD3] px-2.5 py-0.5 rounded-lg">
              Greater Chennai Grid
            </span>
          </div>

          <h1 className="font-bold text-2xl sm:text-4xl text-[#221B15] tracking-tight">
            {isCitizenMode
              ? "Understand Your Ward's Flood Risk & Practical Precautions"
              : "Hydrological Intelligence & Diagnostic Workspaces"}
          </h1>

          <p className="text-sm sm:text-base text-[#554638] leading-relaxed max-w-2xl">
            {isCitizenMode
              ? "Simple, verified insights for Chennai residents. See why your neighborhood flooded or stayed safe, and explore practical safety steps."
              : "Full mathematical models, differential twin-catchment formulation, Manning conduit equations, and causal DAG diagnostic tools."}
          </p>
        </div>

        {/* Mode Switcher Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setExperienceMode(isCitizenMode ? "technical" : "citizen")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] hover:border-terracotta-400 px-4 py-2.5 text-xs font-bold text-[#554638] hover:text-[#221B15] transition-all shadow-xs cursor-pointer"
          >
            <span>{isCitizenMode ? "📐 Switch to Technical Engineering Mode" : "🏘️ Switch to Citizen Mode"}</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#554638] hover:text-[#221B15] bg-[#F5EFE6] px-4 py-2.5 rounded-xl transition-all"
          >
            <span>← Landing Overview</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* EXPERIENCE 1: CITIZEN RESIDENT EXPERIENCE                     */}
      {/* ============================================================== */}
      {isCitizenMode ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Ward Selection Row */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#756350] block">
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
                        ? "border-terracotta-500 bg-white shadow-warm ring-2 ring-terracotta-200"
                        : "border-[#E8DFD3] bg-[#FAF7F2] hover:bg-white hover:border-[#D5C6B3]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#221B15]">{ward.wardName}</span>
                      <span className="font-mono text-[10px] text-[#756350]">{ward.wardNumber}</span>
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
                      <span className="text-[11px] font-semibold text-[#554638] line-clamp-1">
                        {ward.status === "vulnerable" ? "Silt Backwater Risk" : ward.status === "moderate" ? "Canal Dependent" : "Resilient Drainage"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focused Ward Information Panel */}
          <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFD3]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-xl sm:text-2xl text-[#221B15]">
                    {selectedCitizenWard.wardName} ({selectedCitizenWard.wardNumber})
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
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
                <p className="text-xs sm:text-sm text-[#554638] mt-1">
                  {selectedCitizenWard.summary}
                </p>
              </div>

              <Link
                href="/investigations/new"
                className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-700 hover:text-terracotta-800 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 px-3.5 py-2 rounded-xl transition-colors"
              >
                <span>View on Geospatial Map →</span>
              </Link>
            </div>

            {/* 3 Plain-Language Information Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1: Plain Language Explanation */}
              <div className="rounded-2xl border border-[#E5DDD0] bg-[#FAF7F2] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta-700">
                  <span>💡</span>
                  <span>Why Did This Happen?</span>
                </div>
                <p className="text-xs sm:text-sm text-[#3A2F25] leading-relaxed">
                  {selectedCitizenWard.whyItHappened}
                </p>
              </div>

              {/* Pillar 2: Recommended Resident Action */}
              <div className="rounded-2xl border border-[#E5DDD0] bg-[#FAF7F2] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#554638]">
                  <span>🛠️</span>
                  <span>Recommended Resident Action</span>
                </div>
                <p className="text-xs sm:text-sm text-[#3A2F25] leading-relaxed">
                  {selectedCitizenWard.recommendedAction}
                </p>
              </div>

              {/* Pillar 3: Safety & Emergency Advice */}
              <div className="rounded-2xl border border-[#E5DDD0] bg-[#FAF7F2] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <span>🛡️</span>
                  <span>Monsoon Safety Advice</span>
                </div>
                <p className="text-xs sm:text-sm text-[#3A2F25] leading-relaxed">
                  {selectedCitizenWard.safetyAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Official Helplines & Emergency Advisory Card */}
          <div className="rounded-3xl border border-terracotta-200 bg-gradient-to-br from-[#FDF5F0] via-white to-amber-50/50 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-terracotta-600 text-white text-xs font-bold">
                ☎️
              </span>
              <h3 className="font-bold text-base text-[#221B15]">
                Verified Greater Chennai Corporation Civil Helplines
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="rounded-xl border border-terracotta-200 bg-white p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#756350] block">
                  GCC 24/7 Citizen Helpline
                </span>
                <span className="font-mono text-2xl font-bold text-terracotta-700 block">1913</span>
                <span className="text-[11px] text-[#554638]">Toll-free emergency &amp; water-logging support</span>
              </div>

              <div className="rounded-xl border border-[#E0D5C7] bg-white p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#756350] block">
                  State Disaster Control Room
                </span>
                <span className="font-mono text-xl font-bold text-[#221B15] block">1070</span>
                <span className="text-[11px] text-[#554638]">Tamil Nadu State Disaster Management Authority</span>
              </div>

              <div className="rounded-xl border border-[#E0D5C7] bg-white p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#756350] block">
                  District Operations Centre
                </span>
                <span className="font-mono text-xl font-bold text-[#221B15] block">1077</span>
                <span className="text-[11px] text-[#554638]">Chennai District Collectorate Control</span>
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700 text-white font-bold shrink-0">
                📐
              </span>
              <div>
                <span className="font-bold text-[#221B15] block font-sans text-sm">
                  Physical Hydro-Mechanic Formulations Active:
                </span>
                <span className="text-[#554638] text-[11px]">
                  Manning Q = (1/n)·A·R^(2/3)·S^(1/2) • Rational Q = CIA • GVF dy/dx = (S0 - Sf)/(1 - Fr²)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <span className="rounded-md bg-white border border-amber-300 px-2 py-1 text-[11px] text-amber-900 font-semibold">
                Copernicus GLO-30 DEM
              </span>
              <span className="rounded-md bg-white border border-amber-300 px-2 py-1 text-[11px] text-amber-900 font-semibold">
                GCC SWD GIS Vector
              </span>
            </div>
          </div>

          {/* 4 Technical Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalFeatures.map((feature) => (
              <div
                key={feature.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#E8DFD3] bg-white p-7 sm:p-8 shadow-card hover:shadow-lift hover:border-[#D5C6B3] transition-all duration-300"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#756350]">
                      {feature.category}
                    </span>
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] shadow-xs group-hover:scale-105 transition-transform duration-200">
                      {feature.iconSvg}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg sm:text-xl text-[#221B15] group-hover:text-terracotta-700 transition-colors">
                        {feature.title}
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-[#554638] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#F0E8DD]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#756350] block">
                      Engineering Capabilities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#554638]">
                      {feature.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-terracotta-600 font-bold">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={feature.href}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                      feature.buttonVariant === "primary"
                        ? "bg-terracotta-600 text-white shadow-warm hover:bg-terracotta-700 hover:shadow-lift"
                        : "border border-[#E0D5C7] bg-[#FAF7F2] text-[#554638] hover:bg-white hover:text-[#221B15] hover:border-[#D5C6B3]"
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
