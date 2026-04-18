# 🔧 OAuth Fix - Complete Steps

**Issue:** Still redirecting to `http://localhost:3000/?code=...`  
**Root Cause:** Multiple issues - Supabase config + environment variable  

---

## ✅ STEP 1: Add Environment Variable to Vercel (Required)

### Via Vercel Dashboard

1. **Go to:** https://vercel.com/zakopenc/worthapply/settings/environment-variables

2. **Click:** "Add New" button

3. **Add this variable:**
   - **Key:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://worthapply.com`
   - **Environment:** Select all (Production, Preview, Development)

4. **Click:** "Save"

5. **Redeploy:**
   - Go to Deployments tab
   - Click the latest deployment
   - Click "Redeploy" button

**Why this is needed:**
- The code now uses `NEXT_PUBLIC_SITE_URL` as the primary redirect URL
- This ensures production URL is used even when testing from localhost
- Fallback to `window.location.origin` if not set

---

## ✅ STEP 2: Verify Supabase Site URL (Required)

### In Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/auth/url-configuration

2. **Verify "Site URL" field shows:**
   ```
   https://worthapply.com
   ```
   
   **NOT:**
   ```
   http://localhost:3000
   ```

3. **Verify "Redirect URLs" includes:**
   ```
   https://worthapply.com
   https://worthapply.com/auth/callback
   https://worthapply.com/dashboard
   https://*.vercel.app
   https://*.vercel.app/auth/callback
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```

4. **If anything is wrong:** Update and click "Save"

---

## ✅ STEP 3: Wait for Vercel Deployment

**Check status:** https://vercel.com/zakopenc/worthapply/deployments

**Latest commit:** "Fix OAuth redirect: Use NEXT_PUBLIC_SITE_URL env var"

**Wait for:** "Ready" status (~2-3 minutes)

---

## ✅ STEP 4: Test Properly (Important!)

### ❌ WRONG WAY (This Will Still Go to Localhost)
```
Visit: http://localhost:3000/login
Click: Continue with Google
Result: Redirects to localhost ❌
```

### ✅ CORRECT WAY
```
1. Close ALL localhost tabs
2. Open incognito window
3. Visit: https://worthapply.com/login (PRODUCTION)
4. Click: Continue with Google
5. Select: Your Gmail account
6. Expected: https://worthapply.com/dashboard ✅
```

**Key Point:** You MUST test from **https://worthapply.com**, NOT localhost!

---

## 🔍 DEBUG: Check What URL Is Being Used

If it's still not working, check the actual redirect URL:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Visit:** https://worthapply.com/login
4. **Click:** "Continue with Google"
5. **Look for:** Request to `supabase.co/auth/v1/authorize`
6. **Click on it** and check the "Payload" or "Query String Parameters"
7. **Find:** `redirect_to` parameter

**Should show:**
```
redirect_to: https://worthapply.com/auth/callback?next=/dashboard
```

**NOT:**
```
redirect_to: http://localhost:3000/auth/callback?next=/dashboard
```

---

## 📊 WHAT WAS CHANGED

### Code Changes (Just Deployed)

**Before:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
  },
});
```

**After:**
```typescript
const redirectOrigin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${redirectOrigin}/auth/callback?next=/dashboard`,
  },
});
```

**What changed:**
- Now uses `NEXT_PUBLIC_SITE_URL` environment variable first
- Falls back to `window.location.origin` if env var not set
- This means production URL is always used (once env var is set)

**Updated files:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`

---

## 🎯 WHY THIS FIXES IT

### The Problem Before
1. You visit `http://localhost:3000/login` (local dev)
2. Code uses `window.location.origin` = `http://localhost:3000`
3. OAuth redirects back to `http://localhost:3000`
4. Even though you're testing production features! ❌

### The Fix Now
1. You visit `http://localhost:3000/login` (local dev)
2. Code uses `process.env.NEXT_PUBLIC_SITE_URL` = `https://worthapply.com`
3. OAuth redirects to `https://worthapply.com/dashboard`
4. Works correctly even from localhost! ✅

---

## ✅ CHECKLIST

Before testing, make sure:

- [ ] `NEXT_PUBLIC_SITE_URL` added to Vercel
- [ ] Value is `https://worthapply.com` (no trailing slash)
- [ ] All environments selected (Production, Preview, Development)
- [ ] Vercel deployment completed (shows "Ready")
- [ ] Supabase Site URL is `https://worthapply.com`
- [ ] Supabase Redirect URLs include production URLs
- [ ] Testing from production URL (https://worthapply.com/login)
- [ ] Using incognito window (clean cookies)

---

## 🐛 TROUBLESHOOTING

### Still Redirecting to Localhost?

**Check 1: Verify Environment Variable**
```bash
# Check Vercel CLI
vercel env ls

# Should show:
# NEXT_PUBLIC_SITE_URL  Production  https://worthapply.com
```

**Check 2: Verify Deployment Picked Up Changes**
- Go to Vercel deployment logs
- Search for "NEXT_PUBLIC_SITE_URL"
- Should show in build environment

**Check 3: Clear Browser Completely**
```javascript
// In browser console (F12):
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
});
location.reload();
```

**Check 4: Test the Actual Value**
Add this to your login page temporarily to see what's being used:
```typescript
console.log('Redirect origin:', process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
```

---

### Error: "Invalid Redirect URL"

**Cause:** Redirect URL not in Supabase allow list

**Fix:**
1. Note the exact URL from error message
2. Add to Supabase Redirect URLs
3. Make sure it's saved
4. Try again

---

### Works in Incognito But Not Normal Browser

**Cause:** Browser cache or cookies

**Fix:**
1. Clear all site data for worthapply.com
2. Or use incognito mode
3. Or try different browser

---

## 🚀 NEXT STEPS AFTER FIX

Once OAuth is working:

1. **Test both login and signup** with Google
2. **Test with multiple Google accounts**
3. **Verify users appear** in Supabase dashboard
4. **Test sign out** and sign in again
5. **Test on mobile** (if applicable)

---

## 📞 IF STILL NOT WORKING

After following ALL steps above, if still broken:

1. **Take screenshots of:**
   - Vercel environment variables page
   - Supabase URL configuration page
   - Browser console (with errors)
   - Network tab (showing redirect_to parameter)

2. **Check Vercel logs:**
   ```bash
   vercel logs worthapply.com --follow
   ```

3. **Check Supabase Auth logs:**
   - Dashboard → Logs → Auth logs
   - Look for OAuth-related errors

4. **Verify Google OAuth is enabled:**
   - Supabase Dashboard → Authentication → Providers
   - Google should be toggled ON
   - Client ID and Secret should be configured

---

## ✅ SUCCESS CRITERIA

After fix, you should see:

1. ✅ Visit https://worthapply.com/login
2. ✅ Click "Continue with Google"
3. ✅ Google consent screen appears
4. ✅ Select Gmail account
5. ✅ Redirect to `https://worthapply.com/dashboard`
6. ✅ Dashboard loads with user authenticated
7. ✅ Can navigate to other protected pages
8. ✅ Profile shows Gmail address

**What you should NOT see:**
- ❌ Redirect to localhost
- ❌ "Invalid redirect URL" error
- ❌ Infinite loading
- ❌ Redirect loop

---

## 🎯 QUICK SUMMARY

**3 things you need to do:**

1. **Vercel:** Add `NEXT_PUBLIC_SITE_URL=https://worthapply.com`
2. **Supabase:** Verify Site URL is `https://worthapply.com`
3. **Test:** From https://worthapply.com/login (NOT localhost)

**That's it!** 🚀

---

**Updated:** April 6, 2026  
**Commit:** dbdc444  
**Status:** Code deployed, waiting for environment variable
