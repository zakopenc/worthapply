/**
 * Deterministic fit score from LLM sub-scores (must match product messaging).
 * Overall is always derived server-side so it matches the 40/35/25 blend.
 */

export const ANALYSIS_WEIGHTS = {
  skills: 40,
  experience: 35,
  domain: 25,
} as const;

export const ANALYSIS_THRESHOLDS = {
  apply_min: 70,
  low_priority_min: 40,
  skip_below: 40,
} as const;

export function clampScore0to100(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function computeOverallScore(sub: { skills: number; experience: number; domain: number }): number {
  const s = clampScore0to100(sub.skills);
  const e = clampScore0to100(sub.experience);
  const d = clampScore0to100(sub.domain);
  const raw = (s * ANALYSIS_WEIGHTS.skills + e * ANALYSIS_WEIGHTS.experience + d * ANALYSIS_WEIGHTS.domain) / 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Aligns with ANALYSIS_THRESHOLDS */
export function verdictFromOverall(overall: number): 'apply' | 'low-priority' | 'skip' {
  if (overall >= ANALYSIS_THRESHOLDS.apply_min) return 'apply';
  if (overall >= ANALYSIS_THRESHOLDS.low_priority_min) return 'low-priority';
  return 'skip';
}
