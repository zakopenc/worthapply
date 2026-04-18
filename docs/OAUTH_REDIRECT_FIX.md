# 🔐 OAuth Redirect Fix - Gmail Sign In/Sign Up

**Issue:** After selecting Gmail account, redirects to `http://localhost:3000/?code=...`  
**Expected:** Should redirect to `https://worthapply.com/dashboard`  
**Root Cause:** Supabase Site URL configured for localhost instead of production  

---

## ✅ THE FIX (Required - In Supabase Dashboard)

### Step-by-Step Instructions

#### 1. Open Supabase Dashboard

**URL:** https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof

**Navigate to:**
```
Authentication → URL Configuration
```

---

#### 2. Update Site URL

Find the **Site URL** field (top of the page)

**Current (WRONG):**
```
http://localhost:3000
```

**Change to (CORRECT):**
```
https://worthapply.com
```

**Why this matters:**
- This is the **primary domain** Supabase uses for OAuth redirects
- If set to localhost, ALL OAuth flows redirect there
- Production users will be sent to localhost after authentication

---

#### 3. Update Redirect URLs

Find the **Redirect URLs** section (allow list)

**Add these URLs (one per line):**

```
https://worthapply.com
https://worthapply.com/auth/callback
https://worthapply.com/dashboard
https://*.vercel.app
https://*.vercel.app/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
```

**What each URL does:**

| URL | Purpose |
|-----|---------|
| `https://worthapply.com` | Production base URL |
| `https://worthapply.com/auth/callback` | OAuth callback endpoint (production) |
| `https://worthapply.com/dashboard` | Post-login redirect (production) |
| `https://*.vercel.app` | Preview deployments (Vercel) |
| `https://*.vercel.app/auth/callback` | OAuth callback (preview) |
| `http://localhost:3000` | Local development base |
| `http://localhost:3000/auth/callback` | OAuth callback (local dev) |

**Note:** The wildcard `*.vercel.app` allows ALL your Vercel preview deployments to work with OAuth.

---

#### 4. Click "Save"

**IMPORTANT:** Changes take effect immediately, but you may need to:
- Clear browser cookies for worthapply.com
- Close all browser tabs
- Test in incognito mode first

---

## 🔐 OPTIONAL: Google Cloud Console Configuration

If you set up Google OAuth directly (not through Supabase auto-config), you also need to update Google Cloud Console.

### Google Cloud Console Steps

#### 1. Open Google Cloud Console

**URL:** https://console.cloud.google.com/apis/credentials

**Select:** Your project (the one with WorthApply OAuth credentials)

---

#### 2. Find Your OAuth 2.0 Client ID

- Click on the **OAuth 2.0 Client ID** you created for WorthApply
- Look for **"Authorized redirect URIs"** section

---

#### 3. Add Supabase Callback URL

**Add this URL:**
```
https://hfeitnerllyoszkcqlof.supabase.co/auth/v1/callback
```

**Why:** This is Supabase's OAuth callback endpoint. Google OAuth redirects here first, then Supabase redirects to your app.

**Also add (optional, for direct testing):**
```
https://worthapply.com/auth/callback
```

---

#### 4. Remove localhost (Production Only)

**For production security:**
- Remove `http://localhost:3000` from authorized origins
- Remove `http://localhost:3000/auth/callback` from redirect URIs

**Or keep them** if you still need local development with real OAuth.

---

#### 5. Save Changes

Click **"Save"** at the bottom.

**Note:** Google OAuth changes can take 5-10 minutes to propagate.

---

## ✅ VERIFICATION STEPS

### Test 1: Fresh Incognito Window

1. **Open:** Chrome/Firefox incognito window
2. **Visit:** https://worthapply.com/login
3. **Click:** "Continue with Google"
4. **Select:** Your Gmail account
5. **Expected:** Redirects to `https://worthapply.com/dashboard` ✅

**If it works:** OAuth is fixed! 🎉

**If still redirects to localhost:** Continue to troubleshooting below.

---

### Test 2: Check Redirect URL in Network Tab

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Click:** "Continue with Google"
4. **Look for:** Request to `supabase.co/auth/v1/authorize`
5. **Check:** `redirect_to` parameter in the URL

**Should contain:**
```
redirect_to=https%3A%2F%2Fworthapply.com%2Fauth%2Fcallback
```

**NOT:**
```
redirect_to=http%3A%2F%2Flocalhost%3A3000
```

---

### Test 3: Complete Flow

1. **Sign in with Google** (from production site)
2. **Should see:**
   ```
   https://worthapply.com/dashboard
   ```
3. **Check:** User is authenticated (can see dashboard content)
4. **Check:** Can navigate to other protected pages

---

## 🐛 TROUBLESHOOTING

### Still Redirecting to Localhost?

**Check 1: Clear Browser Cookies**
```javascript
// In browser console (F12):
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
});
```

**Check 2: Verify Supabase Config**
- Go back to Supabase dashboard
- Confirm Site URL is `https://worthapply.com` (no trailing slash)
- Confirm redirect URLs are saved

**Check 3: Wait for Propagation**
- Supabase changes: Immediate
- Google OAuth changes: 5-10 minutes
- Browser cache: Clear manually

**Check 4: Test in Different Browser**
- Try Safari, Edge, or Firefox
- Use incognito/private mode
- This isolates browser cache issues

---

### Error: "Invalid Redirect URL"

**Cause:** The redirect URL is not in the allow list.

**Fix:**
1. Check exact URL in error message
2. Add that exact URL to Supabase redirect URLs
3. Make sure there's no typo or extra characters

---

### Error: "OAuth Configuration Error"

**Possible causes:**

1. **Google OAuth not configured in Supabase**
   - Go to Authentication → Providers
   - Enable Google provider
   - Add Client ID and Client Secret from Google Cloud Console

2. **Callback URL mismatch**
   - Verify Google Cloud Console has Supabase callback URL
   - `https://hfeitnerllyoszkcqlof.supabase.co/auth/v1/callback`

3. **OAuth consent screen not configured**
   - Go to Google Cloud Console → OAuth consent screen
   - Add test users or publish the app

---

### Works Locally But Not in Production

**Check:**
1. **Environment variables in Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Both should be set in Vercel dashboard

2. **Middleware not blocking:**
   - We already fixed this in previous commit
   - `/auth/callback` should be public

3. **Deployment completed:**
   - Check Vercel deployments
   - Latest commit should be deployed

---

## 📊 TECHNICAL DETAILS

### How OAuth Flow Works

```
User clicks "Continue with Google"
    ↓
supabase.auth.signInWithOAuth() called
    ↓
Redirects to Google OAuth consent screen
    ↓
User selects Gmail account and authorizes
    ↓
Google redirects to: https://[supabase-project].supabase.co/auth/v1/callback?code=...
    ↓
Supabase exchanges code for session
    ↓
Supabase redirects to: https://worthapply.com/auth/callback?code=...
    ↓
Next.js route handler (/auth/callback/route.ts) processes
    ↓
Exchanges code for session using supabase.auth.exchangeCodeForSession()
    ↓
Redirects to: https://worthapply.com/dashboard
    ↓
User is authenticated ✅
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/(auth)/login/page.tsx` | Google OAuth button (line 74-79) |
| `src/app/(auth)/signup/page.tsx` | Google OAuth button (line 112-113) |
| `src/app/auth/callback/route.ts` | OAuth callback handler |
| `src/lib/supabase/middleware.ts` | Auth middleware (allows /auth/callback) |

### Redirect URL Logic

**In login/signup pages:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
  },
});
```

**Key points:**
- `window.location.origin` = current domain (production or localhost)
- `?next=/dashboard` = where to go after successful auth
- This should work correctly in both environments

**The issue:** Supabase **ignores** this and uses the Site URL from dashboard config instead.

---

## 📋 CONFIGURATION CHECKLIST

### Supabase Dashboard
- [ ] Site URL: `https://worthapply.com`
- [ ] Redirect URLs include: `https://worthapply.com/auth/callback`
- [ ] Redirect URLs include: `https://worthapply.com/dashboard`
- [ ] Redirect URLs include: `http://localhost:3000` (for dev)
- [ ] Google provider enabled
- [ ] Client ID and Client Secret configured

### Google Cloud Console
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized redirect URIs include Supabase callback
- [ ] OAuth consent screen configured
- [ ] Test users added (if not published)

### Vercel Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Latest deployment successful

### Code (Already Done)
- [x] OAuth callback route exists
- [x] Middleware allows /auth/callback
- [x] Login/signup pages use signInWithOAuth
- [x] Dynamic redirectTo using window.location.origin

---

## 🎯 SUCCESS CRITERIA

After fixing, you should see:

1. **Click "Continue with Google"** → Google consent screen
2. **Select Gmail account** → Loading spinner
3. **Redirect to:** `https://worthapply.com/dashboard` ✅
4. **Dashboard loads** with user authenticated
5. **Can navigate** to other protected pages
6. **Profile shows** Gmail email address

**What you should NOT see:**
- ❌ Redirect to `http://localhost:3000`
- ❌ "Invalid redirect URL" error
- ❌ Stuck on loading screen
- ❌ Redirect loop

---

## 🚀 NEXT STEPS

### After Fixing

1. **Test both login AND signup** with Google OAuth
2. **Test on mobile** (if applicable)
3. **Test with different Google accounts**
4. **Verify user appears in Supabase dashboard** (Authentication → Users)

### Optional Enhancements

- [ ] Add error handling for failed OAuth
- [ ] Add loading state during redirect
- [ ] Add "Sign in with GitHub" (same pattern)
- [ ] Add "Sign in with Apple" (requires paid Apple Developer account)

---

## 📞 SUPPORT

If you're still having issues after following this guide:

1. **Check Supabase logs:**
   - Dashboard → Logs → Auth logs
   - Look for OAuth-related errors

2. **Check Vercel logs:**
   ```bash
   vercel logs worthapply.com --follow
   ```

3. **Check browser console:**
   - F12 → Console tab
   - Look for errors during OAuth flow

4. **Test API directly:**
   ```bash
   # Test if callback endpoint is accessible
   curl https://worthapply.com/auth/callback
   # Should not return 404
   ```

---

## ✅ QUICK FIX SUMMARY

**The fix is simple - just update Supabase dashboard:**

1. Go to: https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof
2. Authentication → URL Configuration
3. Site URL: Change to `https://worthapply.com`
4. Redirect URLs: Add production URLs
5. Click "Save"
6. Test in incognito: https://worthapply.com/login → Continue with Google

**That's it!** Your OAuth should work immediately after saving. 🎉

---

**Created:** April 6, 2026  
**Status:** Ready to fix  
**Estimated Time:** 2 minutes  
**Supabase Project:** hfeitnerllyoszkcqlof
