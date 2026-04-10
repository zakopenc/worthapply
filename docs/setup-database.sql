-- WorthApply Database Schema Setup
-- Run this in Supabase SQL Editor or via migration

-- ======================
-- 1. PROFILES TABLE
-- ======================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'premium'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ======================
-- 2. APPLICATIONS TABLE
-- ======================

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'applied', 'screening', 'interviewing', 'offered', 'rejected', 'wishlist'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  response_date TIMESTAMPTZ, -- When company responded
  interview_date TIMESTAMPTZ, -- Scheduled interview date
  notes TEXT,
  job_url TEXT,
  salary_range TEXT,
  location TEXT,
  job_description TEXT
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own applications" ON applications;
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
DROP POLICY IF EXISTS "Users can delete own applications" ON applications;

-- RLS Policies
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);

-- ======================
-- 3. JOB_ANALYSES TABLE
-- ======================

CREATE TABLE IF NOT EXISTS job_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT,
  job_title TEXT,
  match_score INTEGER, -- 0-100
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  job_description TEXT,
  job_url TEXT,
  analysis_results JSONB -- Detailed analysis data
);

-- Enable RLS
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own analyses" ON job_analyses;
DROP POLICY IF EXISTS "Users can view own analyses" ON job_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON job_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON job_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON job_analyses;

-- RLS Policies
CREATE POLICY "Users can view own analyses"
  ON job_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON job_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON job_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON job_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ======================
-- 4. INDEXES FOR PERFORMANCE
-- ======================

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_analyses_user_id ON job_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_job_analyses_created_at ON job_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_analyses_match_score ON job_analyses(match_score DESC);

-- ======================
-- 5. UPDATED_AT TRIGGER
-- ======================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
DROP TRIGGER IF EXISTS update_job_analyses_updated_at ON job_analyses;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_analyses_updated_at
  BEFORE UPDATE ON job_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- SUCCESS MESSAGE
-- ======================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema setup complete!';
  RAISE NOTICE '   - profiles table created';
  RAISE NOTICE '   - applications table created';
  RAISE NOTICE '   - job_analyses table created';
  RAISE NOTICE '   - RLS policies enabled';
  RAISE NOTICE '   - Indexes created';
  RAISE NOTICE '   - Triggers created';
END $$;
