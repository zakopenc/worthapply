export interface NormalizedMatchedSkill {
  skill: string;
  evidence_from_resume: string;
}

export interface NormalizedSkillGap {
  skill: string;
  impact: string;
  suggestion: string;
}

export interface NormalizedRecruiterConcern {
  concern: string;
  severity: string;
  mitigation: string;
}

export interface NormalizedScoreBreakdown {
  skills: number | null;
  experience: number | null;
  domain: number | null;
}

export interface AnalysisMetadataShape {
  model?: string;
  timestamp?: string;
  prompt_version?: string;
  used_resume_evidence?: boolean;
  resume_parse_status?: string | null;
  resume_source?: string | null;
  resume_note?: string | null;
  scoring_method?: {
    overall_formula?: string;
    weights?: {
      skills?: number;
      experience?: number;
      domain?: number;
    };
    verdict_thresholds?: {
      apply_min?: number;
      low_priority_min?: number;
      skip_below?: number;
    };
  };
}

function normalizeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() || fallback : fallback;
}

export function normalizeScore(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, Math.round(parsed)));
    }
  }

  return null;
}

export function normalizeMatchedSkills(value: unknown): NormalizedMatchedSkill[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const skill = normalizeText(record.skill, 'Matched skill');
      const evidence = normalizeText(record.evidence_from_resume || record.evidence, 'Evidence not captured');
      return { skill, evidence_from_resume: evidence };
    })
    .filter((item): item is NormalizedMatchedSkill => Boolean(item));
}

export function normalizeSkillGaps(value: unknown): NormalizedSkillGap[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      return {
        skill: normalizeText(record.skill, 'Requirement gap'),
        impact: normalizeText(record.impact, 'medium'),
        suggestion: normalizeText(record.suggestion, 'No mitigation provided yet.'),
      };
    })
    .filter((item): item is NormalizedSkillGap => Boolean(item));
}

export function normalizeRecruiterConcerns(value: unknown): NormalizedRecruiterConcern[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      return {
        concern: normalizeText(record.concern, 'Concern not specified'),
        severity: normalizeText(record.severity, 'medium'),
        mitigation: normalizeText(record.mitigation, 'No mitigation captured yet.'),
      };
    })
    .filter((item): item is NormalizedRecruiterConcern => Boolean(item));
}

export function normalizeScoreBreakdown(source: Record<string, unknown> | null | undefined): NormalizedScoreBreakdown {
  const nested = source?.sub_scores && typeof source.sub_scores === 'object'
    ? source.sub_scores as Record<string, unknown>
    : null;

  return {
    skills: normalizeScore(nested?.skills ?? source?.skills_score),
    experience: normalizeScore(nested?.experience ?? source?.experience_score),
    domain: normalizeScore(nested?.domain ?? source?.domain_score),
  };
}

export function normalizeAnalysisMetadata(value: unknown): AnalysisMetadataShape {
  if (!value || typeof value !== 'object') return {};
  return value as AnalysisMetadataShape;
}

export function deriveTargetKeywords(matchedSkills: NormalizedMatchedSkill[], skillGaps: NormalizedSkillGap[]): string[] {
  const seen = new Set<string>();
  const ordered = [...matchedSkills.map((item) => item.skill), ...skillGaps.map((item) => item.skill)];

  return ordered.filter((keyword) => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export function getResumeEvidenceStatus(metadata: AnalysisMetadataShape) {
  if (metadata.used_resume_evidence) {
    return {
      label: 'Resume evidence used',
      detail: metadata.resume_note || 'This score was grounded in your uploaded resume evidence.',
      tone: 'positive' as const,
    };
  }

  const parseStatus = metadata.resume_parse_status;

  if (parseStatus === 'pending' || parseStatus === 'processing') {
    return {
      label: 'Resume still processing',
      detail: metadata.resume_note || 'The analyzer ran before structured resume extraction finished, so the score is based mostly on the job description.',
      tone: 'warning' as const,
    };
  }

  if (parseStatus === 'failed') {
    return {
      label: 'Resume extraction failed',
      detail: metadata.resume_note || 'The analyzer could not use structured resume evidence for this run.',
      tone: 'warning' as const,
    };
  }

  return {
    label: 'No resume evidence linked',
    detail: metadata.resume_note || 'This report was generated without a parsed active resume, so the fit score is less reliable.',
    tone: 'neutral' as const,
  };
}
