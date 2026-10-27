"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import clsx from "clsx";

export default function UserMenu() {
  const { user, profile, experienceMode, setExperienceMode, signOut, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-xl bg-[#F5EFE6] border border-[#E8DFD3]" />
    );
  }

  // Not signed in: show Sign In button
  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 rounded-xl border border-[#E0D5C7] bg-white hover:bg-[#FAF7F2] hover:border-terracotta-300 px-4 py-2 text-xs font-bold text-[#554638] hover:text-[#221B15] transition-all shadow-xs cursor-pointer"
      >
        <svg className="h-3.5 w-3.5 text-terracotta-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span>Sign In</span>
      </Link>
    );
  }

  // Signed in: show User initials + Experience Mode Badge + Dropdown
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isTechnical = experienceMode === "technical";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-2xl border border-[#E0D5C7] bg-white p-1.5 pr-3 shadow-xs hover:border-[#D5C6B3] hover:bg-[#FAF7F2] transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        {/* Avatar Initials Circle */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-terracotta-600 text-[11px] font-bold text-white shadow-xs">
          {initials}
        </div>

        {/* Mode Pill Badge */}
        <div className="hidden sm:flex flex-col items-start text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221B15] truncate max-w-[120px]">
              {displayName}
            </span>
            {user.id?.startsWith("demo-") && (
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-1 rounded">
                Demo
              </span>
            )}
          </div>
          <span
            className={clsx(
              "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border",
              isTechnical
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-terracotta-200 bg-terracotta-50 text-terracotta-700"
            )}
          >
            {isTechnical ? "Technical Mode" : "Citizen Mode"}
          </span>
        </div>

        {/* Chevron Icon */}
        <svg
          className={clsx(
            "h-3.5 w-3.5 text-[#756350] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Account Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#E8DFD3] bg-white p-4 shadow-warm z-50 animate-fadeIn space-y-4">
          {/* User Info Header */}
          <div className="space-y-1 pb-3 border-b border-[#E8DFD3]">
            <p className="text-xs font-bold text-[#221B15] truncate">{displayName}</p>
            <p className="text-[11px] text-[#756350] truncate font-mono">
              {user.email || profile?.phone || "Authenticated User"}
            </p>
          </div>

          {/* Mode Switcher Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#756350] uppercase text-[10px] tracking-wider">
                Experience Mode
              </span>
              <span className="text-[11px] font-semibold text-terracotta-600">
                {isTechnical ? "Technical" : "Citizen"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3]">
              <button
                type="button"
                onClick={() => setExperienceMode("citizen")}
                className={clsx(
                  "py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  !isTechnical
                    ? "bg-white text-terracotta-700 shadow-xs border border-terracotta-200"
                    : "text-[#756350] hover:text-[#221B15]"
                )}
              >
                Citizen
              </button>

              <button
                type="button"
                onClick={() => setExperienceMode("technical")}
                className={clsx(
                  "py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  isTechnical
                    ? "bg-white text-terracotta-700 shadow-xs border border-terracotta-200"
                    : "text-[#756350] hover:text-[#221B15]"
                )}
              >
                Technical
              </button>
            </div>
            <p className="text-[10px] text-[#756350] leading-relaxed">
              {isTechnical
                ? "Full mathematical formulas, rational runoff Q=CIA, and Manning's parameters."
                : "Plain-language flood mechanism explanations and local impact summaries."}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-1 pt-2 border-t border-[#E8DFD3]">
            <Link
              href="/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15] transition-colors"
            >
              <svg className="h-3.5 w-3.5 text-terracotta-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Profile & Role Settings</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
