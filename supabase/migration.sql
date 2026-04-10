-- WorthApply Database Schema Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  current_company TEXT,
  location TEXT,
  years_experience INTEGER,
  preferred_titles TEXT[] DEFAULT '{}',
  target_industries TEXT[] DEFAULT '{}',
  work_preference TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  open_to_relocation BOOLEAN DEFAULT false,
  preferred_locations TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'light',
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  raw_text TEXT,
  parsed_data JSONB,
  is_active BOOLEAN DEFAULT false,
  parse_status TEXT DEFAULT 'pending',
  items_extracted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- JOB ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.job_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id),
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  employment_type TEXT,
  job_description_raw TEXT NOT NULL,
  job_url TEXT,
  overall_score INTEGER DEFAULT 0,
  skills_score INTEGER DEFAULT 0,
  experience_score INTEGER DEFAULT 0,
  domain_score INTEGER DEFAULT 0,
  verdict TEXT DEFAULT 'skip',
  matched_skills JSONB DEFAULT '[]',
  skill_gaps JSONB DEFAULT '[]',
  recruiter_concerns JSONB DEFAULT '[]',
  seniority_analysis JSONB DEFAULT '{}',
  analysis_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.job_analyses(id),
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'saved',
  applied_date DATE,
  source TEXT,
  notes TEXT,
  salary_info TEXT,
  interview_stage TEXT,
  ghost_flagged BOOLEAN DEFAULT false,
  follow_up_sent BOOLEAN DEFAULT false,
  next_step TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TAILORED RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.tailored_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) NOT NULL,
  analysis_id UUID REFERENCES public.job_analyses(id) NOT NULL,
  version INTEGER DEFAULT 1,
  content JSONB DEFAULT '{}',
  original_score INTEGER DEFAULT 0,
  tailored_score INTEGER DEFAULT 0,
  ats_check JSONB DEFAULT '{}',
  tone_check JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COVER LETTERS TABLE
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) NOT NULL,
  analysis_id UUID REFERENCES public.job_analyses(id) NOT NULL,
  recommendation TEXT DEFAULT 'skip',
  content TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DIGEST MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.digest_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  location_type TEXT,
  salary_range TEXT,
  job_url TEXT,
  estimated_score INTEGER DEFAULT 0,
  estimated_verdict TEXT DEFAULT 'skip',
  matched_keywords TEXT[] DEFAULT '{}',
  digest_date DATE NOT NULL,
  saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  daily_digest BOOLEAN DEFAULT true,
  ghost_alerts BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT false,
  product_updates BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false
);

-- USAGE TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  analyses_count INTEGER DEFAULT 0,
  tailoring_count INTEGER DEFAULT 0,
  cover_letter_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

ALTER TABLE public.usage_tracking
  ADD COLUMN IF NOT EXISTS tailoring_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cover_letter_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.reserve_monthly_usage(
  p_feature TEXT,
  p_limit INTEGER DEFAULT NULL,
  p_month DATE DEFAULT NULL
)
RETURNS TABLE(allowed BOOLEAN, used INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_count INTEGER := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  p_month := COALESCE(p_month, date_trunc('month', timezone('utc', now()))::date);

  IF p_feature NOT IN ('analyses', 'tailoring', 'cover_letters') THEN
    RAISE EXCEPTION 'Unsupported usage feature: %', p_feature;
  END IF;

  INSERT INTO public.usage_tracking (user_id, month)
  VALUES (current_user_id, p_month)
  ON CONFLICT (user_id, month) DO NOTHING;

  SELECT CASE
    WHEN p_feature = 'analyses' THEN analyses_count
    WHEN p_feature = 'tailoring' THEN tailoring_count
    ELSE cover_letter_count
  END
  INTO current_count
  FROM public.usage_tracking
  WHERE user_id = current_user_id
    AND month = p_month
  FOR UPDATE;

  IF p_limit IS NOT NULL AND current_count >= p_limit THEN
    RETURN QUERY SELECT false, current_count;
    RETURN;
  END IF;

  UPDATE public.usage_tracking
  SET analyses_count = analyses_count + CASE WHEN p_feature = 'analyses' THEN 1 ELSE 0 END,
      tailoring_count = tailoring_count + CASE WHEN p_feature = 'tailoring' THEN 1 ELSE 0 END,
      cover_letter_count = cover_letter_count + CASE WHEN p_feature = 'cover_letters' THEN 1 ELSE 0 END
  WHERE user_id = current_user_id
    AND month = p_month
  RETURNING CASE
    WHEN p_feature = 'analyses' THEN analyses_count
    WHEN p_feature = 'tailoring' THEN tailoring_count
    ELSE cover_letter_count
  END
  INTO current_count;

  RETURN QUERY SELECT true, current_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_monthly_usage(
  p_feature TEXT,
  p_month DATE DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_count INTEGER := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  p_month := COALESCE(p_month, date_trunc('month', timezone('utc', now()))::date);

  IF p_feature NOT IN ('analyses', 'tailoring', 'cover_letters') THEN
    RAISE EXCEPTION 'Unsupported usage feature: %', p_feature;
  END IF;

  INSERT INTO public.usage_tracking (user_id, month)
  VALUES (current_user_id, p_month)
  ON CONFLICT (user_id, month) DO NOTHING;

  UPDATE public.usage_tracking
  SET analyses_count = CASE
        WHEN p_feature = 'analyses' THEN GREATEST(analyses_count - 1, 0)
        ELSE analyses_count
      END,
      tailoring_count = CASE
        WHEN p_feature = 'tailoring' THEN GREATEST(tailoring_count - 1, 0)
        ELSE tailoring_count
      END,
      cover_letter_count = CASE
        WHEN p_feature = 'cover_letters' THEN GREATEST(cover_letter_count - 1, 0)
        ELSE cover_letter_count
      END
  WHERE user_id = current_user_id
    AND month = p_month
  RETURNING CASE
    WHEN p_feature = 'analyses' THEN analyses_count
    WHEN p_feature = 'tailoring' THEN tailoring_count
    ELSE cover_letter_count
  END
  INTO current_count;

  RETURN current_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_tailored_resume_version(
  p_application_id UUID,
  p_analysis_id UUID,
  p_content JSONB,
  p_original_score INTEGER,
  p_tailored_score INTEGER,
  p_ats_check JSONB,
  p_tone_check JSONB
)
RETURNS public.tailored_resumes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  next_version INTEGER := 1;
  inserted_row public.tailored_resumes%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.applications
    WHERE id = p_application_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.job_analyses
    WHERE id = p_analysis_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Analysis not found';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('tailored_resumes'), hashtext(current_user_id::text || ':' || p_application_id::text));

  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.tailored_resumes
  WHERE user_id = current_user_id
    AND application_id = p_application_id;

  INSERT INTO public.tailored_resumes (
    user_id,
    application_id,
    analysis_id,
    version,
    content,
    original_score,
    tailored_score,
    ats_check,
    tone_check
  )
  VALUES (
    current_user_id,
    p_application_id,
    p_analysis_id,
    next_version,
    COALESCE(p_content, '{}'::jsonb),
    COALESCE(p_original_score, 0),
    COALESCE(p_tailored_score, 0),
    COALESCE(p_ats_check, '{}'::jsonb),
    COALESCE(p_tone_check, '{}'::jsonb)
  )
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_cover_letter_version(
  p_application_id UUID,
  p_analysis_id UUID,
  p_recommendation TEXT,
  p_content TEXT
)
RETURNS public.cover_letters
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  next_version INTEGER := 1;
  inserted_row public.cover_letters%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.applications
    WHERE id = p_application_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.job_analyses
    WHERE id = p_analysis_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Analysis not found';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('cover_letters'), hashtext(current_user_id::text || ':' || p_application_id::text));

  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.cover_letters
  WHERE user_id = current_user_id
    AND application_id = p_application_id;

  INSERT INTO public.cover_letters (
    user_id,
    application_id,
    analysis_id,
    recommendation,
    content,
    version
  )
  VALUES (
    current_user_id,
    p_application_id,
    p_analysis_id,
    COALESCE(p_recommendation, 'skip'),
    p_content,
    next_version
  )
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$;

-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS POLICIES: resumes
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- RLS POLICIES: job_analyses
CREATE POLICY "Users can view own analyses" ON public.job_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.job_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON public.job_analyses FOR UPDATE USING (auth.uid() = user_id);

-- RLS POLICIES: applications
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON public.applications FOR DELETE USING (auth.uid() = user_id);

-- RLS POLICIES: tailored_resumes
CREATE POLICY "Users can view own tailored resumes" ON public.tailored_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tailored resumes" ON public.tailored_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS POLICIES: cover_letters
CREATE POLICY "Users can view own cover letters" ON public.cover_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cover letters" ON public.cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own cover letters" ON public.cover_letters FOR DELETE USING (auth.uid() = user_id);

-- RLS POLICIES: digest_matches
CREATE POLICY "Users can view own digest" ON public.digest_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own digest" ON public.digest_matches FOR UPDATE USING (auth.uid() = user_id);

-- RLS POLICIES: notification_preferences
CREATE POLICY "Users can view own preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- RLS POLICIES: usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.usage_tracking FOR UPDATE USING (auth.uid() = user_id);

GRANT EXECUTE ON FUNCTION public.reserve_monthly_usage(TEXT, INTEGER, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_monthly_usage(TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tailored_resume_version(UUID, UUID, JSONB, INTEGER, INTEGER, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_cover_letter_version(UUID, UUID, TEXT, TEXT) TO authenticated;

-- JOB SCRAPES TABLE (for LinkedIn job scraping feature)
CREATE TABLE IF NOT EXISTS public.job_scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  search_criteria JSONB NOT NULL,
  results JSONB NOT NULL,
  results_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_scrapes_user_id ON public.job_scrapes(user_id);
CREATE INDEX idx_job_scrapes_created_at ON public.job_scrapes(created_at);

-- Enable RLS
ALTER TABLE public.job_scrapes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own job scrapes" ON public.job_scrapes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job scrapes" ON public.job_scrapes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job scrapes" ON public.job_scrapes
  FOR DELETE USING (auth.uid() = user_id);
