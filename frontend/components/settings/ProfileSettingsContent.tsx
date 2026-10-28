"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/context";
import { validateRedirectUrl } from "@/lib/auth/validation";

const CHENNAI_WARDS = [
  { value: "Ward 170 - Velachery South", label: "Ward 170 — Velachery South (Zone 13)" },
  { value: "Ward 173 - Adyar West", label: "Ward 173 — Adyar West (Zone 13)" },
  { value: "Ward 175 - Perungudi", label: "Ward 175 — Perungudi Industrial (Zone 14)" },
  { value: "Ward 176 - Velachery East", label: "Ward 176 — Velachery East (Zone 13)" },
  { value: "Ward 178 - Besant Nagar", label: "Ward 178 — Besant Nagar / Coastal (Zone 13)" },
  { value: "Ward 179 - Thiruvanmiyur", label: "Ward 179 — Thiruvanmiyur (Zone 13)" },
  { value: "Ward 180 - Kottivakkam", label: "Ward 180 — Kottivakkam / ECR (Zone 14)" },
  { value: "Pallikaranai Marsh Catchment", label: "Pallikaranai Marsh Basin / Wetland Buffer" },
  { value: "Mambalam Canal Basin", label: "Mambalam Canal Basin (Zone 10)" },
  { value: "Buckingham Canal Corridor", label: "Buckingham Canal South Conduit" },
];

export default function ProfileSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, experienceMode, updateProfile } = useAuth();

  const nextDestination = validateRedirectUrl(
    searchParams.get("next"),
    experienceMode === "technical" ? "/investigations/new" : "/hub"
  );

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [primaryWard, setPrimaryWard] = useState(CHENNAI_WARDS[0].value);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Status & Validation State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initialize from existing profile or user metadata
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || user?.user_metadata?.full_name || "");
      setPhone(profile.phone || user?.phone || "");
      setDepartment(
        profile.department_or_agency ||
        (experienceMode === "technical" ? "Greater Chennai Corporation (GCC) - SWD Division" : "Resident Observer")
      );
      setPrimaryWard(profile.primary_ward || CHENNAI_WARDS[0].value);
      setEmailNotifications(profile.email_notifications ?? true);
      setSmsAlerts(profile.sms_alerts ?? false);
    } else if (user) {
      setFullName(user.user_metadata?.full_name || (experienceMode === "technical" ? "GCC Senior Hydrologist" : "Velachery Resident"));
      setPhone(user.phone || "");
      setDepartment(experienceMode === "technical" ? "Greater Chennai Corporation (GCC) - SWD Division" : "Resident Community Member");
    }
  }, [profile, user, experienceMode]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (phone.trim()) {
      // Indian phone number regex (+91 optional, followed by 10 digits starting 6-9)
      const cleanPhone = phone.replace(/[\s-]/g, "");
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = "Please enter a valid 10-digit Indian mobile number (e.g. +91 98765 43210).";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        department_or_agency: department.trim() || null,
        primary_ward: primaryWard,
        email_notifications: emailNotifications,
        sms_alerts: smsAlerts,
      });

      if (res?.error) {
        setFeedback({
          type: "error",
          message: res.error,
        });
      } else {
        const isDemo = user?.id?.startsWith("demo-");
        setFeedback({
          type: "success",
          message: isDemo
            ? "Settings successfully saved to local session. Preferences will persist across refreshes."
            : "Profile settings successfully updated and saved to the database.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "An unexpected error occurred while saving profile settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isTechnical = experienceMode === "technical";
  const isDemo = user?.id?.startsWith("demo-");

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#E8DFD3] bg-white p-8 text-center space-y-4 shadow-lift">
          <div className="h-12 w-12 rounded-2xl bg-terracotta-50 text-terracotta-700 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#221B15]">Sign In Required</h2>
          <p className="text-xs text-[#756350]">
            Please sign in or launch a demo session to access and customize your profile settings.
          </p>
          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-terracotta-600 px-6 py-3 text-xs font-bold text-white shadow-warm hover:bg-terracotta-700 transition-colors"
          >
            Go to Authentication Gateway →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-[#E8DFD3] bg-white p-6 sm:p-10 shadow-lift space-y-8 animate-fadeInUp">
        
        {/* Header */}
        <div className="space-y-2 border-b border-[#E8DFD3] pb-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta-200 bg-terracotta-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-terracotta-700">
              Account Preferences
            </span>
            {isDemo && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Demo Session
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#221B15]">
            Profile &amp; Role Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#756350] leading-relaxed">
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
        <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#756350]">
              Assigned Authorization Role
            </span>
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border self-start sm:self-auto",
                isTechnical
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : "border-terracotta-200 bg-terracotta-50 text-terracotta-800"
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", isTechnical ? "bg-amber-600" : "bg-terracotta-600")} />
              {isTechnical ? "Technical Mode (Hydrology Engineer)" : "Citizen Mode (Resident Observer)"}
            </span>
          </div>

          <div className="text-xs text-[#554638] space-y-1 leading-relaxed">
            <p className="font-semibold text-[#221B15]">
              {isTechnical
                ? "Full analytical access: Manning conduit hydraulics, GVF backwater curves, and counterfactual mitigation runs."
                : "Civic access: Local waterlogging reporting, community crowd-sourced alerts, and emergency drainage hotlines."}
            </p>
            <p className="text-[11px] text-[#756350] italic pt-1 border-t border-[#E8DFD3]/80">
              Role is strictly assigned to your authenticated credential and cannot be altered here. Cross-mode switching is disabled to maintain empirical data provenance.
            </p>
          </div>
        </div>

        {/* PROFILE SETTINGS FORM */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-[#554638]">
                Full Name <span className="text-terracotta-600">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                placeholder="Dr. R. Ramanathan"
                className={clsx(
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#221B15] placeholder-[#B5A493] transition-colors focus:outline-none focus:ring-2",
                  fieldErrors.fullName
                    ? "border-red-500 focus:ring-red-400"
                    : "border-[#E0D5C7] focus:border-terracotta-500 focus:ring-terracotta-500/20"
                )}
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-600 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#554638]">
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
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#221B15] placeholder-[#B5A493] transition-colors focus:outline-none focus:ring-2",
                  fieldErrors.phone
                    ? "border-red-500 focus:ring-red-400"
                    : "border-[#E0D5C7] focus:border-terracotta-500 focus:ring-terracotta-500/20"
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
              <label htmlFor="department" className="block text-xs font-bold uppercase tracking-wider text-[#554638]">
                Department / Agency
              </label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isSaving}
                placeholder="GCC Stormwater Drainage Dept"
                className="w-full rounded-xl border border-[#E0D5C7] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#221B15] placeholder-[#B5A493] transition-colors focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20"
              />
            </div>

            {/* Primary Catchment / Ward */}
            <div className="space-y-1.5">
              <label htmlFor="primaryWard" className="block text-xs font-bold uppercase tracking-wider text-[#554638]">
                Primary Monitored Ward
              </label>
              <select
                id="primaryWard"
                value={primaryWard}
                onChange={(e) => setPrimaryWard(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-[#E0D5C7] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#221B15] transition-colors focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 cursor-pointer"
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
          <div className="rounded-2xl border border-[#E8DFD3] p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#554638] block">
              Automated Notification Preferences
            </span>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  disabled={isSaving}
                  className="mt-1 h-4 w-4 rounded border-[#E0D5C7] text-terracotta-600 focus:ring-terracotta-500/30 cursor-pointer"
                />
                <div>
                  <p className="text-xs font-semibold text-[#221B15]">Email Causal Bulletins</p>
                  <p className="text-[11px] text-[#756350]">
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
                  className="mt-1 h-4 w-4 rounded border-[#E0D5C7] text-terracotta-600 focus:ring-terracotta-500/30 cursor-pointer"
                />
                <div>
                  <p className="text-xs font-semibold text-[#221B15]">Urgent Inundation Alerts (SMS)</p>
                  <p className="text-[11px] text-[#756350]">
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
              className="w-full sm:w-auto flex-1 rounded-2xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full sm:w-auto rounded-2xl border border-[#E0D5C7] bg-[#FAF7F2] px-6 py-3.5 text-xs font-semibold text-[#554638] text-center hover:bg-white hover:text-[#221B15] transition-colors"
            >
              Continue to Application →
            </Link>
          </div>
        </form>

        {/* QUICK ROLE DESTINATION SHORTCUTS */}
        <div className="border-t border-[#E8DFD3] pt-5 flex items-center justify-between text-xs text-[#756350]">
          <span>Enforced Destination:</span>
          {isTechnical ? (
            <Link
              href="/investigations/new"
              className="font-semibold text-terracotta-700 hover:text-terracotta-900 underline underline-offset-4"
            >
              Investigation Suite (/investigations/new) →
            </Link>
          ) : (
            <Link
              href="/hub"
              className="font-semibold text-terracotta-700 hover:text-terracotta-900 underline underline-offset-4"
            >
              Citizen Observer Hub (/hub) →
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

