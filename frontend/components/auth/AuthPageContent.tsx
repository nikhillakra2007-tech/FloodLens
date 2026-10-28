"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/context";
import { validateRedirectUrl, signInSchema, signUpSchema, formatIndianPhoneNumber } from "@/lib/auth/validation";
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
  const [signUpExperienceMode, setSignUpExperienceMode] = useState<ExperienceMode>("citizen");
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
    setIsGoogleSubmitting(true);
    const result = await signInWithGoogle(nextDestination);
    if (result.error) {
      setIsGoogleSubmitting(false);
      setFormError(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[#E8DFD3] bg-white shadow-lift overflow-hidden">
        
        {/* ============================================================== */}
        {/* LEFT PANEL: FLOODLENS SCIENTIFIC IDENTITY AND CONTEXT (5 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE6] to-[#EFE6D8] p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#E8DFD3] flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Topographic & Hydrological Vector Art (SVG) */}
          <div className="absolute inset-0 opacity-15 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            <svg
              className="w-full h-full"
              viewBox="0 0 600 800"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#C85A17" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#416341" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* Topographic Contour lines */}
              <path
                d="M-50,150 Q150,50 350,220 T700,100"
                stroke="#C85A17"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="4 6"
              />
              <path
                d="M-50,260 Q200,160 380,340 T700,220"
                stroke="#C85A17"
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M-50,380 Q180,290 320,440 T700,320"
                stroke="#554638"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M-50,490 Q240,410 400,560 T700,450"
                stroke="#416341"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M-50,620 Q210,540 430,700 T700,580"
                stroke="#C85A17"
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 8"
              />
              {/* Animated River / SWD Conduit Line */}
              <path
                d="M120,-20 C220,180 80,380 280,560 C380,660 320,780 400,850"
                stroke="url(#streamGrad)"
                strokeWidth="4"
                strokeDasharray="16 12"
                className="animate-flow-stream"
              />
              {/* Catchment Nodes */}
              <circle cx="280" cy="560" r="8" fill="#C85A17" />
              <circle cx="280" cy="560" r="18" stroke="#C85A17" strokeWidth="1.5" strokeOpacity="0.5" />
              <circle cx="120" cy="180" r="6" fill="#416341" />
            </svg>
          </div>

          {/* Top: Brand Header */}
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 p-0.5 shadow-md shadow-terracotta-600/20 group-hover:scale-105 transition-all">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#FAF7F2]">
                  <svg
                    className="h-6 w-6 text-terracotta-600"
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
                <div className="flex items-center gap-2">
                  <span className="font-bold text-2xl tracking-tight text-[#221B15]">
                    Flood<span className="text-terracotta-600">Lens</span>
                  </span>
                  <span className="rounded-full border border-terracotta-200 bg-terracotta-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
                    Chennai
                  </span>
                </div>
                <p className="text-xs text-[#756350] font-medium">
                  Differential Hydrological Intelligence
                </p>
              </div>
            </Link>

            <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-terracotta-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-terracotta-700 shadow-xs backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
                <span>Secure Authentication Gateway</span>
              </span>

              <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-[#221B15] leading-tight tracking-tight">
                Understand the forces behind every flood.
              </h2>

              <p className="text-xs sm:text-sm text-[#554638] leading-relaxed">
                Access evidence-based flood insights, local impact information, and detailed hydrological investigations through one trusted platform.
              </p>
            </div>
          </div>

          {/* Bottom: Scientific Evidence Highlights */}
          <div className="relative z-10 pt-10 border-t border-[#E8DFD3]/80 space-y-4">
            <div className="space-y-2.5 text-xs text-[#554638]">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-md bg-terracotta-100 p-1 text-terracotta-700">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>
                  <strong>Twin-Catchment Pairings:</strong> Neutralizing storm variance across 200 Greater Chennai wards.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-md bg-terracotta-100 p-1 text-terracotta-700">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>
                  <strong>Physical Hydro-Mechanics:</strong> Rational runoff Q=CIA, Manning conduit capacity, and GVF backwater.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-md bg-terracotta-100 p-1 text-terracotta-700">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>
                  <strong>Role Tailoring:</strong> Instant toggle between accessible Citizen summaries and Technical engineering depth.
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#756350] font-mono">
              Backed by Copernicus DEM GLO-30 & GCC GIS SWD Data
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: INTERACTIVE AUTHENTICATION INTERFACE (7 cols)    */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            
            {/* Environment configuration alert when Supabase keys are not set */}
            {!isConfigured && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 space-y-2" role="region" aria-label="Environment Setup Notice">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <svg className="h-4 w-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Authentication Provider Setup Required</span>
                </div>
                <p className="leading-relaxed">
                  Supabase environment keys (<code className="font-mono text-amber-800">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="font-mono text-amber-800">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) are not yet configured in this deployment.
                </p>
                <div className="text-[11px] text-amber-800 pt-1">
                  Configure your Supabase project credentials in your environment variables to activate live cloud authentication.
                </div>
              </div>
            )}

            {/* Header: Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DFD3] pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setShowPhoneOtp(false);
                    setFormError(null);
                  }}
                  className={clsx(
                    "px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                    authMode === "login" && !showPhoneOtp
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
                    "px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                    authMode === "signup" && !showPhoneOtp
                      ? "bg-terracotta-600 text-white shadow-xs"
                      : "text-[#756350] hover:text-[#221B15] hover:bg-[#FAF7F2]"
                  )}
                >
                  Create Account
                </button>
              </div>

              <Link
                href="/"
                className="text-xs font-bold text-[#756350] hover:text-[#221B15] transition-colors"
              >
                ← Back to Overview
              </Link>
            </div>

            {/* Error & Success Feedback Banners */}
            {formError && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 flex items-start gap-2.5 animate-fadeIn"
                role="alert"
                aria-live="polite"
              >
                <svg className="h-4 w-4 text-red-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-start gap-2.5 animate-fadeIn"
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

            {/* INSTANT DEMO ACCOUNT ACCESS CARD */}
            <div className="rounded-2xl border border-[#E0D5C7] bg-gradient-to-br from-[#FAF7F2] via-white to-amber-50/50 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-terracotta-600 text-white shadow-xs text-xs font-bold">
                    ⚡
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#221B15] tracking-tight">
                      Instant Demo Account Access
                    </h3>
                    <p className="text-[11px] text-[#756350]">
                      Explore FloodLens immediately with verified personas — no OTP or passwords needed
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex rounded-full bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Instant Entry
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Option 1: Technical Hydrologist / GCC Engineer */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin("technical")}
                  disabled={isDemoSubmitting !== null}
                  className="group relative flex flex-col items-start p-3 rounded-xl border border-amber-300/90 bg-white hover:bg-amber-50/50 hover:border-amber-400 hover:shadow-xs active:scale-[0.99] transition-all text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-full">
                      <span>📐</span> Technical Mode
                    </span>
                    {isDemoSubmitting === "technical" && (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                    )}
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#221B15] group-hover:text-amber-900 transition-colors">
                    Dr. K. Senthil Nathan
                  </div>
                  <div className="text-[11px] text-[#756350] line-clamp-1">
                    GCC Chief Hydrologist & SWD Lead
                  </div>
                  <div className="mt-1 text-[10px] text-[#8C7A6B] flex items-center gap-1">
                    <span>Differential equations & IDF curves</span>
                    <span className="text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </button>

                {/* Option 2: Citizen Resident Observer */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin("citizen")}
                  disabled={isDemoSubmitting !== null}
                  className="group relative flex flex-col items-start p-3 rounded-xl border border-terracotta-200 bg-white hover:bg-terracotta-50/50 hover:border-terracotta-400 hover:shadow-xs active:scale-[0.99] transition-all text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-800 bg-terracotta-100/70 border border-terracotta-200 px-2 py-0.5 rounded-full">
                      <span>🏘️</span> Citizen Mode
                    </span>
                    {isDemoSubmitting === "citizen" && (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
                    )}
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#221B15] group-hover:text-terracotta-900 transition-colors">
                    Priya Ramanathan
                  </div>
                  <div className="text-[11px] text-[#756350] line-clamp-1">
                    Velachery Ward 170 Resident Observer
                  </div>
                  <div className="mt-1 text-[10px] text-[#8C7A6B] flex items-center gap-1">
                    <span>Plain language & ward risk advisories</span>
                    <span className="text-terracotta-700 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-[#E8DFD3] w-full" />
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] shrink-0">
                Or sign in with custom credentials
              </span>
              <div className="border-t border-[#E8DFD3] w-full" />
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
              /* VIEW B: GOOGLE + EMAIL FORM */
              <div className="space-y-6">
                
                {/* 1. Real Google OAuth Action */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSubmitting}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#E0D5C7] bg-white px-5 py-3.5 text-xs font-bold text-[#221B15] shadow-xs hover:bg-[#FAF7F2] hover:border-[#D5C6B3] active:translate-y-0 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGoogleSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-terracotta-600 border-t-transparent" />
                      <span>Connecting to Google OAuth...</span>
                    </>
                  ) : (
                    <>
                      {/* Google G Logo SVG */}
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

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-[#E8DFD3]" />
                  <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#756350]">
                    or continue with email
                  </span>
                </div>

                {/* SIGN IN FORM */}
                {authMode === "login" && (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="login-email"
                        className="text-xs font-bold uppercase tracking-wider text-[#756350]"
                      >
                        Email Address <span className="text-terracotta-600">*</span>
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
                        className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="login-password"
                          className="text-xs font-bold uppercase tracking-wider text-[#756350]"
                        >
                          Password <span className="text-terracotta-600">*</span>
                        </label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors"
                        >
                          Forgot password?
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
                          className="w-full px-4 py-3 pr-11 text-base sm:text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756350] hover:text-[#221B15] p-1 cursor-pointer"
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      className="w-full rounded-xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer pt-3"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <span>Sign In to FloodLens</span>
                      )}
                    </button>
                  </form>
                )}

                {/* SIGN UP FORM */}
                {authMode === "signup" && (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="signup-name"
                        className="text-xs font-bold uppercase tracking-wider text-[#756350]"
                      >
                        Full Name <span className="text-terracotta-600">*</span>
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
                        className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="signup-email"
                        className="text-xs font-bold uppercase tracking-wider text-[#756350]"
                      >
                        Email Address <span className="text-terracotta-600">*</span>
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
                        className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="signup-password"
                          className="text-xs font-bold uppercase tracking-wider text-[#756350]"
                        >
                          Password <span className="text-terracotta-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="signup-password"
                            type={showSignUpPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Min. 6 chars"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 pr-10 text-base sm:text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756350] hover:text-[#221B15] p-1 cursor-pointer"
                            aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                          >
                            {showSignUpPassword ? (
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="signup-confirm-password"
                          className="text-xs font-bold uppercase tracking-wider text-[#756350]"
                        >
                          Confirm Password <span className="text-terracotta-600">*</span>
                        </label>
                        <input
                          id="signup-confirm-password"
                          type={showSignUpPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Re-enter password"
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-[#E0D5C7] focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* Optional Indian Phone Number Input */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="signup-phone"
                        className="text-xs font-bold uppercase tracking-wider text-[#756350]"
                      >
                        Indian Mobile Number <span className="text-[11px] font-normal text-[#756350]">(Optional)</span>
                      </label>
                      <div className="flex rounded-xl border border-[#E0D5C7] bg-white shadow-xs focus-within:border-terracotta-500 focus-within:ring-2 focus-within:ring-terracotta-200 transition-all">
                        <div className="flex items-center gap-1.5 border-r border-[#E0D5C7] px-3 bg-[#FAF7F2] text-xs font-bold text-[#221B15] rounded-l-xl select-none">
                          <span role="img" aria-label="India flag">🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          id="signup-phone"
                          type="tel"
                          inputMode="numeric"
                          placeholder="9876543210 (10 digits)"
                          value={signUpPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setSignUpPhone(val);
                          }}
                          disabled={isSubmitting}
                          className="w-full border-0 px-3.5 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-0 bg-transparent"
                        />
                      </div>
                    </div>

                    {/* EXPERIENCE MODE SELECTOR */}
                    <div className="pt-2">
                      <ExperienceModeSelector
                        value={signUpExperienceMode}
                        onChange={setSignUpExperienceMode}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Scientific Data & Terms Agreement */}
                    <div className="flex items-start gap-2.5 pt-2">
                      <input
                        id="terms-checkbox"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-[#D5C6B3] text-terracotta-600 focus:ring-terracotta-500 cursor-pointer"
                        required
                      />
                      <label htmlFor="terms-checkbox" className="text-xs text-[#554638] leading-relaxed">
                        I acknowledge the FloodLens scientific attribution methodology and differential twin-catchment framework for Greater Chennai urban flood resilience.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-terracotta-600 px-6 py-3.5 text-xs font-bold text-white shadow-warm transition-all duration-300 hover:bg-terracotta-700 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer pt-3"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Creating Account & Profile...</span>
                        </>
                      ) : (
                        <span>Create Account & Continue</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Alternative Mobile OTP Trigger */}
                <div className="pt-2 border-t border-[#E8DFD3] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhoneOtp(true);
                      setFormError(null);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors cursor-pointer"
                  >
                    <span>🇮🇳</span>
                    <span>Or sign in using Indian Mobile Number & SMS OTP</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Notice */}
          <div className="pt-4 border-t border-[#E8DFD3] text-center text-[11px] text-[#756350]">
            <span>FloodLens Differential Hydrological Intelligence Platform • Greater Chennai Corporation Resilience</span>
          </div>
        </div>

      </div>
    </div>
  );
}
