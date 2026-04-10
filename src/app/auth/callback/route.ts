import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get('code');
  const next = sanitizeRedirectPath(url.searchParams.get('next'), '/dashboard');
  const authError =
    url.searchParams.get('error_description') || url.searchParams.get('error');

  if (authError) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.search = '';
    redirectUrl.searchParams.set('error', authError);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.search = '';
      redirectUrl.searchParams.set('error', 'Unable to complete sign in. Please try again.');
      return NextResponse.redirect(redirectUrl);
    }

    // Verify session was created
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      console.error('Session not created after code exchange');
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.search = '';
      redirectUrl.searchParams.set('error', 'Authentication failed. Please try again.');
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', session.user.id)
      .single();

    // If first-time user (no onboarding complete), redirect to onboarding
    // Otherwise, respect the 'next' parameter or default to dashboard
    const redirectUrl = request.nextUrl.clone();
    if (!profile?.onboarding_complete) {
      redirectUrl.pathname = '/onboarding';
    } else {
      redirectUrl.pathname = next;
    }
    redirectUrl.search = '';

    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = next;
  redirectUrl.search = '';

  return NextResponse.redirect(redirectUrl);
}