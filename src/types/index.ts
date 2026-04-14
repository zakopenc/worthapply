// ============================================
// WorthApply Type Definitions
// ============================================

import type { ApplicationStatus } from '@/lib/application-status';

// Profile
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  current_company: string | null;
  location: string | null;
  years_experience: number | null;
  preferred_titles: string[];
  target_industries: string[];
  work_preference: string[];
  salary_min: number | null;
  salary_max: number | null;
  open_to_relocation: boolean;
  preferred_locations: string[];
  onboarding_complete: boolean;
  theme: 'light' | 'dark';
  plan: 'free' | 'pro';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

// Resume
export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  raw_text: string | null;
  parsed_data: ParsedResumeData | null;
  is_active: boolean;
  parse_status: 'pending' | 'processing' | 'complete' | 'failed';
  items_extracted: number;
  created_at: string;
}

export interface ParsedResumeData {
  achievements: Achievement[];
  skills: {
    technical: string[];
    product: string[];
    leadership: string[];
    domain: string[];
    soft: string[];
  };
  tools: { name: string; proficiency: string }[];
  work_history: WorkHistoryItem[];
  education: EducationItem[];
  leadership_stories: LeadershipStory[];
}

export interface Achievement {
  text: string;
  metrics: string;
  tags: string[];
  role: string;
  company: string;
  year: string;
}

export interface WorkHistoryItem {
  company: string;
  title: string;
  start: string;
  end: string;
  highlights: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface LeadershipStory {
  text: string;
  context: string;
  impact: string;
}

// Job Analysis
export interface JobAnalysis {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_title: string;
  company: string;
  location: string;
  employment_type: string;
  job_description_raw: string;
  job_url: string | null;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  domain_score: number;
  verdict: 'apply' | 'low-priority' | 'skip';
  matched_skills: MatchedSkill[];
  skill_gaps: SkillGap[];
  recruiter_concerns: RecruiterConcern[];
  seniority_analysis: SeniorityAnalysis;
  analysis_metadata: Record<string, unknown>;
  created_at: string;
}

export interface MatchedSkill {
  skill: string;
  evidence: string;
}

export interface SkillGap {
  skill: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface RecruiterConcern {
  concern: string;
  severity: string;
  mitigation: string;
}

export interface SeniorityAnalysis {
  role_level: string;
  user_level: string;
  assessment: string;
  is_match: boolean;
}

// Application
export interface Application {
  id: string;
  user_id: string;
  analysis_id: string | null;
  job_title: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  applied_date: string | null;
  source: string | null;
  notes: string | null;
  salary_info: string | null;
  interview_stage: string | null;
  ghost_flagged: boolean;
  follow_up_sent: boolean;
  next_step: string | null;
  created_at: string;
  updated_at: string;
  analysis?: JobAnalysis;
}

// Tailored Resume
export interface TailoredResume {
  id: string;
  user_id: string;
  application_id: string;
  analysis_id: string;
  version: number;
  content: Record<string, unknown>;
  original_score: number;
  tailored_score: number;
  ats_check: { passed: boolean; issues: string[]; keywords_matched: string[] };
  tone_check: { passed: boolean; flags: string[] };
  created_at: string;
}

// Cover Letter
export interface CoverLetter {
  id: string;
  user_id: string;
  application_id: string;
  analysis_id: string;
  recommendation: 'skip' | 'short-note' | 'full-letter';
  content: string;
  version: number;
  created_at: string;
}

// Digest Match
export interface DigestMatch {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string;
  location_type: 'remote' | 'hybrid' | 'onsite';
  salary_range: string;
  job_url: string;
  estimated_score: number;
  estimated_verdict: 'apply' | 'low-priority' | 'skip';
  matched_keywords: string[];
  digest_date: string;
  saved: boolean;
  created_at: string;
}

// Notification Preferences
export interface NotificationPreferences {
  id: string;
  user_id: string;
  daily_digest: boolean;
  ghost_alerts: boolean;
  weekly_summary: boolean;
  product_updates: boolean;
  marketing_emails: boolean;
}

// Usage Tracking
export interface UsageTracking {
  id: string;
  user_id: string;
  month: string;
  analyses_count: number;
  tailoring_count: number;
  cover_letter_count: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// Verdict type
export type Verdict = 'apply' | 'low-priority' | 'skip';

// Application Status
export type { ApplicationStatus } from '@/lib/application-status';
