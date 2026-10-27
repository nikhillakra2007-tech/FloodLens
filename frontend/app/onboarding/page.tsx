"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { validateRedirectUrl } from "@/lib/auth/validation";
import ExperienceModeSelector from "@/components/auth/ExperienceModeSelector";
import type { ExperienceMode } from "@/lib/auth/types";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, experienceMode, setExperienceMode, refreshProfile } = useAuth();

  const nextDestination = validateRedirectUrl(searchParams.get("next"), "/hub");
  const [selectedMode, setSelectedMode] = useState<ExperienceMode>(
    profile?.experience_mode || experienceMode || "citizen"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    await setExperienceMode(selectedMode);
    await refreshProfile();
    setIsSaving(false);
    router.push(nextDestination);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-[#E8DFD3] bg-white p-8 sm:p-12 shadow-lift space-y-8 animate-fadeInUp">
        
        {/* Header */}
        <div className="space-y-3 text-center max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-terracotta-700">
            Initial Setup & Personalization
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#221B15]">
            Choose Your FloodLens Experience
          </h1>
          <p className="text-xs sm:text-sm text-[#554638] leading-relaxed">
            Select how you would like to explore Greater Chennai flood causal mechanisms. You can switch modes at any time from your account menu.
          </p>
        </div>

        {/* Experience Mode Cards */}
        <div className="pt-2">
          <ExperienceModeSelector
            value={selectedMode}
            onChange={setSelectedMode}
            disabled={isSaving}
          />
        </div>

        {/* Scientific & Authorization Clarification Notice */}
        <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 text-xs text-[#554638] space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-[#221B15]">
            <svg className="h-4 w-4 text-terracotta-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Role & Presentation Notice</span>
          </div>
          <p>
            The selected mode tailors mathematical depth and analytical visualizations. Technical mode provides full access to Manning&apos;s formulas, GVF backwater curves, and twin-catchment divergence. Official administrative actions and restricted records require independent authorization.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isSaving}
            className="w-full rounded-2xl bg-terracotta-600 px-8 py-4 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <span>Confirm Mode & Proceed to Application →</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-terracotta-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
            <span>Loading Experience Preferences...</span>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
