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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error('Supabase auth error:', error);
    // Continue without user - will be treated as unauthenticated
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
