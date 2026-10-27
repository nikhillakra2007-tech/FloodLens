-- ==============================================================================
-- FloodLens Authentication Gateway: User Profiles Schema & RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  experience_mode TEXT NOT NULL DEFAULT 'citizen' CHECK (experience_mode IN ('citizen', 'technical')),
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user signup automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_full_name TEXT;
  raw_experience_mode TEXT;
  raw_phone TEXT;
BEGIN
  raw_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  raw_experience_mode := coalesce(new.raw_user_meta_data->>'experience_mode', 'citizen');
  raw_phone := coalesce(new.phone, new.raw_user_meta_data->>'phone');

  IF raw_experience_mode NOT IN ('citizen', 'technical') THEN
    raw_experience_mode := 'citizen';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, experience_mode, profile_completed, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    raw_full_name,
    raw_phone,
    raw_experience_mode,
    (new.raw_user_meta_data->>'experience_mode' IS NOT NULL),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to invoke on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
