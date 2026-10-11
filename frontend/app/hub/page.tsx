"use client";

import Link from "next/link";

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

export default function FeatureHubPage() {
  const features: FeaturePortal[] = [
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

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta-800">
            System Feature Hub
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#221B15]">
            Diagnostic Tools &amp; Workspaces
          </h1>
          <p className="text-sm text-[#554638]">
            Access any dedicated hydrological module below.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#554638] hover:text-terracotta-700 bg-white border border-[#E0D5C7] rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow-warm"
        >
          <span>← Back to Landing Page</span>
        </Link>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-[#E8DFD3] bg-white p-7 sm:p-8 shadow-card hover:shadow-lift hover:border-[#D5C6B3] transition-all duration-300"
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] group-hover:bg-terracotta-50 group-hover:border-terracotta-200 transition-colors">
                  {feature.iconSvg}
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${feature.badgeColor}`}
                >
                  {feature.badge}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700 block">
                  {feature.category}
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#221B15] group-hover:text-terracotta-800 transition-colors">
                  {feature.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#554638] leading-relaxed pt-1">
                  {feature.description}
                </p>
              </div>

              <ul className="space-y-2 border-t border-[#F0E8DD] pt-4 text-xs text-[#6B5A4B]">
                {feature.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-terracotta-600 font-bold">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href={feature.href}
                className={`w-full flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  feature.buttonVariant === "primary"
                    ? "bg-terracotta-600 text-white shadow-warm hover:bg-terracotta-700 hover:shadow-lift"
                    : "bg-[#FAF7F2] border border-[#E0D5C7] text-[#221B15] hover:bg-white hover:border-terracotta-400 hover:text-terracotta-800"
                }`}
              >
                <span>{feature.buttonText}</span>
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
