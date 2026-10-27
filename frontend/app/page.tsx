"use client";

import { useState } from "react";
import Link from "next/link";
import CausalFlowchart from "@/components/visuals/CausalFlowchart";
import InfrastructureCrossSectionViewer from "@/components/visuals/InfrastructureCrossSectionViewer";
import HydrologicalConventionsModal from "@/components/visuals/HydrologicalConventionsModal";
import GatewayTransitionLink from "@/components/auth/GatewayTransitionLink";

interface Scenario {
  id: string;
  nameA: string;
  wardA: string;
  nameB: string;
  wardB: string;
  similarity: number;
  primaryMechanism: string;
  confidence: number;
  verdict: string;
  rainfallDiff: string;
  drainageDiff: string;
  demDiff: string;
  imperviousDiff: string;
  summary: string;
}

const DEMO_SCENARIOS: Scenario[] = [
  {
    id: "anna-nagar-velachery",
    nameA: "Anna Nagar",
    wardA: "Ward 101",
    nameB: "Velachery",
    wardB: "Ward 102",
    similarity: 83.2,
    primaryMechanism: "Downstream SWD Backwater & Outfall Congestion",
    confidence: 88,
    verdict: "DEFENSIBLE",
    rainfallDiff: "+2.1% (Near-Identical Cloudburst)",
    drainageDiff: "-38% Effective Outfall Gradient",
    demDiff: "-1.4m Micro-depression Basin",
    imperviousDiff: "+14% Built-up Impervious Surface",
    summary:
      "Despite experiencing virtually identical cloudburst rainfall (390mm vs 382mm), Anna Nagar inundated due to downstream stormwater drain backwater stagnation and a local elevation depression.",
  },
  {
    id: "t-nagar-adyar",
    nameA: "T Nagar",
    wardA: "Ward 104",
    nameB: "Adyar",
    wardB: "Ward 103",
    similarity: 91.1,
    primaryMechanism: "Conduit Diameter Inadequacy & Overland Runoff",
    confidence: 94,
    verdict: "DEFENSIBLE",
    rainfallDiff: "0.0% (Identical Sub-basin Storm)",
    drainageDiff: "-46% Pipe Cross-sectional Area",
    demDiff: "+0.8m HAND Elevation Discrepancy",
    imperviousDiff: "+22% Commercial Paved Fraction",
    summary:
      "T Nagar's high impervious commercial density overwhelmed older masonry SWD conduits, whereas Adyar's proximate tidal river canal accepted high discharge with minimal backflow.",
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does differential twin catchment analysis isolate civil failure points?",
    answer:
      "Traditional models treat rainfall volume as the sole driver. By pairing a severely flooded catchment with a resilient control ward that experienced identical radar-verified cloudburst rainfall (±3%), meteorological variance is neutralized. Any remaining divergence in ponding depth is mathematically attributed to physical constraints: pipe invert gradient, cross-sectional choking, or outfall tidal locking.",
  },
  {
    question: "Why did Anna Nagar flood 1.4m while Velachery drained under recent extreme monsoons (Cyclone Michaung)?",
    answer:
      "Both areas received extreme rainfall (over 400mm during Cyclone Michaung). However, Anna Nagar suffered from downstream stormwater drain (SWD) backwater congestion along the Otteri Nullah canal, exacerbated by a -1.4m micro-depression sink. Velachery, despite low elevation, had unobstructed trunk channels accepting storm intake at higher gravitational velocity.",
  },
  {
    question: "What physical formulas govern the causal directed acyclic graph (DAG)?",
    answer:
      "The system couples the Rational Runoff Method (Q = C·I·A) for surface generation, Manning's Equation (Q = (1/n)·A·R^(2/3)·S^(1/2)) for conduit hydraulic capacity, and the Gradually Varied Flow (GVF) backwater differential equation (dy/dx = (S0 - Sf)/(1 - Fr²)) to predict reverse surcharge pressure through manholes.",
  },
  {
    question: "What spatial datasets are ingested into the Greater Chennai Corporation grid?",
    answer:
      "FloodLens integrates Copernicus DEM GLO-30 digital elevation contours, GCC 2023 GIS SWD conduit geometry, ESA WorldCover 10m normalized land cover, and ground-truth verified GCC flood survey records spanning 2023 Cyclone Michaung, 2021, and historical events.",
  },
  {
    question: "Can civil engineers simulate hypothetical interventions in real time?",
    answer:
      "Yes. In both the Causal Flowchart and Ward Diagnosis, engineers can adjust conduit desilting percentages, retrofitted pipe cross-sections, tide flap-gates, or bioswale infiltration fractions to observe projected decreases in ponding depth and duration.",
  },
];

export default function LandingPage() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(DEMO_SCENARIOS[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isConventionsOpen, setIsConventionsOpen] = useState<boolean>(false);

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* 1. HERO SECTION WITH SATELLITE DEM GRAPHIC */}
      <section id="overview" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 scroll-mt-28">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Headline with FadeInUp */}
          <h1 className="animate-fadeInUp stagger-1 font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#221B15] leading-[1.08] transition-all">
            Why did your street flood when the{" "}
            <span className="italic text-terracotta-600 font-normal hover:text-terracotta-700 transition-colors duration-300">
              next ward didn&apos;t?
            </span>
          </h1>

          {/* Subtitle with FadeInUp */}
          <p className="animate-fadeInUp stagger-2 text-base sm:text-xl text-[#554638] leading-relaxed max-w-3xl font-medium">
            Conventional flood maps only show water depth. <strong className="text-[#221B15] font-semibold">FloodLens</strong> diagnoses the physical failure mechanism—pairing inundated catchments with resilient twin wards across elevation gradients, stormwater drain conduits, and imperviousness.
          </p>

          {/* CTAs with Smooth Gateway Transitions */}
          <div className="animate-fadeInUp stagger-3 flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
            <GatewayTransitionLink
              href="/investigations/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-terracotta-600 px-8 py-4 text-sm font-bold text-white shadow-warm hover:bg-terracotta-700 hover:shadow-lift hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 transform cursor-pointer"
            >
              <span>Run Ward Diagnosis</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </GatewayTransitionLink>

            <GatewayTransitionLink
              href="/hub"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] hover:border-terracotta-400 hover:scale-[1.02] active:scale-[0.99] px-8 py-4 text-sm font-bold text-[#3A2F25] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Explore Feature Hub</span>
              <svg className="h-4 w-4 text-terracotta-600 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </GatewayTransitionLink>
          </div>
        </div>

        {/* HERO SATELLITE DEM IMAGE BANNER WITH OVERLAYS */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E8DFD3] bg-white shadow-lift card-hover-effect">
          <div className="relative aspect-[16/9] w-full overflow-hidden group">
            <img
              src="/images/chennai-catchment-map.jpg"
              alt="Chennai Coastal City & Drainage Basins Topography"
              className="h-full w-full object-cover img-zoom"
            />
            {/* Architectural overlay badge top-left */}
            <div className="absolute top-5 left-5 rounded-2xl border border-[#E8DFD3]/80 bg-white/95 px-4 py-2.5 shadow-card backdrop-blur-md space-y-0.5 hover:bg-white transition-all duration-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700 block">
                Topographic Survey & Drainage Basin Datum
              </span>
              <span className="font-serif font-bold text-sm text-[#221B15] block">
                Greater Chennai Corporation Hydrological Grid
              </span>
            </div>

            {/* Quick telemetry chips bottom */}
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8DFD3]/90 bg-white/95 p-4 shadow-card backdrop-blur-md text-xs font-semibold">
              <div className="flex items-center gap-2 text-[#221B15]">
                <span className="h-2.5 w-2.5 rounded-full bg-terracotta-600" />
                <span>Major River Systems: Cooum, Adyar & Buckingham Canal</span>
              </div>
              <div className="flex items-center gap-2 text-[#554638]">
                <span>Reservoir Buffer: Red Hills & Chembarambakkam Lake</span>
              </div>
              <Link
                href="/investigations/new"
                className="font-bold text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1.5 hover:underline transition-all"
              >
                <span>Select Hotspot on Map →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Banner with Hover Transitions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-card card-hover-effect group">
            <div className="font-serif text-3xl font-bold text-terracotta-600 group-hover:scale-105 transition-transform duration-300 origin-left">4 Wards</div>
            <div className="text-xs font-semibold text-[#756350]">Calibrated Urban Basins</div>
          </div>
          <div className="space-y-1 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-card card-hover-effect group">
            <div className="font-serif text-3xl font-bold text-sage-600 group-hover:scale-105 transition-transform duration-300 origin-left">100+</div>
            <div className="text-xs font-semibold text-[#756350]">2023 &amp; Recent Flood Markers</div>
          </div>
          <div className="space-y-1 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-card card-hover-effect group">
            <div className="font-serif text-3xl font-bold text-[#554638] group-hover:scale-105 transition-transform duration-300 origin-left">6 Vectors</div>
            <div className="text-xs font-semibold text-[#756350]">DEM, HAND, SWD, Impervious</div>
          </div>
          <div className="space-y-1 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-card card-hover-effect group">
            <div className="font-serif text-3xl font-bold text-[#221B15] flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-300 origin-left">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              &lt;200ms
            </div>
            <div className="text-xs font-semibold text-[#756350]">Causal Formulation Engine</div>
          </div>
        </div>
      </section>

      {/* 2. DUAL 3D ARCHITECTURAL CROSS-SECTION DIAGRAM WITH INTERACTIVE MARKINGS */}
      <section id="infrastructure" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-28">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
            Physical Infrastructure Cross-Section
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#221B15]">
            Flooding Block vs Resilient Twin Block
          </h2>
          <p className="text-base text-[#554638] leading-relaxed">
            See the exact underground mechanism: An identical cloudburst floods Block A due to conduit silt buildup and catch basin backwater, while Block B discharges smoothly via functional outfall slope. Click any pin or marking to inspect citizen-friendly details.
          </p>
        </div>

        {/* Interactive Cross-Section Viewer with clickable pins and citizen modal */}
        <InfrastructureCrossSectionViewer />

        {/* OPTIONAL CONVENTIONS & FORMULAS FEATURE BANNER */}
        <div className="rounded-3xl border border-terracotta-200 bg-gradient-to-r from-terracotta-50/90 via-[#FAF7F2] to-amber-50/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-warm transition-all duration-300">
          <div className="space-y-1.5 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-terracotta-800">
              <span className="h-2 w-2 rounded-full bg-terracotta-600" />
              <span>Hydrological Reference &amp; Civil Engineering Standards</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#221B15]">
              Want to decode the technical conventions &amp; physics formulas?
            </h3>
            <p className="text-xs sm:text-sm text-[#554638] leading-relaxed">
              Explore the full interactive field reference: Rational Method, Manning&apos;s formula, Gradually Varied Flow backwater, and visual box architecture with details on demand.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsConventionsOpen(true)}
            className="rounded-2xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm hover:bg-terracotta-700 hover:shadow-lift transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 transform hover:scale-102 active:scale-98"
          >
            <span>📘 View Conventions &amp; Physics</span>
            <span className="font-mono">→</span>
          </button>
        </div>
      </section>

      {/* 3. INTERACTIVE ANIMATED REALISTIC CAUSAL FLOWCHART */}
      <section id="flowchart" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-28">
        <CausalFlowchart />
      </section>

      {/* 4. INTERACTIVE SIMULATOR SHOWCASE */}
      <section id="simulator" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-28">
        <div className="rounded-3xl border border-[#E8DFD3] bg-white p-8 sm:p-12 shadow-card space-y-10 card-hover-effect">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E8DFD3]">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
                Interactive Twin Catchment Simulator
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221B15]">
                Differential Diagnosis in Action
              </h2>
              <p className="text-sm text-[#554638]">
                Toggle calibrated urban twin scenarios to see how differential spatial analysis eliminates rainfall confounds to diagnose exact structural bottlenecks.
              </p>
            </div>

            {/* Scenario Switcher Tabs with Smooth Transitions */}
            <div className="flex flex-wrap gap-3">
              {DEMO_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveScenario(s)}
                  className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all duration-300 transform active:scale-95 flex items-center gap-2.5 cursor-pointer ${
                    activeScenario.id === s.id
                      ? "bg-terracotta-600 text-white shadow-warm -translate-y-0.5"
                      : "bg-[#FAF7F2] border border-[#E0D5C7] text-[#554638] hover:border-[#D5C6B3] hover:text-[#221B15] hover:bg-white"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${activeScenario.id === s.id ? "bg-white" : "bg-terracotta-500"}`} />
                  <span>{s.nameA} vs {s.nameB}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Display Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side: Differential Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFD3]">
                <div className="space-y-1.5">
                  <div className="text-xs uppercase tracking-wider font-bold text-[#756350] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-terracotta-600" />
                    <span>Comparative Twin Catchment Axis</span>
                  </div>
                  
                  {/* Two wards side by side, with Ward codes cleanly aligned directly underneath each name */}
                  <div className="flex items-center gap-4 sm:gap-6 pt-1">
                    {/* Inundated Ward A (Red) */}
                    <div>
                      <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C23E2A] tracking-tight">
                        {activeScenario.nameA}
                      </div>
                      <div className="text-xs font-bold text-[#8C2314] font-mono tracking-wide mt-0.5">
                        ({activeScenario.wardA})
                      </div>
                    </div>

                    {/* vs separator */}
                    <div className="text-base sm:text-lg font-serif italic text-[#9E8B75] pb-4">
                      vs
                    </div>

                    {/* Resilient Twin Ward B (Green) - Ward 102 appears directly below Velachery */}
                    <div>
                      <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3B8352] tracking-tight">
                        {activeScenario.nameB}
                      </div>
                      <div className="text-xs font-bold text-[#235836] font-mono tracking-wide mt-0.5">
                        ({activeScenario.wardB})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Twin Fitness Badge with proper vertical alignment and clean padding */}
                <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50/90 px-5 py-3 text-right shadow-xs shrink-0 self-start sm:self-center">
                  <div className="text-[10px] font-bold text-terracotta-800 uppercase tracking-wider">
                    Twin Fitness
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-black text-terracotta-700">
                    {activeScenario.similarity}%
                  </div>
                </div>
              </div>

              {/* Explanatory Callout */}
              <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-6 space-y-2 transition-all duration-300 hover:border-terracotta-200 hover:bg-[#FFFDFB]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-terracotta-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-terracotta-800">
                    Causal Diagnosis Finding
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#433830] transition-opacity duration-300">
                  {activeScenario.summary}
                </p>
              </div>

              {/* 4 Differential Meters with Hover Transitions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-1 hover:bg-white hover:border-[#D5C6B3] hover:shadow-sm transition-all duration-300">
                  <div className="text-xs font-bold text-[#756350]">🌧️ Rainfall Differential</div>
                  <div className="font-mono text-sm font-bold text-[#221B15]">{activeScenario.rainfallDiff}</div>
                  <div className="text-[11px] text-[#9E8B75]">Storm forcing neutralized</div>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 space-y-1 hover:bg-red-50 hover:border-red-300 hover:shadow-sm transition-all duration-300">
                  <div className="text-xs font-bold text-[#C23E2A]">🚰 SWD Drain Conduit Capacity</div>
                  <div className="font-mono text-sm font-bold text-[#C23E2A]">{activeScenario.drainageDiff}</div>
                  <div className="text-[11px] text-[#9E8B75]">Primary structural constraint</div>
                </div>
                <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-1 hover:bg-white hover:border-[#D5C6B3] hover:shadow-sm transition-all duration-300">
                  <div className="text-xs font-bold text-[#756350]">⛰️ DEM Elevation Gradient</div>
                  <div className="font-mono text-sm font-bold text-amber-800">{activeScenario.demDiff}</div>
                  <div className="text-[11px] text-[#9E8B75]">Micro-depression ponding</div>
                </div>
                <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-1 hover:bg-white hover:border-[#D5C6B3] hover:shadow-sm transition-all duration-300">
                  <div className="text-xs font-bold text-[#756350]">🏙️ Urban Impervious Cover</div>
                  <div className="font-mono text-sm font-bold text-terracotta-700">{activeScenario.imperviousDiff}</div>
                  <div className="text-[11px] text-[#9E8B75]">Loss of natural infiltration</div>
                </div>
              </div>
            </div>

            {/* Right side: Causal Ranking Card Preview with Transitions */}
            <div className="lg:col-span-5 rounded-3xl border border-[#E8DFD3] bg-[#FAF7F2] p-7 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#756350]">
                  Synthesized Mechanism Ranking
                </span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-800 transition-all duration-300">
                  {activeScenario.verdict}
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="rounded-2xl border-2 border-terracotta-200 bg-white p-5 space-y-2.5 shadow-sm hover:border-terracotta-400 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700">Rank #1 Primary Driver</span>
                    <span className="font-mono text-xs font-bold text-terracotta-800">{activeScenario.confidence}% Confidence</span>
                  </div>
                  <div className="font-bold text-[#221B15] text-sm">{activeScenario.primaryMechanism}</div>
                  <div className="h-2 w-full rounded-full bg-[#E0D5C7] overflow-hidden">
                    <div className="h-full rounded-full bg-terracotta-600 transition-all duration-700 ease-out" style={{ width: `${activeScenario.confidence}%` }} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8DFD3] bg-white p-4 space-y-1.5 opacity-75 hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#221B15]">Rank #2 Surface Infiltration Exhaustion</span>
                    <span className="font-mono text-[#756350]">62% Confidence</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8DFD3] bg-white p-4 space-y-1.5 opacity-55 hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#221B15]">Rank #3 Secondary Canal Tidal Hold</span>
                    <span className="font-mono text-[#756350]">31% Confidence</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/investigations/new?pair=${activeScenario.id}`}
                className="w-full rounded-2xl bg-white border border-[#E0D5C7] hover:border-terracotta-400 hover:bg-terracotta-50 hover:shadow-warm px-5 py-3.5 text-xs font-bold text-[#221B15] flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-sm group"
              >
                <span>Run Ward Diagnosis for This Pair</span>
                <svg className="h-4 w-4 text-terracotta-600 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQS SECTION WITH ACCORDION TRANSITIONS */}
      <section id="faqs" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-28">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
            Methodology &amp; Hydrological FAQ
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#221B15]">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-[#554638]">
            Understand how differential spatial twin formulation isolates structural civil failure points.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-[#E8DFD3] bg-white overflow-hidden shadow-card transition-all duration-300 hover:border-terracotta-300 hover:shadow-warm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors duration-200 cursor-pointer"
                >
                  <span className="font-serif font-bold text-base sm:text-lg text-[#221B15]">
                    {faq.question}
                  </span>
                  <span className={`h-8 w-8 rounded-full border border-[#E0D5C7] flex items-center justify-center shrink-0 transition-transform duration-300 ease-in-out ${
                    isOpen ? "rotate-180 bg-terracotta-50 text-terracotta-700 border-terracotta-200" : "bg-[#FAF7F2] text-[#756350]"
                  }`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 text-sm text-[#554638] leading-relaxed border-t border-[#F0E8DD]">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FINAL INVITATION CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-terracotta-200 bg-gradient-to-br from-[#FDF5F0] via-[#FAF7F2] to-[#F5EFE6] p-10 sm:p-16 text-center space-y-6 shadow-card card-hover-effect">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#221B15] max-w-2xl mx-auto leading-tight">
            Ready to diagnose Chennai&apos;s urban catchment vulnerabilities?
          </h2>
          <p className="text-[#554638] max-w-xl mx-auto text-base leading-relaxed">
            Access the diagnostic matrix, compare monitored wards, and generate causal evidence reports in seconds.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/investigations/new"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-terracotta-600 px-9 py-4 text-sm font-bold text-white shadow-warm hover:bg-terracotta-700 hover:shadow-lift hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 transform cursor-pointer group"
            >
              <span>Run Ward Diagnosis</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] hover:border-terracotta-400 hover:scale-[1.02] active:scale-[0.99] px-8 py-4 text-sm font-bold text-[#3A2F25] transition-all duration-300 shadow-sm cursor-pointer"
            >
              <span>Open Feature Hub</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Hydrological Conventions Modal */}
      <HydrologicalConventionsModal
        isOpen={isConventionsOpen}
        onClose={() => setIsConventionsOpen(false)}
      />
    </div>
  );
}
