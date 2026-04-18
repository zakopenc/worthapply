# Required Database Schema for Dashboard

The dashboard now uses **real user data from Supabase**. The following tables must exist:

## 1. profiles

Stores user profile information.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'premium'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## 2. applications

Stores job applications.

```sql
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'applied', 'screening', 'interviewing', 'offered', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  response_date TIMESTAMPTZ, -- When company responded
  interview_date TIMESTAMPTZ, -- Scheduled interview date
  notes TEXT,
  job_url TEXT,
  salary_range TEXT
);

-- RLS Policy
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id);
```

## 3. job_analyses

Stores job analysis results.

```sql
CREATE TABLE job_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT,
  job_title TEXT,
  match_score INTEGER, -- 0-100
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  job_description TEXT,
  analysis_results JSONB -- Detailed analysis data
);

-- RLS Policy
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analyses"
  ON job_analyses FOR ALL
  USING (auth.uid() = user_id);
```

## Dashboard Queries

The dashboard fetches:

1. **User Profile**: `profiles` table
2. **Applications**: All user applications
3. **Job Analyses**: Recent analyses (last 10)

### Statistics Calculated:

- **Active Applications**: Count where status IN ('applied', 'interviewing', 'screening')
- **Success Rate**: (interviews / total applications) * 100
- **Avg Response Time**: Average days between created_at and response_date
- **Scheduled Interviews**: Count where interview_date > NOW()

### Activity Feed:

Combines:
- Recent job_analyses (type: "analysis")
- Recent applications (type: "application")

Sorted by timestamp, showing last 5.

## Setup Instructions

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the CREATE TABLE statements above
4. Verify RLS policies are enabled
5. Test by logging in and viewing dashboard

## Optional: Seed Data for Testing

```sql
-- Insert test application
INSERT INTO applications (user_id, company_name, job_title, status)
VALUES (auth.uid(), 'Test Company', 'Software Engineer', 'applied');

-- Insert test analysis
INSERT INTO job_analyses (user_id, company_name, job_title, match_score, completed)
VALUES (auth.uid(), 'Test Company', 'Software Engineer', 85, true);
```

## Verification

Dashboard should now show:
- ✅ Real user name/email from auth
- ✅ Real application counts
- ✅ Calculated success rate
- ✅ Real activity feed
- ✅ Dynamic next steps

If dashboard is empty, check:
1. Are you logged in?
2. Do the tables exist?
3. Are RLS policies correct?
4. Have you added any data?
