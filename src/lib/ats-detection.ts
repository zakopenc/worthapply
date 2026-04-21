import type { AtsFamily } from '@/types';

const ATS_PATTERNS: { family: AtsFamily; patterns: RegExp[] }[] = [
  { family: 'greenhouse', patterns: [/greenhouse\.io/i, /boards\.greenhouse\.io/i, /job-boards\.greenhouse\.io/i] },
  { family: 'lever', patterns: [/jobs\.lever\.co/i, /lever\.co\/jobs/i] },
  { family: 'workday', patterns: [/myworkdayjobs\.com/i, /workday\.com/i, /wd\d?\.myworkday\.com/i] },
  { family: 'ashby', patterns: [/jobs\.ashbyhq\.com/i, /ashbyhq\.com/i] },
  { family: 'taleo', patterns: [/taleo\.net/i, /tbe\.taleo\.net/i] },
  { family: 'icims', patterns: [/icims\.com/i, /careers-[a-z0-9-]+\.icims\.com/i] },
  { family: 'smartrecruiters', patterns: [/smartrecruiters\.com/i, /jobs\.smartrecruiters\.com/i] },
];

export function detectAtsFamily(jobUrl?: string | null): AtsFamily {
  if (!jobUrl) return 'unknown';
  for (const { family, patterns } of ATS_PATTERNS) {
    if (patterns.some((p) => p.test(jobUrl))) return family;
  }
  return 'unknown';
}
