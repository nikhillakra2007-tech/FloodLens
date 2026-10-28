"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase-client";
import { formatIndianPhoneNumber, validateRedirectUrl } from "./validation";
import type {
  ExperienceMode,
  UserProfile,
  SignInCredentials,
  SignUpCredentials,
} from "./types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  experienceMode: ExperienceMode;
  setExperienceMode: (mode: ExperienceMode) => Promise<void>;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (creds: SignInCredentials) => Promise<{ error?: string }>;
  signUpWithEmail: (creds: SignUpCredentials) => Promise<{ error?: string; needEmailVerification?: boolean }>;
  signInWithGoogle: (targetDestination?: string) => Promise<{ error?: string }>;
  sendPhoneOtp: (phone: string) => Promise<{ error?: string }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  instantDemoLogin: (mode?: ExperienceMode) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_MODE_KEY = "floodlens_experience_mode";
const LOCAL_STORAGE_DEMO_KEY = "floodlens_demo_session_data";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experienceMode, setExperienceModeState] = useState<ExperienceMode>("technical");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial local preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_MODE_KEY);
      if (savedMode === "technical" || savedMode === "citizen") {
        setExperienceModeState(savedMode);
      }
    }
  }, []);

  const fetchProfile = useCallback(async (currentUser: User) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.warn("[Auth] Failed to load user profile:", error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
        if (data.experience_mode) {
          setExperienceModeState(data.experience_mode);
          localStorage.setItem(LOCAL_STORAGE_MODE_KEY, data.experience_mode);
        }
      } else {
        // Fallback profile derived from auth user metadata
        const metadata = currentUser.user_metadata || {};
        const fallbackMode: ExperienceMode =
          metadata.experience_mode === "citizen" ? "citizen" : "technical";
        const newProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email ?? null,
          full_name: metadata.full_name || currentUser.email?.split("@")[0] || "FloodLens User",
          phone: currentUser.phone ?? metadata.phone ?? null,
          experience_mode: fallbackMode,
          profile_completed: Boolean(metadata.experience_mode),
        };
        setProfile(newProfile);
        setExperienceModeState(fallbackMode);

        // Attempt idempotent upsert to profiles table
        try {
          await supabase
            .from("profiles")
            .upsert({
              id: newProfile.id,
              email: newProfile.email,
              full_name: newProfile.full_name,
              phone: newProfile.phone,
              experience_mode: newProfile.experience_mode,
              profile_completed: newProfile.profile_completed,
              updated_at: new Date().toISOString(),
            });
        } catch {
          // Ignore if RLS or offline
        }
      }
    } catch (err) {
      console.warn("[Auth] Error fetching profile:", err);
    }
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      if (typeof window !== "undefined") {
        const savedDemo = localStorage.getItem(LOCAL_STORAGE_DEMO_KEY);
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            if (parsed?.user && parsed?.profile) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              setExperienceModeState(parsed.profile.experience_mode || "technical");
            }
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
          }
        }
      }
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function initSession() {
      try {
        const {
          data: { session },
        } = await supabase!.auth.getSession();

        if (session?.user && isMounted) {
          setUser(session.user);
          await fetchProfile(session.user);
        } else if (isMounted) {
          if (typeof window !== "undefined") {
            const savedDemo = localStorage.getItem(LOCAL_STORAGE_DEMO_KEY);
            if (savedDemo) {
              try {
                const parsed = JSON.parse(savedDemo);
                if (parsed?.user && parsed?.profile) {
                  setUser(parsed.user);
                  setProfile(parsed.profile);
                  setExperienceModeState(parsed.profile.experience_mode || "technical");
                  if (isMounted) setIsLoading(false);
                  return;
                }
              } catch {
                localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
              }
            }
          }
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn("[Auth] Error initializing session:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const setExperienceMode = async (mode: ExperienceMode) => {
    setExperienceModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_MODE_KEY, mode);
    }

    if (user && profile) {
      const updatedProfile = { ...profile, experience_mode: mode, updated_at: new Date().toISOString() };
      setProfile(updatedProfile);

      if (user.id.startsWith("demo-") && typeof window !== "undefined") {
        localStorage.setItem(
          LOCAL_STORAGE_DEMO_KEY,
          JSON.stringify({
            user: { ...user, user_metadata: { ...user.user_metadata, experience_mode: mode } },
            profile: updatedProfile,
          })
        );
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase
            .from("profiles")
            .update({ experience_mode: mode, updated_at: new Date().toISOString() })
            .eq("id", user.id);
        } catch (err) {
          console.warn("[Auth] Failed to persist experience mode to backend profile:", err);
        }
      }
    }
  };

  const signInWithEmail = async (creds: SignInCredentials) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        error: "Supabase authentication is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: creds.email.trim().toLowerCase(),
        password: creds.password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user);
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "An unexpected error occurred during sign in." };
    }
  };

  const signUpWithEmail = async (creds: SignUpCredentials) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        error: "Supabase authentication is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
      };
    }

    try {
      let formattedPhone: string | undefined = undefined;
      if (creds.phone && creds.phone.trim()) {
        const phoneRes = formatIndianPhoneNumber(creds.phone);
        if (phoneRes.isValid) {
          formattedPhone = phoneRes.e164;
        }
      }

      const emailNormalized = creds.email.trim().toLowerCase();
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: emailNormalized,
        password: creds.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: creds.full_name.trim(),
            experience_mode: creds.experience_mode,
            phone: formattedPhone,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Check if email confirmation is required by Supabase project settings
      const needEmailVerification = Boolean(data.user && !data.session);

      if (data.user) {
        setUser(data.user);
        // Persist local preference immediately
        setExperienceModeState(creds.experience_mode);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_MODE_KEY, creds.experience_mode);
        }

        // Create profile row if session was established immediately
        if (data.session) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: emailNormalized,
              full_name: creds.full_name.trim(),
              phone: formattedPhone || null,
              experience_mode: creds.experience_mode,
              profile_completed: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } catch {
            // Ignore if RLS or offline
          }
          await fetchProfile(data.user);
        }
      }

      return { needEmailVerification };
    } catch (err: any) {
      return { error: err.message || "An error occurred during account creation." };
    }
  };

  const signInWithGoogle = async (targetDestination?: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        error: "Google Sign-In requires Supabase authentication configuration. Please configure Supabase and Google OAuth credentials.",
      };
    }

    try {
      const safeNext = validateRedirectUrl(targetDestination, "/hub");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "Failed to initiate Google authentication." };
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        error: "SMS OTP authentication is not configured in this environment.",
      };
    }

    const formatted = formatIndianPhoneNumber(phone);
    if (!formatted.isValid) {
      return { error: formatted.error || "Invalid Indian mobile number." };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formatted.e164,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "Failed to request SMS OTP." };
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        error: "SMS OTP authentication is not configured in this environment.",
      };
    }

    const formatted = formatIndianPhoneNumber(phone);
    if (!formatted.isValid) {
      return { error: formatted.error || "Invalid Indian mobile number." };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted.e164,
        token: token.trim(),
        type: "sms",
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user);
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "Invalid or expired verification code." };
    }
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        error: "Supabase authentication is not configured.",
      };
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${origin}/auth/forgot-password?mode=reset`,
      });

      if (error) {
        return { error: error.message };
      }

      return {
        message: "Password recovery instructions have been dispatched to your email address.",
      };
    } catch (err: any) {
      return { error: err.message || "Failed to send password recovery email." };
    }
  };

  const instantDemoLogin = async (mode: ExperienceMode = "technical") => {
    const isTech = mode === "technical";
    const demoId = isTech ? "demo-technical-officer" : "demo-citizen-user";
    const demoName = isTech ? "Dr. K. Senthil Nathan" : "Priya Ramanathan";
    const demoEmail = isTech ? "senthil.nathan@gcc.chennai.gov.in" : "priya.ramanathan@velachery.org";
    const demoRole = isTech ? "GCC Senior Hydrologist & SWD Lead" : "Velachery Ward 170 Resident Observer";

    const demoUser: User = {
      id: demoId,
      app_metadata: { provider: "demo" },
      user_metadata: {
        full_name: demoName,
        experience_mode: mode,
        role_title: demoRole,
        is_demo: true,
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: demoEmail,
      role: "authenticated",
      updated_at: new Date().toISOString(),
    };

    const demoProfile: UserProfile = {
      id: demoId,
      email: demoEmail,
      full_name: demoName,
      phone: "+919840123456",
      experience_mode: mode,
      profile_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(demoUser);
    setProfile(demoProfile);
    setExperienceModeState(mode);

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_MODE_KEY, mode);
      localStorage.setItem(
        LOCAL_STORAGE_DEMO_KEY,
        JSON.stringify({ user: demoUser, profile: demoProfile })
      );
      document.cookie = "floodlens_demo_session=1; path=/; max-age=86400; SameSite=Lax";
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("[Auth] Error during sign out:", err);
      }
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
      document.cookie = "floodlens_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/";
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        experienceMode,
        setExperienceMode,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        resetPassword,
        instantDemoLogin,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
