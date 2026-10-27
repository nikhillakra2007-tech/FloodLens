export type ExperienceMode = "citizen" | "technical";

export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  experience_mode: ExperienceMode;
  profile_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export type AuthMode = "login" | "signup" | "forgot_password" | "otp";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  experience_mode: ExperienceMode;
}

export interface PhoneOtpCredentials {
  phone: string;
}

export interface VerifyOtpCredentials {
  phone: string;
  token: string;
}
