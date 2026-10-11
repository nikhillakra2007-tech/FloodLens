"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import clsx from "clsx";

interface InvestigationHeaderProps {
  title: string;
  status?: string;
  verdict?: string;
  className?: string;
}

export default function InvestigationHeader({ title, status, verdict, className }: InvestigationHeaderProps) {
  return (
    <div className={clsx("flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl border border-[#E8DFD3] bg-white p-7 shadow-card", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href="/investigations/new"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-700 hover:text-terracotta-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Catchment Matrix</span>
          </Link>
          <span className="text-[#D5C6B3]">/</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#756350]">
            Differential Diagnostic Report
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#221B15]">{title}</h1>
        {status && (
          <div className="flex items-center gap-2 text-xs text-[#554638]">
            <span>Audit Status:</span>
            <span className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider",
              status === "completed"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : status === "running"
                ? "bg-terracotta-50 text-terracotta-800 border border-terracotta-200"
                : "bg-[#F5EFE6] text-[#554638]"
            )}>
              <span className={clsx(
                "h-1.5 w-1.5 rounded-full",
                status === "completed" ? "bg-emerald-600" : status === "running" ? "bg-terracotta-600 animate-ping" : "bg-[#9E8B75]"
              )} />
              {status}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {verdict && (
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756350]">Defensibility Verdict</span>
            <Badge label={verdict.replace(/_/g, " ")} variant="verdict" value={verdict} className="text-xs px-3 py-1 font-bold" />
          </div>
        )}
      </div>
    </div>
  );
}
