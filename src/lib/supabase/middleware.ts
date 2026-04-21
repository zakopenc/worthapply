import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { fetchIsAdmin } from '@/lib/admin/fetch-is-admin';

// ── CSRF Origin/Referer guard for mutating API requests ──────────────────
// Browsers with SameSite=Lax cookies already block most cross-site POSTs,
// but Lax still permits top-level-nav POST via form submissions. For any
// mutating API call we additionally require the Origin (or Referer) host
// to match this site's host. Webhook endpoints are excluded because they
// authenticate via cryptographic signatures, not cookies.
const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_EXEMPT_PREFIXES = ['/api/webhooks/'];

function getHostFromUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}

function isCsrfOriginAllowed(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/api/')) return true;
  if (CSRF_SAFE_METHODS.has(request.method)) return true;
  if (CSRF_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;

  const expectedHost = request.nextUrl.host;
  const originHost = getHostFromUrl(request.headers.get('origin'));
  const refererHost = getHostFromUrl(request.headers.get('referer'));

  // Require at least one of Origin or Referer to be present and match host.
  if (originHost && originHost === expectedHost) return true;
  if (refererHost && refererHost === expectedHost) return true;

  // In development, allow localhost variants for easier local testing.
  if (process.env.NODE_ENV !== 'production') {
    const localHosts = new Set(['localhost:3000', '127.0.0.1:3000']);
    if (originHost && localHosts.has(originHost)) return true;
    if (refererHost && localHosts.has(refererHost)) return true;
  }

  return false;
}

export async function updateSession(request: NextRequest) {
  // CSRF guard runs before anything else — cheap header inspection only.
  if (!isCsrfOriginAllowed(request)) {
    return new NextResponse(
      JSON.stringify({ error: 'Cross-site request rejected.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('Supabase env vars missing - allowing request through');
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, sameSite: 'lax', secure: true })
          );
        },
      },
    }
  );

  // Inactivity timeout: 30 minutes
  const INACTIVITY_MS = 30 * 60 * 1000;
  const LAST_ACTIVE_COOKIE = 'wa_last_active';
  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email');

  // Only enforce inactivity on protected routes (skip public/auth/api/admin)
  const isProtectedAppRoute =
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/forgot-password') &&
    !pathname.startsWith('/reset-password') &&
    !pathname.startsWith('/verify-email') &&
    pathname !== '/' &&
    !pathname.startsWith('/features') &&
    !pathname.startsWith('/pricing') &&
    !pathname.startsWith('/about') &&
    !pathname.startsWith('/compare') &&
    !pathname.startsWith('/tools') &&
    !pathname.startsWith('/privacy') &&
    !pathname.startsWith('/terms') &&
    !pathname.startsWith('/suspended');

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Check JWT expiry
      if (session.expires_at && Date.now() > session.expires_at * 1000) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // Check inactivity timeout on protected routes
      if (isProtectedAppRoute) {
        const lastActiveCookie = request.cookies.get(LAST_ACTIVE_COOKIE)?.value;
        const lastActive = lastActiveCookie ? parseInt(lastActiveCookie, 10) : 0;
        if (lastActive && Date.now() - lastActive > INACTIVITY_MS) {
          await supabase.auth.signOut();
          const url = request.nextUrl.clone();
          url.pathname = '/login';
          url.searchParams.set('reason', 'timeout');
          return NextResponse.redirect(url);
        }
        // Refresh last-active timestamp
        supabaseResponse.cookies.set(LAST_ACTIVE_COOKIE, String(Date.now()), {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day max; inactivity check governs real expiry
        });
      }
    } else if (isProtectedAppRoute || isAuthRoute) {
      // No session — clear stale last-active cookie (auth pages are not "protected", so an old
      // timestamp here caused immediate ?reason=timeout right after a fresh login).
      supabaseResponse.cookies.delete(LAST_ACTIVE_COOKIE);
    }
  } catch (e) {
    console.error('Session check error:', e);
  }

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error('Supabase auth error:', error);
  }

  // Public marketing routes - no auth needed
  const isMarketingRoute = pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/compare') ||
    pathname.startsWith('/tools/ats-checker') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/suspended');

  // API routes - skip auth for public APIs
  const isPublicApiRoute = pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/chat');

  if (isMarketingRoute || isPublicApiRoute) {
    return supabaseResponse;
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    const nextPath = url.searchParams.get('redirect');
    let destination: string;
    if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
      destination = nextPath;
    } else {
      const isAdmin = await fetchIsAdmin(supabase, user.id);
      destination = isAdmin ? '/admin' : '/dashboard';
    }
    url.pathname = destination;
    url.searchParams.delete('redirect');
    return NextResponse.redirect(url);
  }

  // Admin routes — must be logged in (role check happens in layout + API routes)
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Protected app routes
  const isAppRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/analyzer') ||
    pathname.startsWith('/resume') ||
    pathname.startsWith('/applications') ||
    pathname.startsWith('/tracker') ||
    pathname.startsWith('/digest') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/onboarding');

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
