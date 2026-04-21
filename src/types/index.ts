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
  plan: 'free' | 'pro' | 'premium';
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
export type TailoredBulletFramework = 'PAR' | 'CAR';
export type SeniorityLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp';
export type AtsFamily = 'greenhouse' | 'lever' | 'workday' | 'ashby' | 'taleo' | 'icims' | 'smartrecruiters' | 'unknown';

export interface TailoredBullet {
  original: string;
  tailored: string;
  reason: string;
  framework?: TailoredBulletFramework;
  needs_metric?: boolean;
  metric_question?: string;
}

export interface TailoredResumeContent {
  tailored_summary?: string;
  tailored_bullets?: TailoredBullet[];
  reordered_skills?: string[];
  length_guidance?: { recommended_pages: 1 | 2; reason: string };
  seniority_match?: { candidate_level: SeniorityLevel; target_level: SeniorityLevel; gap_note: string };
  red_flags?: { type: string; severity: 'low' | 'medium' | 'high'; explanation: string; action: string }[];
  ats_family?: AtsFamily;
  portfolio_suggestion?: { needed: boolean; reason: string; suggestion: string };
}

export interface TailoredResume {
  id: string;
  user_id: string;
  application_id: string;
  analysis_id: string;
  version: number;
  content: TailoredResumeContent | Record<string, unknown>;
  original_score: number;
  tailored_score: number;
  ats_check: { passed: boolean; issues: string[]; keywords_matched: string[]; keywords_missing?: string[] };
  tone_check: { passed: boolean; flags: string[] };
  created_at: string;
}

// Interview Prep
export type InterviewStage =
  | 'phone_screen'
  | 'recruiter_screen'
  | 'hiring_manager'
  | 'technical'
  | 'behavioral'
  | 'onsite_loop'
  | 'executive'
  | 'culture_fit'
  | 'take_home';

export interface InterviewPrepQuestion {
  question: string;
  category: 'behavioral' | 'role' | 'technical' | 'company' | 'scenario' | 'stretch';
  competency: string;
  why_asked: string;
  difficulty: 'entry' | 'mid' | 'senior' | 'executive';
  prep_hint: string;
}

export interface InterviewPrepStarStory {
  title: string;
  competencies: string[];
  source_bullet: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  adaptability: string;
}

export interface InterviewPrepContent {
  summary?: string;
  stage_context?: { duration_estimate_minutes: number; format: string; signal_hunted: string };
  questions?: InterviewPrepQuestion[];
  star_stories?: InterviewPrepStarStory[];
  questions_to_ask?: { question: string; type: string; what_it_signals: string }[];
  company_research?: { topic: string; source: string; how_to_use: string }[];
  red_flags_to_avoid?: { concern: string; avoid: string; replace_with: string }[];
  thirty_sixty_ninety_plan?: { applicable: boolean; days_30: string[]; days_60: string[]; days_90: string[] };
  narrative_gaps?: { area: string; risk: string; mitigation: string }[];
  checklist?: string[];
  confidence_coaching?: { framing_statement: string; body_language_notes: string; recovery_script: string };
}

export interface InterviewPrep {
  id: string;
  user_id: string;
  application_id: string;
  analysis_id: string;
  interview_stage: InterviewStage;
  interviewer_notes: string | null;
  content: InterviewPrepContent;
  metadata: Record<string, unknown>;
  version: number;
  created_at: string;
}

// Offer Evaluation
export interface OfferEquity {
  type: 'rsu' | 'iso' | 'nso' | 'options' | 'phantom' | 'none' | 'unknown';
  total_grant_value_usd?: number | null;
  shares_granted?: number | null;
  vesting_schedule?: string;
  cliff_months?: number | null;
  refreshers_typical_annual?: number | null;
  strike_price?: number | null;
  exercise_window_months_post_term?: number | null;
  notes?: string;
}

export interface OfferBenefits {
  health_plan_quality?: string;
  _401k_match_percent?: number | null;
  _401k_match_vesting?: string;
  pto_days?: number | null;
  parental_leave_weeks?: number | null;
  relocation_package_usd?: number | null;
  wfh_stipend_usd?: number | null;
  learning_budget_usd?: number | null;
}

export interface ParsedOffer {
  base_salary_annual?: number | null;
  signing_bonus?: number | null;
  annual_bonus_target?: number | null;
  annual_bonus_target_percent?: number | null;
  equity?: OfferEquity;
  benefits?: OfferBenefits;
  start_date?: string | null;
  offer_expiration_date?: string | null;
  company_stage_inferred?: string;
  parsing_confidence?: 'high' | 'medium' | 'low';
  missing_info_flags?: string[];
}

export interface OfferYearProjection {
  base: number;
  bonus: number;
  signing: number;
  equity_vested: number;
  total: number;
}

export interface OfferProjectionScenario {
  year_1: OfferYearProjection;
  year_2: OfferYearProjection;
  year_3: OfferYearProjection;
  year_4: OfferYearProjection;
  cumulative: number;
  assumptions: string;
}

export interface OfferProjection {
  conservative: OfferProjectionScenario;
  base: OfferProjectionScenario;
  optimistic: OfferProjectionScenario;
}

export interface OfferNegotiationLever {
  lever: string;
  flexibility: 'low' | 'medium' | 'high';
  rationale: string;
  ask_amount: string;
  justification_script: string;
}

export interface OfferNegotiation {
  email_counter?: string;
  phone_script?: string[];
  rebuttal_lines?: { pushback: string; response: string }[];
}

export interface OfferEvaluation {
  id: string;
  user_id: string;
  application_id: string | null;
  offer_text: string | null;
  parsed_offer: ParsedOffer;
  projection: OfferProjection;
  negotiation: OfferNegotiation;
  metadata: {
    headline?: string;
    benchmark_analysis?: Record<string, unknown>;
    negotiation_levers?: OfferNegotiationLever[];
    common_mistakes_to_avoid?: string[];
    decision_matrix?: Record<string, unknown>;
    red_alerts?: { alert: string; severity: string; action: string }[];
    next_steps?: string[];
  };
  version: number;
  created_at: string;
}

// Cover Letter
export type CoverLetterIndustryPreset =
  | 'tech_startup'
  | 'enterprise_tech'
  | 'finance_law'
  | 'academia'
  | 'nonprofit'
  | 'creative'
  | 'public_sector'
  | 'general';

export type CoverLetterStructureFormat = 'problem_solution' | 'aida' | 'harvard';

export type CoverLetterOpenerType = 'accomplishment' | 'referral' | 'company_observation' | 'none';

export interface CoverLetterMetadata {
  structure_format?: CoverLetterStructureFormat;
  tone_preset_used?: CoverLetterIndustryPreset;
  opener_type?: CoverLetterOpenerType;
  concerns_addressed?: string[];
  needs_company_signal?: boolean;
  company_signal_question?: string;
  ai_tell_flags?: string[];
  key_points_addressed?: string[];
  user_company_signal?: string;
  reasoning?: string;
}

export interface CoverLetter {
  id: string;
  user_id: string;
  application_id: string;
  analysis_id: string;
  recommendation: 'skip' | 'short-note' | 'full-letter';
  content: string;
  email_body_content?: string | null;
  metadata?: CoverLetterMetadata | null;
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
