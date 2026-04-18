export const APPLICATION_STATUS_VALUES = ['wishlist', 'applied', 'interview', 'offer', 'rejected'] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

const APPLICATION_STATUS_SET = new Set<string>(APPLICATION_STATUS_VALUES);

const LEGACY_APPLICATION_STATUS_MAP: Record<string, ApplicationStatus> = {
  saved: 'wishlist',
  draft: 'wishlist',
  screening: 'interview',
  interviewing: 'interview',
  offered: 'offer',
};

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  {
    label: string;
    icon: string;
    boardColor: string;
    badgeTextColor: string;
    badgeBg: string;
    badgeBorder: string;
  }
> = {
  wishlist: {
    label: 'Wishlist',
    icon: 'bookmark',
    boardColor: 'bg-amber-50',
    badgeTextColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
  },
  applied: {
    label: 'Applied',
    icon: 'send',
    boardColor: 'bg-blue-50',
    badgeTextColor: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
  },
  interview: {
    label: 'Interview',
    icon: 'calendar_month',
    boardColor: 'bg-purple-50',
    badgeTextColor: 'text-purple-700',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
  },
  offer: {
    label: 'Offer',
    icon: 'celebration',
    boardColor: 'bg-green-50',
    badgeTextColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    icon: 'close',
    boardColor: 'bg-red-50',
    badgeTextColor: 'text-red-700',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
  },
};

export function normalizeApplicationStatus(status: string | null | undefined): ApplicationStatus {
  if (!status) return 'wishlist';
  if (APPLICATION_STATUS_SET.has(status)) {
    return status as ApplicationStatus;
  }
  return LEGACY_APPLICATION_STATUS_MAP[status] || 'wishlist';
}

export function isActiveApplicationStatus(status: string | null | undefined): boolean {
  return normalizeApplicationStatus(status) !== 'rejected';
}

export function isInterviewStageStatus(status: string | null | undefined): boolean {
  return normalizeApplicationStatus(status) === 'interview';
}
