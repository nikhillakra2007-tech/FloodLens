"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import clsx from "clsx";

export default function UserMenu() {
  const { user, profile, experienceMode, signOut, isLoading } = useAuth();
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
      <div className="h-9 w-20 sm:w-24 animate-pulse rounded-xl bg-[#F5EFE6] border border-[#E8DFD3]" />
    );
  }

  // Not signed in: show Sign In button (refined regular/medium weight, 14-15px)
  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 rounded-xl bg-terracotta-600 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-warm hover:bg-terracotta-700 hover:shadow-lift transition-all cursor-pointer shrink-0"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-[#E0D5C7] bg-white p-1.5 pr-2.5 sm:pr-3 shadow-xs hover:border-[#D5C6B3] hover:bg-[#FAF7F2] transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        {/* Avatar Initials Circle */}
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-terracotta-600 text-xs font-semibold text-white shadow-xs">
          {initials}
        </div>

        {/* Mode Pill Badge */}
        <div className="hidden sm:flex flex-col items-start text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-semibold text-[#221B15] truncate max-w-[120px] lg:max-w-[140px]">
              {displayName}
            </span>
            {user.id?.startsWith("demo-") && (
              <span className="text-[9px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-1 py-0.2 rounded">
                Demo
              </span>
            )}
          </div>
          <span
            className={clsx(
              "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-full border",
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
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Account Dropdown Card (overflow-safe, max-w-[calc(100vw-2rem)]) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E8DFD3] bg-white p-4 sm:p-5 shadow-warm z-50 animate-fadeIn space-y-3 sm:space-y-4">
          {/* User Info Header */}
          <div className="space-y-0.5 pb-2.5 border-b border-[#E8DFD3]">
            <p className="text-sm font-semibold text-[#221B15] truncate">{displayName}</p>
            <p className="text-xs text-[#756350] truncate font-mono">
              {user.email || profile?.phone || "Authenticated User"}
            </p>
          </div>

          {/* Read-Only Enforced Role Information (Cross-mode switching removed) */}
          <div className="space-y-2 rounded-xl bg-[#FAF7F2] p-3 border border-[#E8DFD3]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#756350] uppercase text-[10px] tracking-wider">
                Assigned Role
              </span>
              <span
                className={clsx(
                  "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                  isTechnical
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-terracotta-200 bg-terracotta-50 text-terracotta-700"
                )}
              >
                {isTechnical ? "Technical Mode" : "Citizen Mode"}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#221B15]">
                {profile?.role_title || (isTechnical ? "GCC Senior Hydrologist & SWD Lead" : "Velachery Ward 170 Resident Observer")}
              </p>
              <p className="text-[11px] text-[#756350] leading-relaxed mt-1">
                {isTechnical
                  ? "Engineering depth enabled: Rational runoff Q=CIA, Manning conduit hydraulics, and differential twin diagnosis."
                  : "Resident depth enabled: Local street inundation observations, flood precautions, and civic helpline contacts."}
              </p>
            </div>
            <p className="text-[10px] text-[#8C7A6B] italic border-t border-[#E8DFD3]/80 pt-1.5">
              Role is strictly bound to authorization. Cross-mode switching is disabled.
            </p>
          </div>

          {/* Quick Links & Sign Out Action */}
          <div className="space-y-1 pt-1 border-t border-[#E8DFD3]">
            <Link
              href="/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-[#554638] hover:bg-[#FAF7F2] hover:text-[#221B15] transition-colors"
            >
              <svg className="h-4 w-4 text-terracotta-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Profile &amp; Role Settings</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <svg className="h-4 w-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
