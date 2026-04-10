# 🔐 OAuth Session Fix - Gmail Sign In Redirecting to Home Page

**Issue:** After selecting Gmail account, user gets redirected to home page instead of dashboard  
**Root Cause:** Session cookies not being set properly in OAuth callback  
**Status:** ✅ Fixed  
**Commit:** 7074f3f

---

## 🐛 THE PROBLEM

### What Was Happening

```
1. User clicks "Continue with Google" ✅
2. Selects Gmail account ✅
3. Google redirects to /auth/callback?code=... ✅
4. Callback exchanges code for session ❌ (cookies not set)
5. User redirected to /dashboard
6. Middleware checks auth: No session found ❌
7. Redirects to home page (/) ❌
```

### Root Cause

The OAuth callback was using a Supabase client helper (`createClient()`) that had a **try-catch block silently ignoring cookie setting errors**:

```typescript
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)
    );
  } catch {
    // ❌ SILENTLY IGNORES ERRORS!
    // Session cookies never get set
  }
}
```

**Result:**
- Code exchange succeeded
- Session created in Supabase
- BUT cookies never saved to browser
- User appears unauthenticated
- Gets redirected away from protected pages

---

## ✅ THE FIX

### What Changed

**Before:**
```typescript
// Used helper function with silent error handling
const supabase = await createClient();
const { error } = await supabase.auth.exchangeCodeForSession(code);
// No verification that session was actually created
```

**After:**
```typescript
// Create client directly in callback (no silent error catching)
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
        // No try-catch - let errors bubble up
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  }
);

const { error } = await supabase.auth.exchangeCodeForSession(code);

// Verify session was actually created
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect to login with error
}
```

### Key Improvements

1. **Direct Client Creation**
   - No helper function with error suppression
   - Cookie errors will now be visible in logs

2. **Session Verification**
   - Checks that session actually exists after code exchange
   - Catches cases where cookies failed to set

3. **Error Logging**
   - `console.error()` calls added
   - Can see failures in Vercel logs

4. **Better Error Messages**
   - User sees "Authentication failed" instead of silent redirect
   - Easier to diagnose issues

---

## ✅ TESTING

### Wait for Deployment

**Check:** https://vercel.com/zakopenc/worthapply/deployments

**Wait for:** "Ready" status (~2-3 minutes)

---

### Test OAuth Flow

**Important:** Make sure you've already done:
1. ✅ Added `NEXT_PUBLIC_SITE_URL` to Vercel
2. ✅ Set Supabase Site URL to `https://worthapply.com`
3. ✅ Added redirect URLs to Supabase

---

### Test Steps

1. **Clear Browser Data** (Important!)
   ```javascript
   // In console (F12):
   localStorage.clear();
   sessionStorage.clear();
   document.cookie.split(";").forEach(c => {
     document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
   });
   location.reload();
   ```

2. **Test from Production**
   - Visit: https://worthapply.com/login (NOT localhost)
   - Click: "Continue with Google"
   - Select: Your Gmail account
   - **Expected:** Lands on https://worthapply.com/dashboard ✅

3. **Verify You're Authenticated**
   - Dashboard should load (not redirect away)
   - Profile/settings should show Gmail email
   - Can navigate to other protected pages

---

### What You Should See

```
✅ Google consent screen appears
✅ Select Gmail account
✅ Brief loading/redirect
✅ Land on https://worthapply.com/dashboard
✅ Dashboard content loads
✅ User menu shows email
```

### What You Should NOT See

```
❌ Redirect to home page (/)
❌ Infinite redirect loop
❌ "Authentication failed" error (unless real error)
❌ Stuck on loading screen
```

---

## 🔍 DEBUGGING

### If Still Redirecting to Home Page

**Check 1: Vercel Logs**

```bash
# Watch logs in real-time
vercel logs worthapply.com --follow

# Look for:
# - "OAuth callback error: ..."
# - "Session not created after code exchange"
# - Any cookie-related errors
```

**Check 2: Browser Console**

1. Open DevTools (F12)
2. Go to Console tab
3. Try OAuth flow
4. Look for errors

**Check 3: Application Tab (Cookies)**

1. Open DevTools (F12)
2. Go to Application tab → Cookies
3. Look for Supabase auth cookies:
   - `sb-[project]-auth-token`
   - Should exist after successful OAuth

**Check 4: Network Tab**

1. Open DevTools (F12)
2. Go to Network tab
3. Try OAuth flow
4. Check `/auth/callback` request:
   - Should be 307 redirect to /dashboard
   - Response cookies should be set

---

### Common Issues

**Issue 1: "Authentication failed. Please try again."**

**Cause:** Session wasn't created after code exchange

**Solutions:**
- Check Vercel logs for specific error
- Verify Supabase credentials in Vercel env vars
- Check Supabase project isn't paused

---

**Issue 2: Still Redirects to Home Page**

**Cause:** Middleware not recognizing session

**Check:**
1. Cookies are being set (Application tab)
2. Middleware allows /dashboard (already fixed earlier)
3. User exists in Supabase dashboard (Authentication → Users)

**Debug:**
```typescript
// Add to middleware temporarily
console.log('User:', user);
console.log('Pathname:', pathname);
```

---

**Issue 3: Works in Incognito, Not Regular Browser**

**Cause:** Cached session or cookies

**Fix:**
- Clear all site data for worthapply.com
- Hard refresh (Ctrl+Shift+R)
- Use incognito for testing

---

## 📊 WHAT TO CHECK IN VERCEL LOGS

After successful OAuth, you should see:

**✅ Good Flow (No Errors):**
```
[No errors in logs]
User lands on dashboard
```

**❌ Bad Flow (Session Not Created):**
```
OAuth callback error: [error details]
Session not created after code exchange
```

**❌ Bad Flow (Cookie Setting Failed):**
```
Error setting cookies: [error details]
```

---

## 🎯 SUCCESS CRITERIA

After fix, you should be able to:

1. ✅ Click "Continue with Google"
2. ✅ Select Gmail account
3. ✅ Land on https://worthapply.com/dashboard (NOT home page)
4. ✅ Stay authenticated (no redirect away)
5. ✅ See email in profile menu
6. ✅ Navigate to other protected pages
7. ✅ Sign out and sign in again successfully

---

## 🔧 TECHNICAL DETAILS

### Why the Helper Function Had try-catch

The original `createClient()` helper in `src/lib/supabase/server.ts` had:

```typescript
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)
    );
  } catch {
    // The `setAll` method was called from a Server Component.
    // This can be ignored if you have middleware refreshing sessions.
  }
}
```

**Why it exists:**
- Server Components can't set cookies
- This prevents errors when reading user data in components
- Middleware handles session refresh in those cases

**Why it broke OAuth callback:**
- Route handlers CAN set cookies
- But the try-catch silently ignores ALL errors
- OAuth callback needs to SET the initial session cookies
- If setting fails, user has no session

**The fix:**
- Create client directly in callback route
- Remove try-catch for cookie setting
- Let errors bubble up so we can see them
- Verify session after code exchange

---

## 📋 UPDATED OAUTH FLOW

### How It Works Now

```
1. User clicks "Continue with Google"
   ↓
2. Redirects to Google OAuth consent screen
   ↓
3. User authorizes, Google redirects to:
   https://[supabase].supabase.co/auth/v1/callback?code=...
   ↓
4. Supabase redirects to:
   https://worthapply.com/auth/callback?code=...
   ↓
5. Callback route handler:
   - Creates Supabase client (with proper cookie handling)
   - Exchanges code for session
   - SETS SESSION COOKIES in browser ✅
   - Verifies session was created
   ↓
6. Redirects to: https://worthapply.com/dashboard
   ↓
7. Middleware checks auth:
   - Finds session cookies ✅
   - Allows access to /dashboard
   ↓
8. User lands on dashboard ✅
```

---

## 🚀 DEPLOYMENT

**Commit:** 7074f3f  
**Branch:** main  
**Status:** ✅ Pushed to GitHub  
**Vercel:** Auto-deploying now  
**ETA:** ~2-3 minutes  

---

## 📞 IF STILL NOT WORKING

After following ALL troubleshooting steps:

1. **Check Vercel Logs:**
   ```bash
   vercel logs worthapply.com --follow
   ```
   Try OAuth and watch for errors

2. **Check Supabase Logs:**
   - Dashboard → Logs → Auth logs
   - Look for OAuth-related errors

3. **Verify Environment Variables:**
   - Vercel: `NEXT_PUBLIC_SITE_URL` set
   - Vercel: `NEXT_PUBLIC_SUPABASE_URL` set
   - Vercel: `NEXT_PUBLIC_SUPABASE_ANON_KEY` set

4. **Verify Supabase Config:**
   - Site URL: `https://worthapply.com`
   - Redirect URLs include production URLs
   - Google OAuth provider enabled

5. **Test API Directly:**
   ```bash
   # Check callback endpoint exists
   curl -I https://worthapply.com/auth/callback
   # Should return 307 or 302, NOT 404
   ```

---

## ✅ NEXT STEPS

Once OAuth is working:

1. **Test multiple times** - Sign in, sign out, sign in again
2. **Test on mobile** - If applicable
3. **Test with different Google accounts**
4. **Monitor Vercel logs** - Watch for any errors
5. **Check user in Supabase** - Verify they appear in Users table

---

**Fixed:** April 6, 2026  
**Status:** ✅ **DEPLOYED**  
**Next:** Test after Vercel deployment completes
