"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/context";
import { validateRedirectUrl, signInSchema, signUpSchema } from "@/lib/auth/validation";
import ExperienceModeSelector from "./ExperienceModeSelector";
import PhoneOtpForm from "./PhoneOtpForm";
import type { ExperienceMode } from "@/lib/auth/types";

export default function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    profile,
    isConfigured,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    instantDemoLogin,
  } = useAuth();

  const nextDestination = validateRedirectUrl(searchParams.get("next"), "/hub");
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpExperienceMode, setSignUpExperienceMode] = useState<ExperienceMode>("technical");
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Shared States
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState<ExperienceMode | null>(null);

  const handleDemoLogin = async (mode: ExperienceMode) => {
    setIsDemoSubmitting(mode);
    setFormError(null);
    try {
      await instantDemoLogin(mode);
      router.push(nextDestination);
    } catch (err: any) {
      setFormError(err.message || "Failed to initialize demo session.");
      setIsDemoSubmitting(null);
    }
  };

  // If already logged in with complete profile, redirect to destination
  useEffect(() => {
    if (user && profile) {
      if (!profile.profile_completed) {
        router.replace(`/onboarding?next=${encodeURIComponent(nextDestination)}`);
      } else {
        router.replace(nextDestination);
      }
    }
  }, [user, profile, nextDestination, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!isConfigured) {
      setFormError(
        "Cloud authentication provider is not configured in this deployment (missing NEXT_PUBLIC_SUPABASE_URL). Please use the Instant Technical Demo Access button above to explore all features."
      );
      return;
    }

    const validation = signInSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });

    if (!validation.success) {
      setFormError(validation.error.errors[0]?.message || "Invalid email or password.");
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithEmail({
      email: loginEmail,
      password: loginPassword,
    });
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      router.push(nextDestination);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!isConfigured) {
      setFormError(
        "Cloud authentication provider is not configured in this deployment (missing NEXT_PUBLIC_SUPABASE_URL). Please use the Instant Technical Demo Access button above."
      );
      return;
    }

    const validation = signUpSchema.safeParse({
      full_name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
      confirm_password: signUpConfirmPassword,
      phone: signUpPhone,
      experience_mode: signUpExperienceMode,
      accept_terms: acceptTerms,
    });

    if (!validation.success) {
      setFormError(validation.error.errors[0]?.message || "Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUpWithEmail({
      email: signUpEmail,
      password: signUpPassword,
      full_name: signUpName,
      phone: signUpPhone,
      experience_mode: signUpExperienceMode,
    });
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else if (result.needEmailVerification) {
      setFormSuccess(
        "Verification email dispatched. Please check your inbox and click the confirmation link to activate your FloodLens account."
      );
    } else {
      router.push(nextDestination);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    if (!isConfigured) {
      setFormError(
        "Google OAuth provider is not configured in this deployment (missing Supabase credentials). Please use the Instant Technical Demo Access button above to enter immediately."
      );
      return;
    }
    setIsGoogleSubmitting(true);
    const result = await signInWithGoogle(nextDestination);
    if (result.error) {
      setIsGoogleSubmitting(false);
      setFormError(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-8 sm:px-6">
      {/* Compact, balanced card container (~820px max width) */}
      <div className="w-full max-w-[820px] rounded-2xl md:rounded-3xl border border-[#E8DFD3] bg-white shadow-lift overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* ============================================================== */}
        {/* LEFT PANEL: DISTINCTIVE SCIENTIFIC HYDROLOGICAL VISUAL (38%)  */}
        {/* ============================================================== */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE6] to-[#EFE6D8] p-6 sm:p-7 border-b md:border-b-0 md:border-r border-[#E8DFD3] flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Brand Header */}
          <div className="space-y-4 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 p-0.5 shadow-sm shadow-terracotta-600/20 group-hover:scale-105 transition-all">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#FAF7F2]">
                  <svg
                    className="h-5 w-5 text-terracotta-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeWidth="1.8" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-[#221B15]">
                    Flood<span className="text-terracotta-600">Lens</span>
                  </span>
                  <span className="rounded-full border border-terracotta-200 bg-terracotta-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-terracotta-700">
                    Chennai
                  </span>
                </div>
                <p className="text-[10px] text-[#756350] font-medium leading-none">
                  Differential Hydrological Intelligence
                </p>
              </div>
            </Link>

            {/* Scientific diagram container */}
            <div className="rounded-xl border border-[#E0D5C7] bg-white/70 p-3 shadow-2xs backdrop-blur-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#756350] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
                  Hydrological Analysis Chain
                </span>
                <span className="font-mono text-[9px] text-[#8C7A6B]">
                  Q = C·I·A | GVF dy/dx
                </span>
              </div>

              {/* Lightweight Scientific Hydrological Vector Diagram */}
              <div className="w-full aspect-[4/3] relative flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 280 210"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Hydrological intelligence flow diagram illustrating rainfall, watershed contours, conduit flow, and backwater flood forecast"
                >
                  <defs>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#357ABD" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="streamGrad2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#C85A17" />
                      <stop offset="60%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                    <pattern id="hatchGrid" width="6" height="6" patternUnits="userSpaceOnUse">
                      <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke="#C85A17" strokeWidth="0.6" strokeOpacity="0.25" />
                    </pattern>
                  </defs>

                  {/* 1. Rainfall / Doppler Radar Cloud Area (Top) */}
                  <g>
                    <rect x="15" y="8" width="250" height="32" rx="6" fill="#F0F7FF" stroke="#CCE3FF" strokeWidth="1" />
                    <circle cx="34" cy="24" r="9" fill="#D6E8FA" />
                    <path d="M30 24c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#2B6CB0" strokeWidth="1.5" />
                    <text x="50" y="22" fill="#1E3A8A" fontSize="9" fontWeight="700" fontFamily="sans-serif">
                      Rainfall / Radar Cloudburst
                    </text>
                    <text x="50" y="32" fill="#3B82F6" fontSize="8" fontFamily="monospace">
                      390mm / 24h • IMD Doppler Verified
                    </text>
                    {/* Falling precipitation vectors */}
                    <path d="M190 14l-4 8M205 14l-4 8M220 14l-4 8M235 14l-4 8M250 14l-4 8" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
                  </g>

                  {/* Flow arrow 1: Rain to Catchment */}
                  <path d="M140 40v12" stroke="#2B6CB0" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow)" />

                  {/* 2. Watershed & Elevation Contours */}
                  <path d="M20 70 C80 56, 180 58, 260 74" stroke="#A89279" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                  <text x="228" y="66" fill="#8C7A6B" fontSize="7" fontFamily="monospace">12.4m DEM</text>

                  <path d="M16 100 C75 84, 185 88, 264 104" stroke="#8C7A6B" strokeWidth="1.2" fill="none" />
                  <text x="230" y="96" fill="#8C7A6B" fontSize="7" fontFamily="monospace">8.2m DEM</text>

                  {/* 3. Stormwater Drain Conduit & River Flow */}
                  <path
                    d="M30 68 C80 95, 110 130, 160 140 C200 148, 230 160, 260 175"
                    stroke="url(#streamGrad2)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Conduit Invert Slope Callout */}
                  <rect x="25" y="112" width="85" height="18" rx="4" fill="#FAF7F2" stroke="#D5C6B3" strokeWidth="0.8" />
                  <text x="30" y="124" fill="#554638" fontSize="7.5" fontWeight="600" fontFamily="sans-serif">
                    Conduit: S₀ = -0.3%
                  </text>

                  {/* 4. Surcharge / Backwater Junction Node */}
                  <circle cx="160" cy="140" r="14" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.2" />
                  <circle cx="160" cy="140" r="6" fill="#DC2626" />
                  <circle cx="160" cy="140" r="10" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="2 2" />

                  {/* Backwater Surge Label */}
                  <rect x="110" y="162" width="102" height="18" rx="4" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="0.8" />
                  <text x="115" y="174" fill="#991B1B" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">
                    +1.03m Hydraulic Head
                  </text>

                  {/* 5. Inundation Risk Polygon */}
                  <path
                    d="M160 140 C190 120, 245 130, 255 160 C240 185, 180 180, 160 140 Z"
                    fill="url(#hatchGrid)"
                    stroke="#C85A17"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text x="210" y="148" fill="#C85A17" fontSize="7" fontWeight="700" fontFamily="sans-serif">
                    Ponding
                  </text>

                  {/* Sequence Breadcrumb Labels at Bottom of Graphic */}
                  <g transform="translate(10, 194)">
                    <text x="0" y="8" fill="#756350" fontSize="7" fontWeight="700" fontFamily="sans-serif">
                      Rainfall → Watershed → Conduit Flow → Backwater → Risk Isolated
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Scientific Context & Proof Points */}
          <div className="space-y-3 pt-4 border-t border-[#E8DFD3]/80 relative z-10">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#221B15] leading-snug tracking-tight">
                Understand the forces behind every flood.
              </h2>
              <p className="text-[11px] text-[#554638] leading-relaxed pt-1">
                Explore watershed dynamics, forecast flood risk, and investigate the evidence behind hydrological decisions.
              </p>
            </div>

            <div className="space-y-1.5 text-[11px] text-[#554638]">
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-md bg-terracotta-100 text-terracotta-700 text-[10px] font-bold shrink-0">
                  ✓
                </span>
                <span>Watershed and river-flow analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-md bg-terracotta-100 text-terracotta-700 text-[10px] font-bold shrink-0">
                  ✓
                </span>
                <span>Flood-risk mapping and investigations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-md bg-terracotta-100 text-terracotta-700 text-[10px] font-bold shrink-0">
                  ✓
                </span>
                <span>Technical simulations and impact assessment</span>
              </div>
            </div>

            <div className="pt-1 text-[10px] text-[#756350] font-mono">
              Backed by Copernicus DEM GLO-30 & GCC GIS SWD Data
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: COMPACT AUTHENTICATION & DEMO ACCESS (62%)       */}
        {/* ============================================================== */}
        <div className="md:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            
            {/* Header: Gateway Title & Navigation */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E8DFD3] pb-3.5">
              <div>
                <h1 className="font-bold text-lg sm:text-xl text-[#221B15] tracking-tight">
                  Sign In to FloodLens
                </h1>
                <p className="text-xs text-[#756350]">
                  Hydrological intelligence access gateway
                </p>
              </div>
              <Link
                href="/"
                className="text-xs font-bold text-[#756350] hover:text-[#221B15] transition-colors shrink-0"
              >
                ← Overview
              </Link>
            </div>

            {/* Error & Success Feedback Banners (contextual) */}
            {formError && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800 flex items-start gap-2.5 animate-fadeIn"
                role="alert"
                aria-live="polite"
              >
                <svg className="h-4 w-4 text-red-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="leading-relaxed">{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-start gap-2.5 animate-fadeIn"
                role="status"
                aria-live="polite"
              >
                <svg className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{formSuccess}</span>
              </div>
            )}

            {/* ========================================================== */}
            {/* 1. VISUALLY DOMINANT ACTION: INSTANT TECHNICAL DEMO ACCESS */}
            {/* ========================================================== */}
            <div className="rounded-2xl border-2 border-terracotta-500/80 bg-gradient-to-br from-terracotta-50/70 via-white to-amber-50/40 p-4 sm:p-4.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-800 bg-terracotta-100/90 border border-terracotta-200 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600 animate-pulse" />
                  Instant Demo Access
                </span>
                <span className="text-[11px] font-semibold text-terracotta-700">
                  No setup or passwords needed
                </span>
              </div>

              {/* Dominant Primary Button */}
              <button
                type="button"
                onClick={() => handleDemoLogin("technical")}
                disabled={isDemoSubmitting !== null}
                className="w-full flex items-center justify-between gap-3 rounded-xl bg-terracotta-600 px-4 py-3 sm:py-3.5 text-left text-white shadow-warm hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-70 group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                    <span>⚡ Enter Technical Demo</span>
                    <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-medium tracking-normal text-white">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-terracotta-100 font-normal">
                    Dr. K. Senthil Nathan • GCC Lead Hydrologist & SWD Lead
                  </p>
                </div>
                {isDemoSubmitting === "technical" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent shrink-0" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white group-hover:translate-x-1 transition-transform shrink-0 font-bold">
                    →
                  </span>
                )}
              </button>

              {/* Citizen Persona Secondary Link */}
              <div className="flex items-center justify-between pt-1 border-t border-terracotta-200/60 text-xs">
                <span className="text-[#756350] text-[11px]">Looking for resident flood advisories?</span>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("citizen")}
                  disabled={isDemoSubmitting !== null}
                  className="font-bold text-terracotta-700 hover:text-terracotta-800 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 text-xs"
                >
                  <span>Citizen Mode (Priya Ramanathan)</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#E8DFD3]" />
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] shrink-0">
                or sign in with credentials
              </span>
              <div className="w-full border-t border-[#E8DFD3]" />
            </div>

            {/* VIEW A: PHONE OTP FORM */}
            {showPhoneOtp ? (
              <PhoneOtpForm
                onSuccess={() => {
                  router.push(nextDestination);
                }}
                onCancel={() => setShowPhoneOtp(false)}
              />
            ) : (
              /* VIEW B: GOOGLE + EMAIL AUTH */
              <div className="space-y-4">
                
                {/* Mode Switcher Tabs (Sign In / Create Account) */}
                <div className="flex items-center gap-2 border-b border-[#E8DFD3] pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setShowPhoneOtp(false);
                      setFormError(null);
                    }}
                    className={clsx(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                      authMode === "login"
                        ? "bg-terracotta-600 text-white shadow-xs"
                        : "text-[#756350] hover:text-[#221B15] hover:bg-[#FAF7F2]"
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setShowPhoneOtp(false);
                      setFormError(null);
                    }}
                    className={clsx(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                      authMode === "signup"
                        ? "bg-terracotta-600 text-white shadow-xs"
                        : "text-[#756350] hover:text-[#221B15] hover:bg-[#FAF7F2]"
                    )}
                  >
                    Create Account
                  </button>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[#E0D5C7] bg-white px-4 py-2.5 text-xs font-bold text-[#221B15] shadow-xs hover:bg-[#FAF7F2] hover:border-[#D5C6B3] active:translate-y-0 transition-all duration-150 disabled:opacity-60 cursor-pointer"
                >
                  {isGoogleSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
                      <span>Connecting to Google OAuth...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* SIGN IN FORM */}
                {authMode === "login" && (
                  <form onSubmit={handleSignIn} className="space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="login-email"
                        className="text-[11px] font-bold uppercase tracking-wider text-[#756350]"
                      >
                        Email Address
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="analyst@chennai-corporation.gov.in"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="login-password"
                          className="text-[11px] font-bold uppercase tracking-wider text-[#756350]"
                        >
                          Password
                        </label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-[11px] font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full px-3.5 py-2 pr-10 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#756350] hover:text-[#221B15] p-1 cursor-pointer"
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-[#221B15] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-black active:translate-y-0 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Verifying..." : "Sign In to Account"}
                    </button>
                  </form>
                )}

                {/* SIGN UP FORM */}
                {authMode === "signup" && (
                  <form onSubmit={handleSignUp} className="space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="signup-name"
                        className="text-[11px] font-bold uppercase tracking-wider text-[#756350]"
                      >
                        Full Name
                      </label>
                      <input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Dr. Rajesh Raman"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="signup-email"
                        className="text-[11px] font-bold uppercase tracking-wider text-[#756350]"
                      >
                        Email Address
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder="rajesh@resilience-chennai.org"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label
                          htmlFor="signup-password"
                          className="text-[11px] font-bold uppercase tracking-wider text-[#756350]"
                        >
                          Password
                        </label>
                        <input
                          id="signup-password"
                          type={showSignUpPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Min 6 chars"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="signup-confirm-password"
                          className="text-[11px] font-bold uppercase tracking-wider text-[#756350]"
                        >
                          Confirm
                        </label>
                        <input
                          id="signup-confirm-password"
                          type={showSignUpPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Repeat password"
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* Role / Experience Mode Selector */}
                    <div className="pt-1">
                      <ExperienceModeSelector
                        value={signUpExperienceMode}
                        onChange={setSignUpExperienceMode}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        id="terms-checkbox"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-[#D5C6B3] text-terracotta-600 focus:ring-terracotta-500 cursor-pointer"
                        required
                      />
                      <label htmlFor="terms-checkbox" className="text-[11px] text-[#554638] leading-tight">
                        I acknowledge FloodLens twin-catchment attribution methodology for Greater Chennai Corporation.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-terracotta-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-terracotta-700 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Creating..." : "Create Account & Continue"}
                    </button>
                  </form>
                )}

                {/* Mobile Phone OTP Link */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhoneOtp(true);
                      setFormError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors cursor-pointer"
                  >
                    <span>🇮🇳</span>
                    <span>Sign in with Indian Mobile Number & SMS OTP</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compact Footer Note */}
          <div className="pt-3 border-t border-[#E8DFD3] text-center text-[10px] text-[#756350]">
            Greater Chennai Corporation Differential Hydrological Intelligence
          </div>
        </div>

      </div>
    </div>
  );
}
