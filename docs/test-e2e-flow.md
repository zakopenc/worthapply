# 🧪 WorthApply E2E Flow Test

**Date:** April 6, 2026  
**Testing:** Production site (https://worthapply.com)

---

## ✅ Test 1: Signup Flow

1. Go to https://worthapply.com/signup
2. Enter test credentials:
   - Name: `E2E Test User`
   - Email: `test-e2e-${Date.now()}@worthapply.test`
   - Password: `TestPassword123!`
3. Check terms and conditions
4. Click "Sign Up"
5. ✅ **Expected:** Redirect to dashboard OR verify-email page
6. ✅ **Expected:** Profile created in Supabase `profiles` table

---

## ✅ Test 2: Job Analysis Flow

1. Login with test account
2. Go to /analyzer
3. Paste a job description (sample):
   ```
   Senior Software Engineer
   
   We're looking for a Senior Software Engineer to join our team.
   
   Requirements:
   - 5+ years of experience with React, Node.js
   - Strong TypeScript skills
   - Experience with AWS
   
   Salary: $120k-$150k
   ```
4. Click "Analyze fit"
5. ✅ **Expected:** Analysis completes without "Failed to reserve usage" error
6. ✅ **Expected:** Match score displayed (0-100)
7. ✅ **Expected:** Evidence suggestions shown

---

## ✅ Test 3: Resume Upload Flow

1. From analyzer results, click "Upload Resume"
2. Upload a PDF resume file
3. ✅ **Expected:** File uploads successfully
4. ✅ **Expected:** Resume appears in /resume page
5. ✅ **Expected:** Can view and download resume

---

## ✅ Test 4: Resume Tailoring Flow

1. Go to /tailor
2. Select uploaded resume
3. Select job analysis
4. Click "Tailor Resume"
5. ✅ **Expected:** AI generates tailored suggestions
6. ✅ **Expected:** Can download tailored resume

---

## ✅ Test 5: Cover Letter Flow

1. Go to /cover-letter
2. Select a job analysis
3. Click "Generate Cover Letter"
4. ✅ **Expected:** AI generates cover letter
5. ✅ **Expected:** Can edit and download

---

## ✅ Test 6: Application Tracking Flow

1. Go to /applications
2. Click "Add Application"
3. Fill in:
   - Company: "Test Company"
   - Job Title: "Software Engineer"
   - Status: "Applied"
4. Click "Save"
5. ✅ **Expected:** Application appears in tracker
6. ✅ **Expected:** Can update status
7. ✅ **Expected:** Shows on dashboard

---

## ✅ Test 7: Payment Flow (Pro Plan)

1. Go to /pricing
2. Click "Get Started" on Pro plan ($39/month)
3. If not logged in:
   - ✅ **Expected:** Redirect to signup
   - ✅ **Expected:** After signup, auto-redirect back to pricing
   - ✅ **Expected:** Auto-trigger checkout
4. If logged in:
   - ✅ **Expected:** Immediate redirect to Stripe checkout
5. Enter test card: `4242 4242 4242 4242`
6. Complete payment
7. ✅ **Expected:** Redirect to /dashboard?success=true
8. ✅ **Expected:** Profile updated with `plan: 'pro'`
9. ✅ **Expected:** Stripe webhook triggered
10. ✅ **Expected:** Subscription status in database

---

## ✅ Test 8: RLS Policies Verification

1. Open browser console
2. Try to access another user's data via Supabase client
3. ✅ **Expected:** Access denied (RLS blocking it)
4. ✅ **Expected:** Only own profile/applications visible

---

## 🔍 Manual Verification Checklist

### Database (Supabase)

- [ ] Profile created with correct user_id
- [ ] Profile has `plan: 'free'` by default
- [ ] RLS policies allow user to read/write own data
- [ ] RLS policies block access to other users' data

### Authentication

- [ ] Signup creates auth user
- [ ] Login works
- [ ] Logout works
- [ ] Session persists across page refreshes

### Features (Free Plan)

- [ ] Can analyze 3 jobs per month
- [ ] Can upload resume
- [ ] Can track applications
- [ ] Cannot access premium features

### Features (Pro Plan)

- [ ] Unlimited job analyses
- [ ] Cover letter generator
- [ ] LinkedIn job scraper
- [ ] All free features

### Stripe Integration

- [ ] Webhook receives events
- [ ] Database updates on successful payment
- [ ] Subscription status tracked
- [ ] Plan upgraded in profile

---

## 🐛 Known Issues / Edge Cases

1. **Email verification:** If Supabase has email confirmation enabled, users must verify email before accessing features
2. **File size limits:** Resume uploads limited to 5MB
3. **Rate limiting:** Job analysis may be rate-limited for abuse prevention

---

## 📊 Test Results

| Test | Status | Notes |
|------|--------|-------|
| Signup | ✅ PASS | |
| Job Analysis | ✅ PASS | |
| Resume Upload | ⏳ PENDING | |
| Resume Tailoring | ⏳ PENDING | |
| Cover Letter | ⏳ PENDING | |
| Application Tracking | ⏳ PENDING | |
| Payment Flow | ⏳ PENDING | |
| RLS Policies | ✅ PASS | Already verified |

---

## 🚀 Next Steps After E2E Testing

1. **Performance Testing** - Load testing with multiple concurrent users
2. **Mobile Testing** - Test on real iOS/Android devices
3. **Browser Compatibility** - Test on Safari, Firefox, Edge
4. **Accessibility Testing** - Screen reader, keyboard navigation
5. **Security Audit** - Penetration testing, security scan

---

*Last updated: April 6, 2026*
