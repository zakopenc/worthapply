#!/bin/bash
API_URL="https://api.supabase.com/v1/projects/hfeitnerllyoszkcqlof/database/query"
TOKEN="sbp_f9f44beb4846c35eeba3d8f3484ea94cc988621b"

run_sql() {
  local sql="$1"
  local desc="$2"
  echo "Running: $desc..."
  result=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$sql\"}" 2>&1)
  echo "Result: $result"
  echo "---"
}

run_sql "CREATE TABLE IF NOT EXISTS public.resumes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, filename TEXT NOT NULL, storage_path TEXT NOT NULL, raw_text TEXT, parsed_data JSONB, is_active BOOLEAN DEFAULT false, parse_status TEXT DEFAULT 'pending', items_extracted INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());" "resumes"

run_sql "CREATE TABLE IF NOT EXISTS public.job_analyses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, resume_id UUID REFERENCES public.resumes(id), job_title TEXT NOT NULL, company TEXT NOT NULL, location TEXT, employment_type TEXT, job_description_raw TEXT NOT NULL, job_url TEXT, overall_score INTEGER DEFAULT 0, skills_score INTEGER DEFAULT 0, experience_score INTEGER DEFAULT 0, domain_score INTEGER DEFAULT 0, verdict TEXT DEFAULT 'skip', matched_skills JSONB DEFAULT '[]', skill_gaps JSONB DEFAULT '[]', recruiter_concerns JSONB DEFAULT '[]', seniority_analysis JSONB DEFAULT '{}', analysis_metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());" "job_analyses"

run_sql "CREATE TABLE IF NOT EXISTS public.applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, analysis_id UUID REFERENCES public.job_analyses(id), job_title TEXT NOT NULL, company TEXT NOT NULL, location TEXT, status TEXT DEFAULT 'saved', applied_date DATE, source TEXT, notes TEXT, salary_info TEXT, interview_stage TEXT, ghost_flagged BOOLEAN DEFAULT false, follow_up_sent BOOLEAN DEFAULT false, next_step TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());" "applications"

run_sql "CREATE TABLE IF NOT EXISTS public.tailored_resumes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, application_id UUID REFERENCES public.applications(id) NOT NULL, analysis_id UUID REFERENCES public.job_analyses(id) NOT NULL, version INTEGER DEFAULT 1, content JSONB DEFAULT '{}', original_score INTEGER DEFAULT 0, tailored_score INTEGER DEFAULT 0, ats_check JSONB DEFAULT '{}', tone_check JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now());" "tailored_resumes"

run_sql "CREATE TABLE IF NOT EXISTS public.cover_letters (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, application_id UUID REFERENCES public.applications(id) NOT NULL, analysis_id UUID REFERENCES public.job_analyses(id) NOT NULL, recommendation TEXT DEFAULT 'skip', content TEXT, version INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now());" "cover_letters"

run_sql "CREATE TABLE IF NOT EXISTS public.digest_matches (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, job_title TEXT NOT NULL, company TEXT NOT NULL, location TEXT, location_type TEXT, salary_range TEXT, job_url TEXT, estimated_score INTEGER DEFAULT 0, estimated_verdict TEXT DEFAULT 'skip', matched_keywords TEXT[] DEFAULT '{}', digest_date DATE NOT NULL, saved BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());" "digest_matches"

run_sql "CREATE TABLE IF NOT EXISTS public.notification_preferences (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE, daily_digest BOOLEAN DEFAULT true, ghost_alerts BOOLEAN DEFAULT true, weekly_summary BOOLEAN DEFAULT false, product_updates BOOLEAN DEFAULT false, marketing_emails BOOLEAN DEFAULT false);" "notification_preferences"

run_sql "CREATE TABLE IF NOT EXISTS public.usage_tracking (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, month DATE NOT NULL, analyses_count INTEGER DEFAULT 0, UNIQUE(user_id, month));" "usage_tracking"

echo "All tables created!"
