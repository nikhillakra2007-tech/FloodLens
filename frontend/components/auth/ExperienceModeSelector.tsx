"use client";

import React from "react";
import clsx from "clsx";
import type { ExperienceMode } from "@/lib/auth/types";

interface ExperienceModeSelectorProps {
  value: ExperienceMode;
  onChange: (mode: ExperienceMode) => void;
  disabled?: boolean;
}

export default function ExperienceModeSelector({
  value,
  onChange,
  disabled = false,
}: ExperienceModeSelectorProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Select Experience Mode">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#756350]">
          Application Experience Mode <span className="text-terracotta-600">*</span>
        </label>
        <span className="text-[11px] font-medium text-[#756350]">
          Switch anytime in settings
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* CITIZEN MODE CARD */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "citizen"}
          aria-label="Citizen Mode: For residents, community members, and people who want to understand flooding in their area"
          disabled={disabled}
          onClick={() => onChange("citizen")}
          className={clsx(
            "relative text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between",
            value === "citizen"
              ? "border-terracotta-600 bg-terracotta-50/50 shadow-sm ring-2 ring-terracotta-500/20"
              : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]/50 shadow-xs",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div
                className={clsx(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                  value === "citizen"
                    ? "bg-terracotta-600 text-white"
                    : "bg-[#F5EFE6] text-[#756350]"
                )}
              >
                {/* Community / Citizen Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <div
                className={clsx(
                  "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                  value === "citizen"
                    ? "border-terracotta-600 bg-terracotta-600 text-white"
                    : "border-[#D5C6B3] bg-white"
                )}
              >
                {value === "citizen" && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base text-[#221B15]">
                Citizen
              </h4>
              <p className="text-xs text-[#554638] mt-1 leading-relaxed">
                For residents and community members who want plain-language understanding of flood risks.
              </p>
            </div>

            <ul className="space-y-1.5 pt-2 border-t border-[#E8DFD3]/70 text-[11px] text-[#756350]">
              <li className="flex items-center gap-1.5">
                <span className="text-terracotta-600 font-bold">•</span>
                <span>Plain-language flood summaries</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-terracotta-600 font-bold">•</span>
                <span>Why this area flooded explanations</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-terracotta-600 font-bold">•</span>
                <span>Local safety & uncertainty context</span>
              </li>
            </ul>
          </div>
        </button>

        {/* TECHNICAL MODE CARD */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "technical"}
          aria-label="Technical Mode: For engineers, researchers, analysts, planning teams, and other users who need detailed hydrological evidence"
          disabled={disabled}
          onClick={() => onChange("technical")}
          className={clsx(
            "relative text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between",
            value === "technical"
              ? "border-terracotta-600 bg-terracotta-50/50 shadow-sm ring-2 ring-terracotta-500/20"
              : "border-[#E8DFD3] bg-white hover:border-[#D5C6B3] hover:bg-[#FAF7F2]/50 shadow-xs",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div
                className={clsx(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                  value === "technical"
                    ? "bg-terracotta-600 text-white"
                    : "bg-[#F5EFE6] text-[#756350]"
                )}
              >
                {/* Engineering / Gauge Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>

              <div
                className={clsx(
                  "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                  value === "technical"
                    ? "border-terracotta-600 bg-terracotta-600 text-white"
                    : "border-[#D5C6B3] bg-white"
                )}
              >
                {value === "technical" && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base text-[#221B15]">
                Technical
              </h4>
              <p className="text-xs text-[#554638] mt-1 leading-relaxed">
                For engineers, hydrologists, and planning analysts requiring mathematical evidence.
              </p>
            </div>

            <ul className="space-y-1.5 pt-2 border-t border-[#E8DFD3]/70 text-[11px] text-[#756350]">
              <li className="flex items-center gap-1.5">
                <span className="text-terracotta-600 font-bold">•</span>
                <span>Twin-catchment divergence metrics</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-terracotta-600 font-bold">•</span>
                <span>Rational runoff Q=CIA & Manning&apos;s eq</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-terracotta-600 font-bold">•</span>
                <span>Causal DAGs & GVF backwater graphs</span>
              </li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  );
}
