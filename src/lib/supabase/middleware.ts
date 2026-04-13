import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // Explicitly check for session expiration (6 hours = 21600 seconds)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const SIX_HOURS = 6 * 60 * 60 * 1000;
      
      // If session is older than 6 hours based on expires_at (token duration)
      // or if session.expires_at is missing, fallback to standard session check.
      // Note: Supabase session.expires_at is a Unix timestamp in seconds.
      if (session.expires_at && (Date.now() > (session.expires_at * 1000) - (24 * 60 * 60 * 1000 - SIX_HOURS))) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
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

  const pathname = request.nextUrl.pathname;

  // Public marketing routes - no auth needed
  const isMarketingRoute = pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/compare') ||
    pathname.startsWith('/tools/ats-checker') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms');

  // Auth routes - redirect to dashboard if logged in
  const isAuthRoute = pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email');

  // API routes - skip auth for public APIs
  const isPublicApiRoute = pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/chat');

  if (isMarketingRoute || isPublicApiRoute) {
    return supabaseResponse;
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
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
