import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/supabase-server";
import { validateRedirectUrl } from "@/lib/auth/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const next = validateRedirectUrl(rawNext, "/hub");

  if (code) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        // Query profile to see if onboarding is needed
        const { data: profile } = await supabase
          .from("profiles")
          .select("experience_mode, profile_completed")
          .eq("id", data.user.id)
          .single();

        if (!profile || !profile.profile_completed) {
          // Idempotent upsert with citizen default if missing
          const userMeta = data.user.user_metadata || {};
          const mode = userMeta.experience_mode === "technical" ? "technical" : "citizen";
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: userMeta.full_name || data.user.email?.split("@")[0] || "FloodLens User",
              experience_mode: mode,
              profile_completed: Boolean(userMeta.experience_mode),
              updated_at: new Date().toISOString(),
            });
          } catch {
            // Ignore if RLS or offline
          }

          if (!profile?.profile_completed && !userMeta.experience_mode) {
            return NextResponse.redirect(
              new URL(`/onboarding?next=${encodeURIComponent(next)}`, request.url)
            );
          }
        }

        return NextResponse.redirect(new URL(next, request.url));
      }
    }
  }

  // Fallback if no code or error
  return NextResponse.redirect(new URL("/auth", request.url));
}
