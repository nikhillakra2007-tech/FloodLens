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
          className="inline-flex items-center gap-2 text-xs font-bold text-[#344C59] hover:text-[#126D66] bg-white border border-[#DCE6E9] rounded-xl px-3.5 sm:px-4 py-2 transition-all shadow-sm hover:shadow-cool"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Feature Hub</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/simulator"
            className="text-xs font-bold text-[#647C89] hover:text-[#172D3A] bg-[#EAF1F3] px-3 sm:px-3.5 py-1.5 rounded-xl transition-all"
          >
            Twin Simulator →
          </Link>
          <Link
            href="/investigations/new"
            className="text-xs font-bold text-white bg-[#126D66] hover:bg-[#0E544F] px-3.5 sm:px-4 py-1.5 rounded-xl transition-all shadow-cool"
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
