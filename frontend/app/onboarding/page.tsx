"use client";

import React, { Suspense } from "react";
import ProfileSettingsContent from "@/components/settings/ProfileSettingsContent";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#126D66]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#168C83] border-t-transparent" />
            <span>Loading Profile &amp; Role Settings...</span>
          </div>
        </div>
      }
    >
      <ProfileSettingsContent />
    </Suspense>
  );
}
