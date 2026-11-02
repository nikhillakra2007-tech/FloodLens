import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#E8DFD3] bg-[#FAF7F2] py-12 text-xs text-[#756350]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#E8DFD3]">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base text-[#221B15]">FloodLens Chennai</span>
              <span className="rounded-full bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 text-[10px] font-bold text-terracotta-700">
                GCC Resilience
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#554638] leading-relaxed max-w-md font-medium">
              Differential urban hydrological intelligence platform. Isolating physical civil failure points by pairing inundated catchments with resilient control wards under identical storm forcing.
            </p>
            <div className="font-mono text-[11px] text-[#8C7A6B]">
              Copernicus DEM GLO-30 · GCC GIS Stormwater Drain Geometry · 2023 Michaung Benchmark
            </div>
          </div>

          {/* Platform Workspaces */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#221B15] block">
              Platform Workspaces
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/hub" className="hover:text-terracotta-700 transition-colors">
                  System Feature Hub
                </Link>
              </li>
              <li>
                <Link href="/investigations/new" className="hover:text-terracotta-700 transition-colors">
                  Spatial Diagnostic Matrix
                </Link>
              </li>
              <li>
                <Link href="/flowchart" className="hover:text-terracotta-700 transition-colors">
                  Causal DAG & Flowchart
                </Link>
              </li>
              <li>
                <Link href="/simulator" className="hover:text-terracotta-700 transition-colors">
                  Differential Twin Simulator
                </Link>
              </li>
              <li>
                <Link href="/infrastructure" className="hover:text-terracotta-700 transition-colors">
                  Subsurface Infrastructure Anatomy
                </Link>
              </li>
            </ul>
          </div>

          {/* Civil & Emergency Contacts */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#221B15] block">
              Civil Operations &amp; Support
            </span>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-[#221B15]">GCC Helpline:</span>
                <span className="font-mono font-bold text-terracotta-700">1913</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-[#221B15]">Disaster Control:</span>
                <span className="font-mono">044-25619206</span>
              </li>
              <li>
                <Link href="/auth" className="hover:text-terracotta-700 transition-colors">
                  Account Gateway &amp; Role Toggle
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-[#8C7A6B]">
                  Riparian Systems: Cooum, Adyar, Buckingham Canal
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#756350]">
          <div>
            © {new Date().getFullYear()} FloodLens Platform. Designed for Greater Chennai Corporation & Disaster Resilience Teams.
          </div>
          <div className="flex items-center gap-4">
            <span>Chennai Coastal Basin Grid</span>
            <span className="text-[#D5C6B3]">·</span>
            <span>WGS84 Datum</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
