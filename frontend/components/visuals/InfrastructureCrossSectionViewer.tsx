"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface TechnicalTerm {
  id: string;
  name: string;
  block: "failure" | "resilient";
  shortTag: string;
  plainEnglish: string;
  neighborhoodExample: string;
  mechanism: string;
  engineeringFix: string;
  icon: string;
}

const TECHNICAL_TERMS: TechnicalTerm[] = [
  {
    id: "pipe-choked",
    name: "Underground Conduit Pipe (Choked)",
    block: "failure",
    shortTag: "Subsurface Conduit",
    icon: "🚇",
    plainEnglish:
      "The large reinforced concrete trunk pipe (usually 900mm to 1200mm diameter) buried 2 to 4 meters under your street. In Block A, this pipe is packed with hard silt, plastic debris, and construction mortar, reducing its open drain cross-section by over half.",
    neighborhoodExample:
      "In Anna Nagar (Ward 101) during Cyclone Michaung (2023) and recent monsoons, CCTV camera rovers discovered up to 58% hardened silt bed sedimentation inside the trunk lines beneath 100-Feet Road, choking gravity velocity to a trickle.",
    mechanism:
      "Manning's formula shows discharge capacity Q drops with the 2/3 power of hydraulic radius. Cutting open cross-section area in half cuts water carrying volume by nearly 70%.",
    engineeringFix:
      "High-pressure hydraulic jetting and motorized rotary bucket desilting machines to scour out hardened silt before monsoon rains arrive.",
  },
  {
    id: "pipe-clean",
    name: "Underground Conduit Pipe (Unobstructed)",
    block: "resilient",
    shortTag: "Subsurface Conduit",
    icon: "💧",
    plainEnglish:
      "The exact same size underground drainage pipe, but kept 100% clean and free of silt and construction debris. Rainwater rushes through smoothly like an empty subterranean highway directly toward the canal.",
    neighborhoodExample:
      "In Velachery (Ward 102), desilted trunk conduits maintained an unchoked 1000mm diameter cross-section, safely conveying over 11 cubic meters of water per second straight into the Pallikaranai marshland canal.",
    mechanism:
      "Full circular pipe invert area allows laminar gravity flow, avoiding turbid bottlenecks and maintaining design velocity above 1.5 m/s to prevent sediment settling.",
    engineeringFix:
      "Quarterly silt telemetry inspection and installation of trash-rack catch grates at road inlets to stop street plastic from entering the pipe.",
  },
  {
    id: "bottleneck",
    name: "Critical Bottleneck (Debris & Silt Accumulation)",
    block: "failure",
    shortTag: "Hydraulic Restriction",
    icon: "⚠️",
    plainEnglish:
      "A physical plug formed where underground pipes narrow, bend, or cross telecom/water utility cables. Floating road garbage and construction mud settle here, creating a literal cork that traps all upstream water.",
    neighborhoodExample:
      "Junction of 4th Avenue in Anna Nagar where a utility trench cut through the stormwater drain crown, creating a 60% constriction point that triggered 1.4m of road flooding.",
    mechanism:
      "Sudden constriction creates localized head loss (h_L = k·v²/2g) and downstream hydraulic jump, reflecting shockwaves backward through street drain grates.",
    engineeringFix:
      "Enforce utility trench separation laws, straighten 90-degree drain bends, and install silt-trapping sumps before junctions.",
  },
  {
    id: "catch-basin",
    name: "Catch Basin Overflow",
    block: "failure",
    shortTag: "Surface Inversion",
    icon: "🌊",
    plainEnglish:
      "The metal roadside street grates where gutter water is supposed to drop down. When the underground pipe below is full and pressurized, water cannot enter—instead, it pushes upward out of the grate like an open fountain.",
    neighborhoodExample:
      "Residents in T. Nagar observed roadside catch basins spewing muddy water up onto sidewalks 20 minutes after peak cloudburst rain commenced.",
    mechanism:
      "Hydraulic grade line (HGL) rises above the street ground elevation, turning gravity intake into pressurized orifice discharge.",
    engineeringFix:
      "Retrofit one-way check valves (duckbill flap valves) in catch basin drops and build surface swales to hold overflow.",
  },
  {
    id: "elevation-slope",
    name: "Elevation Slope (1.5% Gravity Fall)",
    block: "resilient",
    shortTag: "Topographic Gradient",
    icon: "📐",
    plainEnglish:
      "The natural or engineered downward tilt of the street and pipe invert. A 1.5% slope means the pipe drops 1.5 meters for every 100 meters of horizontal distance, giving rainwater natural gravity momentum.",
    neighborhoodExample:
      "Ward 103 (Adyar ridge) benefits from natural gentle topography falling toward the Adyar riverbed, maintaining self-cleansing water velocity.",
    mechanism:
      "Positive bed slope (S_0 > 0.01) keeps Froude number healthy and counteracts downstream tailwater backpressure without requiring expensive diesel pumps.",
    engineeringFix:
      "Survey micro-topography with LIDAR and laser-grade all new stormwater drain box inverts with a guaranteed minimum 0.5% downward slope.",
  },
  {
    id: "functioning-intake",
    name: "Functioning Street Intake",
    block: "resilient",
    shortTag: "Overland Interception",
    icon: "🚰",
    plainEnglish:
      "Continuous roadside curb openings and clear linear slotted grates that swallow street surface runoff before it can pool more than an inch deep on the roadway.",
    neighborhoodExample:
      "Velachery bypass road with continuous 150mm curb opening inlets that swallow peak sheets of road runoff within 90 seconds of hitting asphalt.",
    mechanism:
      "Continuous curb opening grates capture sheet runoff with 95%+ hydraulic efficiency, preventing gutter flow spread onto traffic lanes.",
    engineeringFix:
      "Replace easily choked round hole covers with continuous bicycle-safe longitudinal curb inlet grates.",
  },
  {
    id: "unobstructed-flow",
    name: "Unobstructed Flow & Drainage Pathway",
    block: "resilient",
    shortTag: "Gravity Conveyance",
    icon: "⚡",
    plainEnglish:
      "A clear, uninterrupted direct path from your roof downspout, through roadside gutters, along underground pipes, and directly out into the receiving canal or river.",
    neighborhoodExample:
      "Adyar's primary storm conduits discharge directly into open riverbanks above high tide elevation, draining standing puddles within 30 minutes of rain stopping.",
    mechanism:
      "Subcritical gravity open-channel flow where specific energy is conserved and discharge outlet remains free-flowing above tidal lock.",
    engineeringFix:
      "Regular pre-monsoon drone telemetry inspections and automated canal flap gate maintenance.",
  },
  {
    id: "basement-flooding",
    name: "Basement Flooding Pathway",
    block: "failure",
    shortTag: "Backflow Surcharge",
    icon: "🏠",
    plainEnglish:
      "When street pipes are choked, water seeks the lowest physical point in the neighborhood—subterranean parking lots, basement utility rooms, and lift pits—ruining electrical generators and vehicles.",
    neighborhoodExample:
      "In Anna Nagar, 24 apartment basements submerged up to 2.2 meters within 3 hours during Cyclone Michaung (2023), destroying electrical transformers and water sumps.",
    mechanism:
      "Water pressure head in flooded streets exceeds basement floor elevation; water backs up through sanitary drain traps and ramp driveways.",
    engineeringFix:
      "Mandatory ramp crest thresholds (+0.6m above street crown), backflow check valves on building connections, and dedicated sump pumps.",
  },
];

export default function InfrastructureCrossSectionViewer() {
  const [selectedTerm, setSelectedTerm] = useState<TechnicalTerm | null>(null);
  const [isDiagramExpanded, setIsDiagramExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedTerm) {
          setSelectedTerm(null);
        } else if (isDiagramExpanded) {
          setIsDiagramExpanded(false);
        }
      }
    };
    if (selectedTerm || isDiagramExpanded) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedTerm, isDiagramExpanded]);

  return (
    <div className="space-y-6">
      {/* Visual Diagram Box */}
      {/* Visual Diagram Box */}
      <div className="rounded-3xl border border-[#E8DFD3] bg-white p-4 sm:p-8 shadow-card space-y-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] group">
          <img
            src="/images/drainage-mechanism-diagram.jpg"
            alt="Flooding Urban Block vs Smooth Draining Urban Block Cross-Section"
            className="h-full w-full object-cover cursor-zoom-in"
            onClick={() => {
              setIsDiagramExpanded(true);
              setZoomLevel(1);
            }}
          />

          {/* Expand Full-Screen Button */}
          <button
            type="button"
            onClick={() => {
              setIsDiagramExpanded(true);
              setZoomLevel(1);
            }}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-2xl bg-[#221B15]/85 hover:bg-[#221B15] text-white px-4 py-2.5 text-xs font-bold shadow-lift backdrop-blur-md transition-all border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
            title="Click to expand diagram full-screen"
          >
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>🔍 Click to View Full-Screen (Large)</span>
          </button>

          {/* BLOCK A INTERACTIVE PINS (Left Half - Failure Bottlenecks) */}
          {/* 1. Basement Flooding Pin */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "basement-flooding") || null)}
            className="absolute top-[28%] left-[34%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Basement Flooding"
          >
            <div className="relative flex flex-col items-center">
              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>🏠 Basement Flooding</span>
                <span className="text-red-400 font-mono text-[10px]">Click</span>
              </span>
              {/* Glowing Pulse Halo */}
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  !
                </span>
              </span>
              {/* Directional Leader Arrow pointing down to the basement */}
              <svg className="h-4 w-4 text-red-600 -mt-0.5 filter drop-shadow animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* 2. Catch Basin Overflow Pin */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "catch-basin") || null)}
            className="absolute top-[48%] left-[40%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Catch Basin Overflow"
          >
            <div className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>🌊 Catch Basin Overflow</span>
                <span className="text-red-400 font-mono text-[10px]">Click</span>
              </span>
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  !
                </span>
              </span>
              <svg className="h-4 w-4 text-red-600 -mt-0.5 filter drop-shadow animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* 3. Underground Conduit Pipe (Left - Choked) */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "pipe-choked") || null)}
            className="absolute top-[72%] left-[26%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Underground Conduit Pipe (Choked)"
          >
            <div className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>🚇 Choked Conduit Trunk</span>
                <span className="text-red-400 font-mono text-[10px]">Click</span>
              </span>
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  🚇
                </span>
              </span>
              <svg className="h-4 w-4 text-red-600 -mt-0.5 filter drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* 4. Critical Bottleneck Pin */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "bottleneck") || null)}
            className="absolute top-[68%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Critical Bottleneck"
          >
            <div className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>⚠️ Silt/Debris Bottleneck</span>
                <span className="text-red-400 font-mono text-[10px]">Click</span>
              </span>
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  !
                </span>
              </span>
              <svg className="h-4 w-4 text-red-600 -mt-0.5 filter drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* BLOCK B INTERACTIVE PINS (Right Half - Resilient Infrastructure) */}
          {/* 5. Elevation Slope Pin */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "elevation-slope") || null)}
            className="absolute top-[48%] left-[54%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Elevation Slope (1.5%)"
          >
            <div className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>📐 Elevation Slope (1.5%)</span>
                <span className="text-emerald-400 font-mono text-[10px]">Click</span>
              </span>
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  ✓
                </span>
              </span>
              <svg className="h-4 w-4 text-emerald-600 -mt-0.5 filter drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* 6. Functioning Street Intake Pin */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "functioning-intake") || null)}
            className="absolute top-[56%] left-[66%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Functioning Street Intake"
          >
            <div className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>🚰 Functioning Street Intake</span>
                <span className="text-emerald-400 font-mono text-[10px]">Click</span>
              </span>
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  ✓
                </span>
              </span>
              <svg className="h-4 w-4 text-emerald-600 -mt-0.5 filter drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* 7. Underground Conduit Pipe (Right Side - Unobstructed Flow) */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "pipe-clean") || null)}
            className="absolute top-[74%] left-[74%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Underground Conduit Pipe (Unobstructed Flow)"
          >
            <div className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>🚇 Unobstructed Conduit Pipe</span>
                <span className="text-emerald-400 font-mono text-[10px]">Click</span>
              </span>
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  🚇
                </span>
              </span>
              <svg className="h-4 w-4 text-emerald-600 -mt-0.5 filter drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* 8. Unobstructed Flow Pathway (Canal Discharge Outfall) */}
          <button
            type="button"
            onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "unobstructed-flow") || null)}
            className="absolute top-[70%] left-[86%] -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
            title="Click to inspect: Unobstructed Flow & Drainage Pathway"
          >
            <div className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute bottom-full mb-2 hidden group-hover/pin:flex items-center gap-1 rounded-xl bg-[#221B15] text-white px-2.5 py-1 text-xs font-bold shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                <span>⚡ Unobstructed Gravity Outfall</span>
                <span className="text-emerald-400 font-mono text-[10px]">Click</span>
              </span>
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform">
                  ⚡
                </span>
              </span>
              <svg className="h-4 w-4 text-emerald-600 -mt-0.5 filter drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>

        {/* Interactive Markings & Writings Explorer */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#756350] flex items-center gap-1.5">
              <span>🔍 Click Any Marking Below to Reveal Citizen-Friendly Details &amp; Examples:</span>
            </span>
            <span className="text-[11px] text-[#9E8B75]">
              (Clicking blurs background &amp; opens plain-English explanation)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Block A Failure Markings */}
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#C23E2A] font-bold text-xs uppercase tracking-wider">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C23E2A]" />
                <span>Block A Failure Markings (Click to inspect):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECHNICAL_TERMS.filter((t) => t.block === "failure").map((term) => (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => setSelectedTerm(term)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 hover:border-red-400 px-3 py-1.5 text-xs font-bold text-[#8C2314] shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <span>{term.icon}</span>
                    <span>{term.name}</span>
                    <span className="text-[10px] text-red-500">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Block B Resilience Markings (Including the newly added Underground Conduit Pipe) */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#3B8352] font-bold text-xs uppercase tracking-wider">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3B8352]" />
                <span>Block B Resilience Markings (Click to inspect):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECHNICAL_TERMS.filter((t) => t.block === "resilient").map((term) => (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => setSelectedTerm(term)}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 px-3 py-1.5 text-xs font-bold text-[#235836] shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <span>{term.icon}</span>
                    <span>{term.name}</span>
                    <span className="text-[10px] text-emerald-600">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary comparison boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#C23E2A] font-bold text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C23E2A]" />
              <span>Block A Failure: Stormwater Backup (Bottleneck)</span>
            </div>
            <p className="text-xs text-[#554638] leading-relaxed">
              Debris/silt accumulation in underground conduit pipes causes upstream water to push upward through catch basins, flooding streets and basements despite standard rainfall.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#3B8352] font-bold text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3B8352]" />
              <span>Block B Resilience: Unobstructed Gravity Flow</span>
            </div>
            <p className="text-xs text-[#554638] leading-relaxed">
              A 1.5% elevation slope coupled with unclogged conduit cross-section allows storm intake to discharge directly to trunk canals without surface ponding.
            </p>
          </div>
        </div>
      </div>

      {/* Citizen-Friendly Technical Term Lightbox Modal with Backdrop Blur */}
      {selectedTerm && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn cursor-pointer"
          onClick={() => setSelectedTerm(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E8DFD3] bg-[#FFFDF9] p-6 sm:p-8 shadow-2xl space-y-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E0D5C7] text-2xl shadow-sm">
                  {selectedTerm.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        selectedTerm.block === "failure"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {selectedTerm.block === "failure" ? "Failure Bottleneck" : "Resilient Drainage"}
                    </span>
                    <span className="text-xs font-mono text-[#756350]">{selectedTerm.shortTag}</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#221B15] mt-1">
                    {selectedTerm.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTerm(null)}
                className="rounded-2xl border border-[#E0D5C7] bg-white p-2.5 text-[#554638] hover:bg-terracotta-50 hover:text-terracotta-800 hover:border-terracotta-300 transition-all cursor-pointer shadow-sm shrink-0"
                aria-label="Close detail modal"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Plain English explanation for normal citizens */}
            <div className="space-y-2 rounded-2xl border border-terracotta-200 bg-terracotta-50/60 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-800 block">
                What does this mean for your neighborhood street?
              </span>
              <p className="text-sm text-[#433830] leading-relaxed font-medium">
                {selectedTerm.plainEnglish}
              </p>
            </div>

            {/* Real Chennai Example */}
            <div className="space-y-2 rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#756350] block">
                Ground-Truth GCC Flood Survey Record (Cyclone Michaung &amp; Recent Events):
              </span>
              <p className="text-xs text-[#554638] leading-relaxed">
                {selectedTerm.neighborhoodExample}
              </p>
            </div>

            {/* Engineering Mechanism & Mitigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#E8DFD3] bg-white p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#756350] block">
                  Hydraulic Fluid Principle
                </span>
                <p className="text-xs text-[#554638] leading-relaxed">
                  {selectedTerm.mechanism}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  How Civil Engineers Fix This
                </span>
                <p className="text-xs text-[#225032] leading-relaxed font-medium">
                  {selectedTerm.engineeringFix}
                </p>
              </div>
            </div>

            {/* Footer close */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTerm(null)}
                className="rounded-xl bg-terracotta-600 px-5 py-2 text-xs font-bold text-white shadow-warm hover:bg-terracotta-700 transition-all cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FULL-SCREEN EXPANDED DIAGRAM LIGHTBOX MODAL */}
      {isDiagramExpanded && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99998] flex flex-col bg-black/95 backdrop-blur-2xl animate-fadeIn text-white p-3 sm:p-6"
          onClick={() => setIsDiagramExpanded(false)}
        >
          {/* Top Control Bar */}
          <div
            className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/15 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-white tracking-tight">
                  Hydraulic Infrastructure Cross-Section: Failure Block A vs Resilient Block B
                </h3>
              </div>
              <p className="text-xs text-white/70 hidden sm:block">
                High-definition mechanical detail. Click any pin to inspect citizen-friendly engineering definitions.
              </p>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/15">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                  className="px-2.5 py-1 text-xs font-mono font-bold hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="px-2 text-xs font-mono font-bold text-amber-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                  className="px-2.5 py-1 text-xs font-mono font-bold hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2.5 py-1 text-[11px] font-bold hover:bg-white/20 rounded-lg text-white/80 transition-all cursor-pointer"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDiagramExpanded(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ml-2"
                title="Close Full Screen"
              >
                <span>✕</span>
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Centered Scrollable Canvas */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-200 ease-out origin-center max-w-full"
              style={{
                transform: `scale(${zoomLevel})`,
                width: "min(1400px, 95vw)",
              }}
            >
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                <img
                  src="/images/drainage-mechanism-diagram.jpg"
                  alt="Flooding Urban Block vs Smooth Draining Urban Block Cross-Section Large View"
                  className="h-full w-full object-contain"
                />

                {/* Interactive Pins Replicated on the Large Diagram */}
                {/* 1. Basement Flooding */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "basement-flooding") || null)}
                  className="absolute top-[28%] left-[34%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      !
                    </span>
                  </span>
                </button>

                {/* 2. Catch Basin Overflow */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "catch-basin") || null)}
                  className="absolute top-[48%] left-[40%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      !
                    </span>
                  </span>
                </button>

                {/* 3. Choked Pipe */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "pipe-choked") || null)}
                  className="absolute top-[75%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      🚇
                    </span>
                  </span>
                </button>

                {/* 4. Bottleneck */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "bottleneck") || null)}
                  className="absolute top-[68%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      !
                    </span>
                  </span>
                </button>

                {/* 5. Elevation Slope */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "elevation-slope") || null)}
                  className="absolute top-[48%] left-[54%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      ✓
                    </span>
                  </span>
                </button>

                {/* 6. Functioning Street Intake */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "functioning-intake") || null)}
                  className="absolute top-[56%] left-[66%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      ✓
                    </span>
                  </span>
                </button>

                {/* 7. Clean Pipe */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "pipe-clean") || null)}
                  className="absolute top-[74%] left-[74%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      🚇
                    </span>
                  </span>
                </button>

                {/* 8. Unobstructed Outfall */}
                <button
                  type="button"
                  onClick={() => setSelectedTerm(TECHNICAL_TERMS.find(t => t.id === "unobstructed-flow") || null)}
                  className="absolute top-[70%] left-[86%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer hover:scale-125 transition-transform"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 text-white text-xs font-bold items-center justify-center shadow-lg border-2 border-white">
                      ⚡
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Mechanism Legend Bar */}
          <div
            className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/60 border border-red-500/50 text-red-200 font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Block A: Choked Conduit (58% Silt), Surcharged Manhole &amp; Overflow
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Block B: 1.5% Bed Slope, Unchoked Conduit (Laminar Gravity Discharge)
              </span>
            </div>
            <span className="text-white/60 font-mono text-[11px]">
              Press Esc or Click Outside to Exit Full Screen
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
