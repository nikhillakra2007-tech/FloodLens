"use client";

import Link from "next/link";
import RealisticCausalFlowchart from "@/components/visuals/RealisticCausalFlowchart";

export default function FlowchartPage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#554638] hover:text-terracotta-700 bg-white border border-[#E0D5C7] rounded-xl px-3.5 sm:px-4 py-2 transition-all shadow-sm hover:shadow-warm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Feature Hub</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/simulator"
            className="text-xs font-bold text-[#756350] hover:text-[#221B15] bg-[#F5EFE6] px-3 sm:px-3.5 py-1.5 rounded-xl transition-all"
          >
            Twin Simulator →
          </Link>
          <Link
            href="/investigations/new"
            className="text-xs font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 px-3.5 sm:px-4 py-1.5 rounded-xl transition-all shadow-warm"
          >
            Diagnostic Console →
          </Link>
        </div>
      </div>

      {/* Main Flowchart Engine */}
      <RealisticCausalFlowchart />
    </div>
  );
}
