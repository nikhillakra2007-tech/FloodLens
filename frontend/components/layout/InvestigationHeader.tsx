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
    <div className={clsx("flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-7 shadow-card min-w-0", className)}>
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/investigations/new"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#126D66] hover:text-[#0E544F] transition-colors shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Catchment Matrix</span>
          </Link>
          <span className="text-[#C6D5DA]">/</span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#647C89] truncate">
            Differential Diagnostic Report
          </span>
        </div>

        <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#172D3A] break-words">
          {title}
        </h1>

        {status && (
          <div className="flex items-center gap-2 text-xs text-[#344C59] flex-wrap">
            <span className="font-medium">Audit Status:</span>
            <span className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
              status === "completed"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : status === "running"
                ? "bg-[#ECF7F5] text-[#126D66] border border-[#DDF2EE]"
                : "bg-[#EAF1F3] text-[#344C59]"
            )}>
              <span className={clsx(
                "h-1.5 w-1.5 rounded-full",
                status === "completed" ? "bg-emerald-600" : status === "running" ? "bg-[#168C83] animate-ping" : "bg-[#879AA4]"
              )} />
              {status}
            </span>
          </div>
        )}
      </div>

      {verdict && (
        <div className="flex items-center gap-4 shrink-0 sm:self-center">
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#647C89]">Defensibility Verdict</span>
            <Badge label={verdict.replace(/_/g, " ")} variant="verdict" value={verdict} className="text-xs px-3 py-1 font-semibold" />
          </div>
        </div>
      )}
    </div>
  );
}
