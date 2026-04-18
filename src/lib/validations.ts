import { z } from 'zod';
import { APPLICATION_STATUS_VALUES } from '@/lib/application-status';

export const analyzeJobSchema = z.object({
  job_description: z.string().min(50, { message: 'Job description must be at least 50 characters long' }).trim(),
  job_url: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  resume_id: z.string().uuid({ message: 'Invalid resume ID' }).optional(),
});

export type AnalyzeJobInput = z.infer<typeof analyzeJobSchema>;

export const applicationStatusSchema = z.enum(APPLICATION_STATUS_VALUES);

const optionalTrimmedString = (max: number, fieldName: string) =>
  z.union([
    z.string().trim().min(1, { message: `${fieldName} cannot be empty` }).max(max, { message: `${fieldName} is too long` }),
    z.literal(''),
    z.null(),
  ]);

export const applicationCreateSchema = z.object({
  job_title: z.string().trim().min(1, { message: 'Job title is required' }).max(200, { message: 'Job title is too long' }),
  company: z.string().trim().min(1, { message: 'Company is required' }).max(200, { message: 'Company is too long' }),
  location: optionalTrimmedString(200, 'Location').optional(),
  status: applicationStatusSchema.optional(),
  source: optionalTrimmedString(100, 'Source').optional(),
  analysis_id: z.string().uuid({ message: 'Invalid analysis ID' }).optional().or(z.literal('')).or(z.null()),
});

export const applicationUpdateSchema = z.object({
  id: z.string().uuid({ message: 'Invalid application ID' }),
  notes: optionalTrimmedString(5000, 'Notes').optional(),
  salary_info: optionalTrimmedString(200, 'Salary info').optional(),
  interview_stage: optionalTrimmedString(100, 'Interview stage').optional(),
  next_step: optionalTrimmedString(500, 'Next step').optional(),
  follow_up_sent: z.boolean().optional(),
  ghost_flagged: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).some((key) => key !== 'id'), {
  message: 'At least one field must be provided to update',
});

export const generationRequestSchema = z.object({
  analysis_id: z.string().uuid({ message: 'Invalid analysis ID' }),
  application_id: z.string().uuid({ message: 'Invalid application ID' }),
});

export const checkoutSchema = z.union([
  z.object({
    priceId: z.string().trim().min(1, { message: 'Price ID is required' }),
    plan: z.enum(['pro_monthly', 'pro_annual', 'lifetime'], {
      message: 'Invalid plan',
    }),
  }).strict(),
  z.object({
    interval: z.enum(['monthly', 'annual', 'lifetime'], {
      message: 'Invalid billing interval',
    }),
  }).strict(),
]);

export const profileUpdateSchema = z.object({
  full_name: optionalTrimmedString(120, 'Full name').optional(),
  job_title: optionalTrimmedString(120, 'Job title').optional(),
  current_company: optionalTrimmedString(120, 'Current company').optional(),
  location: optionalTrimmedString(120, 'Location').optional(),
  years_experience: z.number().int().min(0).max(80).nullable().optional(),
  preferred_titles: z.array(z.string().trim().min(1).max(100)).max(25).optional(),
  target_industries: z.array(z.string().trim().min(1).max(100)).max(25).optional(),
  work_preference: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  salary_min: z.number().int().min(0).max(10000000).nullable().optional(),
  salary_max: z.number().int().min(0).max(10000000).nullable().optional(),
  open_to_relocation: z.boolean().optional(),
  preferred_locations: z.array(z.string().trim().min(1).max(120)).max(25).optional(),
  theme: z.enum(['light', 'dark']).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided to update',
}).refine((value) => {
  if (value.salary_min == null || value.salary_max == null) return true;
  return value.salary_max >= value.salary_min;
}, {
  message: 'salary_max must be greater than or equal to salary_min',
  path: ['salary_max'],
});

export const notificationPreferencesUpdateSchema = z.object({
  daily_digest: z.boolean().optional(),
  ghost_alerts: z.boolean().optional(),
  weekly_summary: z.boolean().optional(),
  product_updates: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one notification preference must be provided',
});

export const bookmarkUpdateSchema = z.object({
  bookmarked: z.boolean(),
});

export const analysisActionSchema = z.object({
  analysis_id: z.string().uuid({ message: 'Invalid analysis ID' }),
  application_id: z.string().uuid({ message: 'Invalid application ID' }),
});

export type AnalysisActionInput = z.infer<typeof analysisActionSchema>;
