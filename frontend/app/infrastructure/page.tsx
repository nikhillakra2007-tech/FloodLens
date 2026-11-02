"use client";

import Link from "next/link";

export default function InfrastructurePage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#344C59] hover:text-[#126D66] bg-white border border-[#DCE6E9] rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow-cool"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Feature Hub</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/flowchart"
            className="text-xs font-bold text-[#647C89] hover:text-[#172D3A] bg-[#EAF1F3] px-3.5 py-1.5 rounded-xl transition-all"
          >
            ← Causal Flowchart
          </Link>
          <Link
            href="/investigations/new"
            className="text-xs font-bold text-white bg-[#126D66] hover:bg-[#0E544F] px-4 py-1.5 rounded-xl transition-all shadow-cool"
          >
            Launch Diagnostic Console →
          </Link>
        </div>
      </div>

      {/* 1. DUAL ARCHITECTURAL CROSS-SECTION DIAGRAM */}
      <section className="space-y-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DDF2EE] bg-[#ECF7F5] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#126D66]">
            Physical Subsurface Infrastructure Cross-Section
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#172D3A]">
            Flooding Block vs Resilient Twin Block
          </h1>
          <p className="text-base text-[#344C59] leading-relaxed">
            See the exact underground mechanism: An identical cloudburst floods Block A due to conduit silt buildup and catch basin backwater, while Block B discharges smoothly via functional outfall slope.
          </p>
        </div>

        {/* Big Infographic Diagram */}
        <div className="rounded-3xl border border-[#DCE6E9] bg-white p-4 sm:p-8 shadow-lift space-y-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#DCE6E9]">
            <img
              src="/images/drainage-mechanism-diagram.jpg"
              alt="Flooding Urban Block vs Smooth Draining Urban Block Cross-Section"
              className="h-full w-full object-cover img-zoom"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#DC2626] font-bold text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                <span>Block A Failure: Stormwater Backup &amp; Siltation</span>
              </div>
              <p className="text-xs text-[#344C59] leading-relaxed">
                Debris/silt accumulation in underground conduit pipe causes upstream water to push upward through catch basins, flooding streets and basements despite standard rainfall.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#059669] font-bold text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" />
                <span>Block B Resilience: Unobstructed Gravity Flow</span>
              </div>
              <p className="text-xs text-[#344C59] leading-relaxed">
                A 1.5% elevation slope coupled with unclogged conduit cross-section allows storm intake to discharge directly to trunk canals without surface ponding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHENNAI CATCHMENT BASIN SURVEY MAP */}
      <section className="space-y-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DDF2EE] bg-[#ECF7F5] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#126D66]">
            Topographic Survey &amp; River Systems Datum
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#172D3A]">
            Greater Chennai Drainage Basin Grid
          </h2>
          <p className="text-sm text-[#344C59]">
            Spatial analysis across the three primary river discharge arteries and coastal canal networks.
          </p>
        </div>

        <div className="rounded-3xl border border-[#DCE6E9] bg-white shadow-lift overflow-hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img
              src="/images/chennai-catchment-map.jpg"
              alt="Chennai Coastal City & Drainage Basins Topography"
              className="h-full w-full object-cover img-zoom"
            />
            {/* Architectural overlay badge top-left */}
            <div className="absolute top-4 left-4 rounded-xl border border-[#DCE6E9]/90 bg-white/95 px-3.5 py-2 shadow-xs backdrop-blur-md space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#126D66] block">
                Topographic Survey &amp; Drainage Basin Datum
              </span>
              <span className="font-bold text-xs sm:text-sm text-[#172D3A] block">
                Greater Chennai Corporation Hydrological Grid
              </span>
            </div>
          </div>

          {/* Dedicated Telemetry status bar */}
          <div className="border-t border-[#DCE6E9] bg-[#F6F9FA] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 text-[#172D3A]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#168C83] shrink-0" />
              <span>Major River Systems: Cooum, Adyar &amp; Buckingham Canal</span>
            </div>
            <div className="flex items-center gap-2 text-[#526B79]">
              <span>Reservoirs: Red Hills &amp; Chembarambakkam Lake</span>
            </div>
            <Link
              href="/investigations/new"
              className="font-bold text-[#126D66] hover:text-[#0E544F] flex items-center gap-1.5 transition-colors"
            >
              <span>Launch Map Investigation →</span>
            </Link>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl border border-[#DCE6E9] bg-white p-6 shadow-card">
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#126D66]">4 Wards</div>
            <div className="text-xs font-semibold text-[#647C89]">Calibrated Urban Basins</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#168C83]">100+</div>
            <div className="text-xs font-semibold text-[#647C89]">2015 Flood Inundation Markers</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#263C4A]">6 Vectors</div>
            <div className="text-xs font-semibold text-[#647C89]">DEM, HAND, SWD, Impervious</div>
          </div>
          <div className="space-y-1">
            <div className="font-serif text-3xl font-bold text-[#172D3A] flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              &lt;200ms
            </div>
            <div className="text-xs font-semibold text-[#647C89]">Causal Formulation Engine</div>
          </div>
        </div>
      </section>
    </div>
  );
}
