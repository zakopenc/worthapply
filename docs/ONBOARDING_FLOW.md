# 🚀 First-Time User Onboarding Flow

**Feature:** Force all new users to complete onboarding with required resume upload before accessing the app

**Status:** ✅ Implemented  
**Commit:** 5c5f74d

---

## 📋 OVERVIEW

### What This Does

New users who sign in for the first time are **required** to:
1. ✅ Upload their resume (REQUIRED - cannot skip)
2. ✅ Set search goals (optional)
3. ✅ Set compensation & location preferences (optional)
4. ✅ Complete onboarding before accessing dashboard

Returning users who have already completed onboarding:
- ✅ Skip onboarding entirely
- ✅ Go directly to dashboard
- ✅ Normal app access

---

## 🎯 USER FLOW

### First-Time User (New Account)

```
1. User visits https://worthapply.com
   ↓
2. Clicks "Sign in with Google"
   ↓
3. Google OAuth consent screen
   ↓
4. Selects Gmail account, authorizes
   ↓
5. OAuth callback creates session
   ↓
6. Callback checks: profile.onboarding_complete = false
   ↓
7. REDIRECTS TO: /onboarding ← NEW!
   ↓
8. Onboarding wizard appears (no sidebar/nav)
   ↓
9. Step 0: Upload Resume (REQUIRED)
   - Drag & drop or click to browse
   - Accepts PDF, DOC, DOCX
   - "Next" button DISABLED until file uploaded ✅
   - NO "Skip" button (removed)
   ↓
10. Step 1: Search Goals (Optional)
    - Preferred job titles
    - Work preference (remote/hybrid/onsite)
    - Target industries
    - Can skip this step
    ↓
11. Step 2: Compensation & Location (Optional)
    - Salary range
    - Preferred locations
    - Open to relocation
    - Can skip this step
    ↓
12. Profile updated: onboarding_complete = true ✅
    ↓
13. Step 3: Completion Screen
    - Shows stats (resume uploaded, titles, locations)
    - Two options:
      - "Analyze a job" → /analyzer
      - "Go to dashboard" → /dashboard
    ↓
14. User clicks "Go to dashboard"
    ↓
15. Dashboard loads with sidebar/nav ✅
    ↓
16. Full app access granted
```

### Returning User (Already Onboarded)

```
1. User visits https://worthapply.com
   ↓
2. Clicks "Sign in with Google"
   ↓
3. Google OAuth consent screen
   ↓
4. Selects Gmail account, authorizes
   ↓
5. OAuth callback creates session
   ↓
6. Callback checks: profile.onboarding_complete = true
   ↓
7. REDIRECTS TO: /dashboard ← Direct access!
   ↓
8. Dashboard loads immediately ✅
   ↓
9. Full app access (no onboarding)
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### 1. App Layout Redirect (`src/app/(app)/layout.tsx`)

**Added onboarding check:**

```typescript
// Force first-time users to complete onboarding before accessing the app
// Onboarding page is outside this layout group, so no redirect loop
if (!profile?.onboarding_complete) {
  redirect('/onboarding');
}
```

**What this does:**
- Checks `profile.onboarding_complete` in database
- If false/null → redirects to `/onboarding`
- If true → allows access to app pages
- Onboarding page is OUTSIDE `(app)` group, so it doesn't trigger this layout

**Affected routes:**
- `/dashboard` - Requires onboarding ✅
- `/analyzer` - Requires onboarding ✅
- `/resume` - Requires onboarding ✅
- `/tailor` - Requires onboarding ✅
- `/applications` - Requires onboarding ✅
- All other `(app)` routes - Require onboarding ✅

**Exempt routes:**
- `/onboarding` - Outside `(app)` group
- `/login`, `/signup` - Outside `(app)` group
- Public routes - Outside `(app)` group

---

### 2. OAuth Callback Smart Redirect (`src/app/auth/callback/route.ts`)

**Added onboarding check after OAuth:**

```typescript
// Check if user has completed onboarding
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_complete')
  .eq('id', user.id)
  .single();

// If first-time user (no onboarding complete), redirect to onboarding
// Otherwise, respect the 'next' parameter or default to dashboard
const redirectUrl = request.nextUrl.clone();
if (!profile?.onboarding_complete) {
  redirectUrl.pathname = '/onboarding';
} else {
  redirectUrl.pathname = next;
}
```

**What this does:**
- After successful OAuth, queries user's profile
- Checks `onboarding_complete` field
- First-time users (false/null) → `/onboarding`
- Returning users (true) → `/dashboard` or `next` param
- Smart routing based on user state

---

### 3. Onboarding Page Location

**Moved from:**
```
src/app/(app)/onboarding/page.tsx  ← Inside (app) group
```

**Moved to:**
```
src/app/onboarding/page.tsx  ← Outside (app) group
```

**Why this matters:**
- Pages inside `(app)` group inherit the app layout (sidebar, nav)
- Pages inside `(app)` group trigger the onboarding redirect check
- Moving outside prevents redirect loop
- Onboarding has its own clean layout without sidebar

**Route structure:**
```
src/app/
├── (app)/              ← Layout with sidebar + onboarding check
│   ├── layout.tsx      ← Redirects if !onboarding_complete
│   ├── dashboard/
│   ├── analyzer/
│   └── ...
├── onboarding/         ← NO layout, NO redirect check ✅
│   └── page.tsx        ← Clean onboarding wizard
├── login/
└── signup/
```

---

### 4. Required Resume Upload (`src/app/onboarding/page.tsx`)

**Removed skip button:**

```typescript
// BEFORE (skip was allowed):
<button className={styles.skipBtn} onClick={skip} disabled={saving}>
  Skip for now
</button>

// AFTER (skip removed, Next disabled until file uploaded):
<button 
  className={styles.nextBtn} 
  onClick={next} 
  disabled={saving || !uploadedFile}  ← Disabled without file
  title={!uploadedFile ? 'Please upload your resume to continue' : ''}
>
  {saving ? 'Saving…' : 'Next'} <ArrowRight size={16} />
</button>
```

**Upload states:**

| State | Next Button | Visual Feedback |
|-------|-------------|-----------------|
| No file uploaded | ❌ Disabled (grayed out) | Tooltip: "Please upload your resume to continue" |
| Uploading | ❌ Disabled | Spinner + "Uploading and parsing your resume…" |
| Uploaded | ✅ Enabled | Green checkmark + file name + "Your resume is ready" |

**What this enforces:**
- User CANNOT proceed to Step 1 without uploading resume
- "Next" button is disabled (grayed out, not clickable)
- Tooltip explains why button is disabled
- No way to skip Step 0

---

## 📊 DATABASE SCHEMA

### profiles table

**Key field:**
```sql
onboarding_complete BOOLEAN DEFAULT false
```

**States:**
- `NULL` or `false` → User has NOT completed onboarding (new user)
- `true` → User HAS completed onboarding (returning user)

**Set to true when:**
- User completes Step 2 (compensation & location)
- Triggered in `next()` function when step === 2

**Code:**
```typescript
if (step === 2) {
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ onboarding_complete: true })
    .eq('id', user.id);
}
```

**Other onboarding fields:**
- `preferred_titles` - Array of job titles (Step 1)
- `work_preference` - Array of remote/hybrid/onsite (Step 1)
- `target_industries` - Array of industries (Step 1)
- `salary_min` - Minimum salary (Step 2)
- `salary_max` - Maximum salary (Step 2)
- `preferred_locations` - Array of locations (Step 2)
- `open_to_relocation` - Boolean (Step 2)

---

## 🎨 ONBOARDING WIZARD DESIGN

### Step 0: Resume Foundation (REQUIRED)

**Layout:**
- Hero card with explanation
- Drag & drop upload zone
- Tips panel (best practices)
- Progress bar (0%)

**Required to proceed:**
- ✅ Resume must be uploaded
- ❌ Cannot skip

**Accepted formats:**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)

**Upload flow:**
1. User drags file or clicks to browse
2. File sent to `/api/parse-resume`
3. Server parses resume
4. Success: Shows green checkmark + filename
5. Error: Shows error message
6. Next button enables when file uploaded

---

### Step 1: Search Goals (Optional)

**Fields:**
- Preferred job titles (tags)
- Work preference (remote/hybrid/onsite checkboxes)
- Target industries (tags)

**Required to proceed:**
- ❌ None - all fields optional
- ✅ Can skip entirely

**Saved to:**
- `profiles.preferred_titles`
- `profiles.work_preference`
- `profiles.target_industries`

---

### Step 2: Compensation & Location (Optional)

**Fields:**
- Salary range (min/max numbers)
- Preferred locations (tags)
- Open to relocation (checkbox)

**Required to proceed:**
- ❌ None - all fields optional
- ✅ Can skip entirely

**Saved to:**
- `profiles.salary_min`
- `profiles.salary_max`
- `profiles.preferred_locations`
- `profiles.open_to_relocation`

**Important:**
- This step sets `onboarding_complete = true` ✅
- After this step, user is considered onboarded
- Can access full app

---

### Step 3: Launch (Completion)

**Layout:**
- Success icon (sparkles)
- "Ready to go" message
- Stats summary:
  - Resumes uploaded
  - Target titles count
  - Preferred locations count
- Two action buttons:
  - "Analyze a job" → `/analyzer`
  - "Go to dashboard" → `/dashboard`

**No form fields - just completion screen**

---

## ✅ TESTING

### Test Case 1: New User First Sign In

**Steps:**
1. Create fresh Google account OR use incognito
2. Visit https://worthapply.com
3. Click "Sign in with Google"
4. Authorize with Google account (first time)

**Expected Result:**
- ✅ Redirects to `/onboarding`
- ✅ Shows onboarding wizard (no sidebar)
- ✅ Step 0: Resume upload required
- ✅ Next button disabled until file uploaded
- ✅ NO "Skip" button visible

**Test uploading resume:**
5. Try clicking "Next" without uploading
   - ✅ Button is disabled (grayed out)
   - ✅ Tooltip shows "Please upload your resume to continue"
6. Upload a PDF resume
   - ✅ Shows uploading spinner
   - ✅ Shows green checkmark when done
   - ✅ "Next" button becomes enabled
7. Click "Next"
   - ✅ Advances to Step 1

**Test completing onboarding:**
8. Fill Step 1 fields (optional) → Click "Next"
9. Fill Step 2 fields (optional) → Click "Finish setup"
10. Completion screen appears

**Expected Result:**
- ✅ Shows "Ready to go" message
- ✅ Shows stats (1 resume, N titles, N locations)
- ✅ Two buttons: "Analyze a job" and "Go to dashboard"

**Test dashboard access:**
11. Click "Go to dashboard"

**Expected Result:**
- ✅ Redirects to `/dashboard`
- ✅ Dashboard loads with sidebar
- ✅ Shows user profile in sidebar
- ✅ Full app access

---

### Test Case 2: Returning User Sign In

**Steps:**
1. Use same account from Test Case 1 (already onboarded)
2. Sign out
3. Visit https://worthapply.com/login
4. Click "Sign in with Google"
5. Authorize with same Google account

**Expected Result:**
- ✅ Redirects DIRECTLY to `/dashboard`
- ✅ NO onboarding wizard shown
- ✅ Full app access immediately
- ✅ Profile shows as before

---

### Test Case 3: Direct URL Access (Not Onboarded)

**Steps:**
1. Sign in as new user (hasn't completed onboarding)
2. Try to visit `/dashboard` directly in URL bar

**Expected Result:**
- ✅ Redirects to `/onboarding`
- ✅ Cannot access dashboard without onboarding
- ✅ Layout forces redirect

**Try other protected routes:**
3. Visit `/analyzer` directly
4. Visit `/resume` directly
5. Visit `/applications` directly

**Expected Result for all:**
- ✅ All redirect to `/onboarding`
- ✅ Cannot bypass onboarding

---

### Test Case 4: Direct URL Access (Already Onboarded)

**Steps:**
1. Sign in as returning user (has completed onboarding)
2. Visit `/dashboard` directly in URL bar

**Expected Result:**
- ✅ Dashboard loads immediately
- ✅ NO redirect to onboarding
- ✅ Full app access

**Try other routes:**
3. Visit `/analyzer`, `/resume`, `/applications`

**Expected Result:**
- ✅ All pages load normally
- ✅ No onboarding redirect
- ✅ Full app access

---

### Test Case 5: Onboarding Page Direct Access

**Steps:**
1. Sign in as new user (hasn't completed onboarding)
2. Visit `/onboarding` directly

**Expected Result:**
- ✅ Onboarding wizard loads
- ✅ No redirect or error
- ✅ Can complete onboarding

**Try as returning user:**
3. Sign in as returning user (already completed)
4. Visit `/onboarding` directly

**Expected Result:**
- ✅ Onboarding wizard loads (doesn't block returning users)
- ✅ Can re-do onboarding if wanted
- ✅ Won't break anything

---

## 🐛 TROUBLESHOOTING

### Issue: Redirect Loop on /onboarding

**Symptoms:**
- Browser shows "This page isn't working" or "Too many redirects"
- URL keeps flickering between `/onboarding` and `/dashboard`

**Cause:**
- Onboarding page is inside `(app)` group
- Layout redirect check triggers for onboarding page itself

**Fix:**
- ✅ Already fixed - onboarding moved outside `(app)` group
- Verify onboarding is at `src/app/onboarding/`, NOT `src/app/(app)/onboarding/`

---

### Issue: New users see dashboard instead of onboarding

**Symptoms:**
- First-time users sign in and see dashboard immediately
- No onboarding wizard shown

**Cause:**
- `profile.onboarding_complete` is `true` for new users
- Database default value might be wrong

**Debug:**
```sql
-- Check what new users have:
SELECT id, email, onboarding_complete 
FROM profiles 
WHERE created_at > NOW() - INTERVAL '1 day';

-- Should show false/null for new users
-- If showing true, that's the problem
```

**Fix:**
```sql
-- Set default to false:
ALTER TABLE profiles 
ALTER COLUMN onboarding_complete 
SET DEFAULT false;

-- Update existing new users:
UPDATE profiles 
SET onboarding_complete = false 
WHERE onboarding_complete IS NULL;
```

---

### Issue: "Next" button stays disabled after uploading resume

**Symptoms:**
- User uploads resume successfully
- Green checkmark appears
- But "Next" button still grayed out

**Cause:**
- `uploadedFile` state not being set
- Upload API might be failing silently

**Debug:**
```javascript
// In browser console (F12):
// Check state after upload
console.log('Uploaded file:', uploadedFile);

// Should show filename, not null/empty
```

**Check API:**
```bash
# Check if parse-resume API works:
curl -X POST https://worthapply.com/api/parse-resume \
  -F "file=@/path/to/resume.pdf"

# Should return success JSON
```

**Fix:**
- Check `/api/parse-resume` endpoint exists
- Verify file upload is working
- Check browser console for errors

---

### Issue: Onboarding completion doesn't stick

**Symptoms:**
- User completes all onboarding steps
- Clicks "Go to dashboard"
- Gets redirected back to onboarding

**Cause:**
- `onboarding_complete` not being saved to database
- Database update failing silently

**Debug:**
```sql
-- Check user's onboarding status:
SELECT id, email, onboarding_complete 
FROM profiles 
WHERE email = 'user@example.com';

-- Should show true after completion
-- If false/null, database update failed
```

**Check logs:**
- Open browser console (F12)
- Look for Supabase errors
- Check Vercel logs for server errors

**Fix:**
- Verify Supabase RLS policies allow updates to `profiles.onboarding_complete`
- Check that user is authenticated
- Verify profile row exists for user

---

### Issue: OAuth redirects to wrong place

**Symptoms:**
- New user completes OAuth
- Gets sent to dashboard instead of onboarding
- OR gets sent to login page

**Cause:**
- OAuth callback not checking `onboarding_complete`
- OR profile query failing

**Debug:**
Check Vercel logs:
```bash
vercel logs worthapply.com --follow
```

Look for:
- "OAuth callback error: ..."
- Profile query errors
- Redirect logic errors

**Fix:**
- Verify callback route at `/auth/callback/route.ts` has onboarding check
- Check that profile query is working
- Verify redirect logic matches code above

---

## 📋 CONFIGURATION CHECKLIST

Before deploying onboarding feature:

### Database
- [ ] `profiles` table has `onboarding_complete` column (BOOLEAN)
- [ ] Default value is `false`
- [ ] RLS policies allow authenticated users to UPDATE this field
- [ ] All other onboarding fields exist (preferred_titles, salary_min, etc.)

### Code
- [ ] Onboarding page is at `src/app/onboarding/` (outside (app) group)
- [ ] App layout has onboarding redirect check
- [ ] OAuth callback has onboarding smart redirect
- [ ] Resume upload is required (Next button disabled without file)
- [ ] Onboarding completion sets `onboarding_complete = true`

### API
- [ ] `/api/parse-resume` endpoint exists and works
- [ ] Accepts PDF, DOC, DOCX files
- [ ] Returns success/error properly
- [ ] Handles file parsing correctly

### Environment
- [ ] Supabase URL and keys configured
- [ ] Vercel deployment successful
- [ ] All dependencies installed
- [ ] No build errors

---

## 🎯 SUCCESS CRITERIA

After deployment, verify:

1. **New User Flow**
   - ✅ OAuth redirects to `/onboarding`
   - ✅ Resume upload is required
   - ✅ Cannot access dashboard until onboarding done
   - ✅ Completion sets `onboarding_complete = true`
   - ✅ Can access dashboard after completion

2. **Returning User Flow**
   - ✅ OAuth redirects to `/dashboard`
   - ✅ No onboarding shown
   - ✅ Full app access immediately
   - ✅ Profile data persists

3. **Security**
   - ✅ Cannot bypass onboarding via URL manipulation
   - ✅ Protected routes redirect to onboarding
   - ✅ Only authenticated users can access onboarding
   - ✅ Onboarding data saved to correct user profile

4. **User Experience**
   - ✅ Clear visual feedback (loading, success, errors)
   - ✅ Helpful error messages
   - ✅ Progress bar shows current step
   - ✅ Smooth transitions between steps
   - ✅ Responsive design (mobile + desktop)

---

## 📚 RELATED DOCUMENTATION

- `OAUTH_FIX_STEPS.md` - OAuth setup and configuration
- `OAUTH_SESSION_FIX.md` - Session handling fixes
- Database schema: `profiles` table documentation
- API documentation: `/api/parse-resume` endpoint

---

**Created:** April 6, 2026  
**Status:** ✅ **DEPLOYED AND READY FOR TESTING**  
**Next Steps:** Test with fresh Google accounts, verify flow works end-to-end
