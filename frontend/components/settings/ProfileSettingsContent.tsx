"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/context";
import { validateRedirectUrl } from "@/lib/auth/validation";

const CHENNAI_WARDS = [
  { value: "ward-170", label: "Ward 170 — Velachery South (Vulnerable Catchment)" },
  { value: "ward-173", label: "Ward 173 — Adyar West (Resilient Control)" },
  { value: "ward-142", label: "Ward 142 — T. Nagar Usman Corridor" },
  { value: "ward-155", label: "Ward 155 — Madipakkam Lake Fringe" },
  { value: "ward-168", label: "Ward 168 — Guindy Industrial Basin" },
  { value: "ward-175", label: "Ward 175 — Besant Nagar Coastal Outlet" },
];

export default function ProfileSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, updateProfile, experienceMode } = useAuth();

  const nextParam = searchParams.get("next");
  const nextDestination = validateRedirectUrl(
    nextParam,
    experienceMode === "citizen" ? "/hub" : "/investigations/new"
  );

  // Form states initialized from active Supabase profile
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [primaryWard, setPrimaryWard] = useState("ward-170");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setDepartment(profile.department_or_agency || "");
      setPrimaryWard(profile.primary_ward || "ward-170");
      setEmailNotifications(
        profile.email_notifications ?? true
      );
      setSmsAlerts(false);
    } else if (user) {
      setFullName(user.user_metadata?.full_name || "");
    }
  }, [profile, user]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }
    if (phone.trim()) {
      const cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
      if (cleaned.length < 10) {
        errors.phone = "Please enter a valid 10-digit mobile number.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        department_or_agency: department.trim() || undefined,
        primary_ward: primaryWard,
        email_notifications: emailNotifications,
        profile_completed: true,
      });

      setIsSaving(false);
      if (res.error) {
        setFeedback({
          type: "error",
          message: res.error,
        });
      } else {
        setFeedback({
          type: "success",
          message: "Profile preferences saved successfully.",
        });

        // If coming from onboarding flow, redirect to destination after slight pause
        if (searchParams.get("onboarding") === "true") {
          setTimeout(() => {
            router.push(nextDestination);
          }, 800);
        }
      }
    } catch (err: any) {
      setIsSaving(false);
      setFeedback({
        type: "error",
        message: err.message || "An unexpected error occurred while saving profile.",
      });
    }
  };

  const isTechnical = experienceMode === "technical";
  const isDemo = user?.id?.startsWith("demo-");

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#DCE6E9] bg-white p-8 text-center space-y-4 shadow-lift">
          <div className="h-12 w-12 rounded-2xl bg-[#ECF7F5] text-[#126D66] flex items-center justify-center mx-auto">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#172D3A]">Sign In Required</h2>
          <p className="text-xs text-[#647C89]">
            Please sign in or launch a demo session to access and customize your profile settings.
          </p>
          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#126D66] px-6 py-3 text-xs font-bold text-white shadow-cool hover:bg-[#0E544F] transition-colors"
          >
            Go to Authentication Gateway →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-10 shadow-lift space-y-8 animate-fadeInUp">
        
        {/* Header */}
        <div className="space-y-2 border-b border-[#DCE6E9] pb-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDF2EE] bg-[#ECF7F5] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#126D66]">
              Account Preferences
            </span>
            {isDemo && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300 bg-[#ECF7F5] px-2.5 py-0.5 text-[10px] font-semibold text-[#126D66]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#168C83]" />
                Demo Session
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#172D3A]">
            Profile &amp; Role Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#647C89] leading-relaxed">
            Manage your personal credentials, contact alerts, and monitored Greater Chennai catchment zone.
          </p>
        </div>

        {/* FEEDBACK BANNERS */}
        {feedback && (
          <div
            role="alert"
            className={clsx(
              "rounded-2xl p-4 text-xs flex items-start gap-3 border transition-all",
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            {feedback.type === "success" ? (
              <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <div className="flex-1">
              <p className="font-bold">{feedback.type === "success" ? "Saved Successfully" : "Error Saving Settings"}</p>
              <p className="mt-0.5 leading-relaxed">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* ENFORCED ROLE CARD (READ-ONLY) */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-[#F6F9FA] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#647C89]">
              Assigned Authorization Role
            </span>
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border self-start sm:self-auto",
                isTechnical
                  ? "border-[#BBDCE5] bg-[#EAF1F3] text-[#193344]"
                  : "border-[#DDF2EE] bg-[#ECF7F5] text-[#126D66]"
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", isTechnical ? "bg-[#263C4A]" : "bg-[#168C83]")} />
              {isTechnical ? "Technical Mode (Hydrology Engineer)" : "Citizen Mode (Resident Observer)"}
            </span>
          </div>

          <div className="text-xs text-[#344C59] space-y-1 leading-relaxed">
            <p className="font-semibold text-[#172D3A]">
              {isTechnical
                ? "Full analytical access: Manning conduit hydraulics, GVF backwater curves, and counterfactual mitigation runs."
                : "Civic access: Local waterlogging reporting, community crowd-sourced alerts, and emergency drainage hotlines."}
            </p>
            <p className="text-[11px] text-[#879AA4] italic pt-1 border-t border-[#DCE6E9]/80">
              Role is strictly assigned to your authenticated credential and cannot be altered here. Cross-mode switching is disabled to maintain empirical data provenance.
            </p>
          </div>
        </div>

        {/* PROFILE SETTINGS FORM */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-[#344C59]">
                Full Name <span className="text-[#168C83]">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                placeholder="Dr. R. Ramanathan"
                className={clsx(
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#172D3A] placeholder-[#879AA4] transition-colors focus:outline-none focus:ring-2",
                  fieldErrors.fullName
                    ? "border-red-500 focus:ring-red-400"
                    : "border-[#DCE6E9] focus:border-[#168C83] focus:ring-[#DDF2EE]"
                )}
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-600 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#344C59]">
                Contact Mobile (Indian)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSaving}
                placeholder="+91 98765 43210"
                className={clsx(
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#172D3A] placeholder-[#879AA4] transition-colors focus:outline-none focus:ring-2",
                  fieldErrors.phone
                    ? "border-red-500 focus:ring-red-400"
                    : "border-[#DCE6E9] focus:border-[#168C83] focus:ring-[#DDF2EE]"
                )}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-600 font-medium">{fieldErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department / Organization */}
            <div className="space-y-1.5">
              <label htmlFor="department" className="block text-xs font-bold uppercase tracking-wider text-[#344C59]">
                Department / Agency
              </label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isSaving}
                placeholder="GCC Stormwater Drainage Dept"
                className="w-full rounded-xl border border-[#DCE6E9] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#172D3A] placeholder-[#879AA4] transition-colors focus:border-[#168C83] focus:outline-none focus:ring-2 focus:ring-[#DDF2EE]"
              />
            </div>

            {/* Primary Catchment / Ward */}
            <div className="space-y-1.5">
              <label htmlFor="primaryWard" className="block text-xs font-bold uppercase tracking-wider text-[#344C59]">
                Primary Monitored Ward
              </label>
              <select
                id="primaryWard"
                value={primaryWard}
                onChange={(e) => setPrimaryWard(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-[#DCE6E9] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#172D3A] transition-colors focus:border-[#168C83] focus:outline-none focus:ring-2 focus:ring-[#DDF2EE] cursor-pointer"
              >
                {CHENNAI_WARDS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div className="rounded-2xl border border-[#DCE6E9] p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#344C59] block">
              Automated Notification Preferences
            </span>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  disabled={isSaving}
                  className="mt-1 h-4 w-4 rounded border-[#DCE6E9] text-[#126D66] focus:ring-[#168C83] cursor-pointer"
                />
                <div>
                  <p className="text-xs font-semibold text-[#172D3A]">Email Causal Bulletins</p>
                  <p className="text-[11px] text-[#647C89]">
                    Receive technical causal diagnosis reports and counterfactual findings when investigations complete.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  disabled={isSaving}
                  className="mt-1 h-4 w-4 rounded border-[#DCE6E9] text-[#126D66] focus:ring-[#168C83] cursor-pointer"
                />
                <div>
                  <p className="text-xs font-semibold text-[#172D3A]">Urgent Inundation Alerts (SMS)</p>
                  <p className="text-[11px] text-[#647C89]">
                    Receive instant notifications if real-time backwater head divergence exceeds +1.03m dy/dx.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto flex-1 rounded-2xl bg-[#126D66] px-6 py-3.5 text-xs font-bold text-white shadow-cool transition-all duration-300 hover:bg-[#0E544F] hover:shadow-lift active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving Profile Settings...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>

            <Link
              href={nextDestination}
              className="w-full sm:w-auto rounded-2xl border border-[#DCE6E9] bg-[#F6F9FA] px-6 py-3.5 text-xs font-semibold text-[#344C59] text-center hover:bg-white hover:text-[#172D3A] transition-colors"
            >
              Continue to Application →
            </Link>
          </div>
        </form>

        {/* QUICK ROLE DESTINATION SHORTCUTS */}
        <div className="border-t border-[#DCE6E9] pt-5 flex items-center justify-between text-xs text-[#647C89]">
          <span>Enforced Destination:</span>
          {isTechnical ? (
            <Link
              href="/investigations/new"
              className="font-semibold text-[#126D66] hover:text-[#0E544F] underline underline-offset-4"
            >
              Investigation Suite (/investigations/new) →
            </Link>
          ) : (
            <Link
              href="/hub"
              className="font-semibold text-[#126D66] hover:text-[#0E544F] underline underline-offset-4"
            >
              Citizen Observer Hub (/hub) →
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
