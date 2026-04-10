const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export function sanitizeRedirectPath(
  candidate: string | null | undefined,
  fallback = '/dashboard'
) {
  if (!candidate) return fallback;

  const trimmed = candidate.trim();

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
