export type RedFlagSeverity = 'low' | 'medium' | 'high';

export interface RedFlag {
  type: string;
  severity: RedFlagSeverity;
  explanation: string;
  action: string;
}

const BUZZWORDS = [
  'team player',
  'hard worker',
  'hard-working',
  'go-getter',
  'self-starter',
  'detail-oriented',
  'results-driven',
  'results-oriented',
  'think outside the box',
  'synergy',
  'rockstar',
  'ninja',
  'guru',
  'passionate',
];

const WEAK_VERBS = [
  'responsible for',
  'duties included',
  'worked on',
  'helped with',
  'assisted in',
  'contributed to',
];

interface WorkItem {
  company?: string;
  title?: string;
  start?: string;
  end?: string;
  start_date?: string;
  end_date?: string;
  highlights?: string[];
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^present|current$/i.test(trimmed)) return new Date();

  const monthYear = trimmed.match(/([A-Za-z]{3,9})\s*(\d{4})/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) return new Date(`Jan 1, ${yearOnly[1]}`);

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

export function scanResumeRedFlags(resumeData: Record<string, unknown>): RedFlag[] {
  const flags: RedFlag[] = [];

  const summary = typeof resumeData.summary === 'string' ? resumeData.summary : '';
  const workHistory: WorkItem[] = Array.isArray(resumeData.work_history) ? (resumeData.work_history as WorkItem[]) : [];

  if (summary) {
    if (/^objective[:\s]/i.test(summary.trim())) {
      flags.push({
        type: 'objective_statement',
        severity: 'medium',
        explanation: 'Resume opens with an "Objective" — modern resumes use a Professional Summary that states value, not wants.',
        action: 'Replace with a 2–3 sentence summary that leads with current level, strongest proof point, and fit for this role.',
      });
    }

    const lowerSummary = summary.toLowerCase();
    const buzzwordHits = BUZZWORDS.filter((w) => lowerSummary.includes(w));
    if (buzzwordHits.length >= 2) {
      flags.push({
        type: 'buzzword_bingo',
        severity: 'medium',
        explanation: `Summary contains buzzwords recruiters downgrade: ${buzzwordHits.slice(0, 3).join(', ')}.`,
        action: 'Replace buzzwords with concrete evidence. Instead of "results-driven", state a specific result.',
      });
    }
  }

  const allBulletText = workHistory
    .flatMap((w) => w.highlights || [])
    .map((b) => b.toLowerCase())
    .join('\n');

  const weakVerbCount = WEAK_VERBS.filter((v) => allBulletText.includes(v)).length;
  if (weakVerbCount >= 3) {
    flags.push({
      type: 'weak_verbs',
      severity: 'high',
      explanation: `${weakVerbCount} bullets start with duty-verbs ("responsible for", "worked on", "helped with") that signal task-listing rather than impact.`,
      action: 'Rewrite with PAR/CAR: state a specific problem, the action you took, and a measurable result.',
    });
  }

  const sortedRoles = workHistory
    .map((w) => ({
      start: parseDate(w.start || w.start_date),
      end: parseDate(w.end || w.end_date),
    }))
    .filter((r) => r.start)
    .sort((a, b) => (a.start!.getTime() - b.start!.getTime()));

  for (let i = 1; i < sortedRoles.length; i += 1) {
    const prevEnd = sortedRoles[i - 1].end;
    const nextStart = sortedRoles[i].start!;
    if (!prevEnd) continue;
    const gap = monthsBetween(prevEnd, nextStart);
    if (gap >= 7) {
      flags.push({
        type: 'employment_gap',
        severity: gap >= 18 ? 'high' : 'medium',
        explanation: `${gap}-month gap detected between roles. 75% of recruiters flag unexplained gaps, though 79% will still interview if the gap is explained productively.`,
        action: 'Add a one-line note in the Experience section explaining the gap (caregiving, education, sabbatical, contract work, health, layoff + job search).',
      });
      break;
    }
  }

  const oneYearTenures = workHistory.filter((w) => {
    const start = parseDate(w.start || w.start_date);
    const end = parseDate(w.end || w.end_date);
    if (!start || !end) return false;
    return monthsBetween(start, end) < 12;
  });
  if (oneYearTenures.length >= 3) {
    flags.push({
      type: 'job_hopping',
      severity: 'medium',
      explanation: `${oneYearTenures.length} roles under 12 months. Context-dependent red flag — forgivable in tech/consulting, penalized elsewhere.`,
      action: 'For short stints, add a one-line context (contract, startup acquired, role eliminated) so the pattern is understood.',
    });
  }

  return flags;
}
