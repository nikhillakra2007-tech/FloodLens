"use client";

import { useState } from "react";
import Link from "next/link";

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
  {
    id: "mylapore-foreshore",
    nameA: "Mylapore",
    wardA: "Ward 124",
    nameB: "Foreshore Estate",
    wardB: "Ward 125",
    similarity: 87.5,
    primaryMechanism: "Buckingham Canal Tidal Surge Lock & Flap Gate Surcharge",
    confidence: 91,
    verdict: "DEFENSIBLE",
    rainfallDiff: "-1.2% (Coastal Convective Cell)",
    drainageDiff: "-52% Gravitational Outfall Velocity",
    demDiff: "+0.3m Distance to Coastal Margin",
    imperviousDiff: "+18% Built-up Fraction",
    summary:
      "Mylapore's primary stormwater outfall was hydraulically locked by Buckingham Canal tidal surge height, forcing floodwaters upward through roadside inlets, whereas Foreshore Estate discharged into coastal dunes with active drainage.",
  },
];

export default function SimulatorPage() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(DEMO_SCENARIOS[0]);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#554638] hover:text-terracotta-700 bg-white border border-[#E0D5C7] rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow-warm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Portal Hub</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/flowchart"
            className="text-xs font-bold text-[#756350] hover:text-[#221B15] bg-[#F5EFE6] px-3.5 py-1.5 rounded-xl transition-all"
          >
            ← Causal Flowchart
          </Link>
          <Link
            href="/investigations/new"
            className="text-xs font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 px-4 py-1.5 rounded-xl transition-all shadow-warm"
          >
            Launch Investigation →
          </Link>
        </div>
      </div>

      {/* Simulator Workspace */}
      <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-10 shadow-card space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E8DFD3]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
              Differential Urban Twin Catchment Simulator
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#221B15]">
              Differential Diagnosis in Action
            </h1>
            <p className="text-sm text-[#554638] leading-relaxed">
              Toggle calibrated urban twin scenarios to see how differential spatial analysis eliminates rainfall confounds to isolate exact structural hydraulic bottlenecks.
            </p>
          </div>

          {/* Scenario Switcher Tabs */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#756350] block">
              Calibrated Twin Pairs:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {DEMO_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveScenario(s)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeScenario.id === s.id
                      ? "bg-terracotta-600 text-white shadow-warm"
                      : "bg-[#FAF7F2] border border-[#E0D5C7] text-[#554638] hover:border-[#D5C6B3] hover:text-[#221B15]"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${activeScenario.id === s.id ? "bg-white" : "bg-terracotta-500"}`} />
                  <span>{s.nameA} vs {s.nameB}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulator Display Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left side: Differential Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-[#756350]">Comparative Axis</div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#221B15] mt-1">
                  <span className="text-[#C23E2A]">{activeScenario.nameA}</span> ({activeScenario.wardA}){" "}
                  <span className="text-[#9E8B75] font-normal text-lg italic">vs</span>{" "}
                  <span className="text-[#3B8352]">{activeScenario.nameB}</span> ({activeScenario.wardB})
                </div>
              </div>
              <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50 px-5 py-2.5 text-right">
                <div className="text-[10px] font-bold text-terracotta-800 uppercase tracking-wider">Twin Fitness</div>
                <div className="font-mono text-2xl font-black text-terracotta-700">{activeScenario.similarity}%</div>
              </div>
            </div>

            {/* Explanatory Callout */}
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-terracotta-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta-800">
                  Causal Diagnosis Finding
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#433830]">
                {activeScenario.summary}
              </p>
            </div>

            {/* 4 Differential Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-1">
                <div className="text-xs font-bold text-[#756350]">🌧️ Rainfall Differential</div>
                <div className="font-mono text-sm font-bold text-[#221B15]">{activeScenario.rainfallDiff}</div>
                <div className="text-[11px] text-[#9E8B75]">Storm forcing neutralized</div>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 space-y-1">
                <div className="text-xs font-bold text-[#C23E2A]">🚰 SWD Drain Conduit Capacity</div>
                <div className="font-mono text-sm font-bold text-[#C23E2A]">{activeScenario.drainageDiff}</div>
                <div className="text-[11px] text-[#9E8B75]">Primary structural constraint</div>
              </div>
              <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-1">
                <div className="text-xs font-bold text-[#756350]">⛰️ DEM Elevation Gradient</div>
                <div className="font-mono text-sm font-bold text-amber-800">{activeScenario.demDiff}</div>
                <div className="text-[11px] text-[#9E8B75]">Micro-depression ponding</div>
              </div>
              <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 space-y-1">
                <div className="text-xs font-bold text-[#756350]">🏙️ Urban Impervious Cover</div>
                <div className="font-mono text-sm font-bold text-terracotta-700">{activeScenario.imperviousDiff}</div>
                <div className="text-[11px] text-[#9E8B75]">Loss of natural infiltration</div>
              </div>
            </div>
          </div>

          {/* Right side: Causal Ranking Card Preview */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E8DFD3] bg-[#FAF7F2] p-7 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#756350]">
                Synthesized Mechanism Ranking
              </span>
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-800">
                {activeScenario.verdict}
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="rounded-2xl border-2 border-terracotta-200 bg-white p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700">Rank #1 Primary Driver</span>
                  <span className="font-mono text-xs font-bold text-terracotta-800">{activeScenario.confidence}% Confidence</span>
                </div>
                <div className="font-bold text-[#221B15] text-sm">{activeScenario.primaryMechanism}</div>
                <div className="h-2 w-full rounded-full bg-[#E0D5C7] overflow-hidden">
                  <div className="h-full rounded-full bg-terracotta-600" style={{ width: `${activeScenario.confidence}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8DFD3] bg-white p-4 space-y-1.5 opacity-80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#221B15]">Rank #2 Surface Infiltration Exhaustion</span>
                  <span className="font-mono text-[#756350]">62% Confidence</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8DFD3] bg-white p-4 space-y-1.5 opacity-60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#221B15]">Rank #3 Secondary Canal Tidal Hold</span>
                  <span className="font-mono text-[#756350]">31% Confidence</span>
                </div>
              </div>
            </div>

            <Link
              href="/investigations/new"
              className="w-full rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 px-5 py-4 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-warm hover:shadow-lift"
            >
              <span>Launch Full Diagnostic Console for This Pair</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
