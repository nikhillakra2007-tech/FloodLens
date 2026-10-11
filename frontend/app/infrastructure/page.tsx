"use client";

import Link from "next/link";
import Image from "next/image";

export default function InfrastructurePage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-fadeIn">
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
            Launch Diagnostic Console →
          </Link>
        </div>
      </div>

      {/* 1. DUAL 3D ARCHITECTURAL CROSS-SECTION DIAGRAM */}
      <section className="space-y-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
            Physical Subsurface Infrastructure Cross-Section
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221B15]">
            Flooding Block vs Resilient Twin Block
          </h1>
          <p className="text-base text-[#554638] leading-relaxed">
            See the exact underground mechanism: An identical cloudburst floods Block A due to conduit silt buildup and catch basin backwater, while Block B discharges smoothly via functional outfall slope.
          </p>
        </div>

        {/* Big Infographic Diagram */}
        <div className="rounded-3xl border border-[#E8DFD3] bg-white p-4 sm:p-8 shadow-lift space-y-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#E8DFD3]">
            <img
              src="/images/drainage-mechanism-diagram.jpg"
              alt="Flooding Urban Block vs Smooth Draining Urban Block Cross-Section"
              className="h-full w-full object-cover img-zoom"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#C23E2A] font-bold text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C23E2A]" />
                <span>Block A Failure: Stormwater Backup & Siltation</span>
              </div>
              <p className="text-xs text-[#554638] leading-relaxed">
                Debris/silt accumulation in underground conduit pipe causes upstream water to push upward through catch basins, flooding streets and basements despite standard rainfall.
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
      </section>

      {/* 2. CHENNAI CATCHMENT BASIN SURVEY MAP */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
            Topographic Survey & River Systems Datum
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#221B15]">
            Greater Chennai Drainage Basin Grid
          </h2>
          <p className="text-sm text-[#554638]">
            Spatial analysis across the three primary river discharge arteries and coastal canal networks.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[#E8DFD3] bg-white shadow-lift">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img
              src="/images/chennai-catchment-map.jpg"
              alt="Chennai Coastal City & Drainage Basins Topography"
              className="h-full w-full object-cover img-zoom"
            />
            {/* Architectural overlay badge top-left */}
            <div className="absolute top-5 left-5 rounded-2xl border border-[#E8DFD3]/80 bg-white/95 px-4 py-2.5 shadow-card backdrop-blur-md space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700 block">
                Topographic Survey & Drainage Basin Datum
              </span>
              <span className="font-serif font-bold text-sm text-[#221B15] block">
                Greater Chennai Corporation Hydrological Grid
              </span>
            </div>

            {/* Telemetry chips bottom */}
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8DFD3]/90 bg-white/95 p-4 shadow-card backdrop-blur-md text-xs font-semibold">
              <div className="flex items-center gap-2 text-[#221B15]">
                <span className="h-2.5 w-2.5 rounded-full bg-terracotta-600" />
                <span>Major River Systems: Cooum, Adyar & Buckingham Canal</span>
              </div>
              <div className="flex items-center gap-2 text-[#554638]">
                <span>Reservoirs: Red Hills & Chembarambakkam Lake</span>
              </div>
              <Link
                href="/investigations/new"
                className="font-bold text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1.5"
              >
                <span>Launch Map Investigation →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-card">
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-terracotta-600">4 Wards</div>
            <div className="text-xs font-semibold text-[#756350]">Calibrated Urban Basins</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-sage-600">100+</div>
            <div className="text-xs font-semibold text-[#756350]">2015 Flood Inundation Markers</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#554638]">6 Vectors</div>
            <div className="text-xs font-semibold text-[#756350]">DEM, HAND, SWD, Impervious</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#221B15] flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              &lt;200ms
            </div>
            <div className="text-xs font-semibold text-[#756350]">Causal Formulation Engine</div>
          </div>
        </div>
      </section>
    </div>
  );
}
