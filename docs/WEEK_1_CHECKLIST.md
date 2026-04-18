# WEEK 1 CHECKLIST - Foundation Week
**Dates:** April 7-13, 2026  
**Status:** Week 1 of 78  
**Goal:** LLC formed, backend working, legally protected  
**Hours:** 18 hours  
**Cost:** $2,500  

---

## MONDAY (3 hours) - Legal Foundation

### Morning (Before Work):
- [ ] **8:00-8:30am** - Go to Northwest Registered Agent website
  - URL: https://www.northwestregisteredagent.com
  - Click "Form an LLC"
  - Fill out form (Business name: "WorthApply LLC")
  - Pay $39 + state fee
  - **DONE = LLC filed** ✅

### Evening (After Work):
- [ ] **6:00-6:30pm** - Get EIN from IRS
  - URL: https://www.irs.gov/ein
  - Click "Apply Online Now"
  - Fill out form (takes 10 minutes)
  - Get EIN instantly
  - Save EIN letter to Google Drive
  - **DONE = EIN received** ✅

- [ ] **6:30-7:30pm** - Open business bank account
  - Option 1: Go to Chase/Wells Fargo branch
  - Option 2: Apply online at Mercury.com (faster)
  - Bring: LLC filing receipt, EIN letter, driver's license
  - Deposit: $1,000 initial capital
  - **DONE = Bank account open** ✅

- [ ] **7:30-8:00pm** - Set up QuickBooks
  - Sign up: https://quickbooks.intuit.com ($30/month)
  - Connect business bank account
  - Set up chart of accounts (use template)
  - **DONE = Accounting ready** ✅

**Monday Deliverable:** ✅ Legal entity exists, can accept payments

---

## TUESDAY (3 hours) - Fix Backend

### Evening (After Work):
- [ ] **6:00-6:30pm** - Fix Supabase RLS policies
  - Open Supabase SQL Editor
  - Copy-paste `fix_rls_policies.sql`
  - Click "Run"
  - Verify 4 policies created
  - **DONE = Profiles table accessible** ✅

- [ ] **6:30-6:45pm** - Add Stripe database columns
  - Open Supabase SQL Editor
  - Copy-paste `add_stripe_columns.sql`
  - Click "Run"
  - Verify 4 columns added
  - **DONE = Database ready for Stripe** ✅

- [ ] **6:45-7:30pm** - Test signup flow
  - Create new test user (test2@example.com)
  - Verify profile row created in database
  - Check NO errors in console
  - **DONE = Signup working** ✅

- [ ] **7:30-9:00pm** - Test job analysis
  - Log in as test user
  - Go to /analyzer
  - Paste job description
  - Click "Analyze fit"
  - Verify NO "Failed to reserve usage" error
  - Verify 92% score appears
  - **DONE = Core feature working** ✅

**Tuesday Deliverable:** ✅ Backend blocker fixed, users can use product

---

## WEDNESDAY (2 hours) - Payments Working

### Evening (After Work):
- [ ] **6:00-6:15pm** - Create Stripe webhook
  - Go to Stripe Dashboard → Webhooks
  - Click "Add Endpoint"
  - URL: `https://worthapply.com/api/webhooks/stripe`
  - Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
  - Click "Add endpoint"
  - Copy webhook secret (starts with `whsec_`)
  - **DONE = Webhook created** ✅

- [ ] **6:15-6:30pm** - Add webhook secret to Vercel
  - Go to Vercel Dashboard → Settings → Environment Variables
  - Add: `STRIPE_WEBHOOK_SECRET=whsec_...`
  - Click "Save"
  - Wait for deployment to finish
  - **DONE = Webhook connected** ✅

- [ ] **6:30-7:30pm** - Test payment flow END-TO-END
  - Go to worthapply.com/pricing
  - Click "Get Started" on Pro plan
  - Use test card: 4242 4242 4242 4242
  - Expiry: 12/30, CVC: 123, ZIP: 12345
  - Complete payment
  - Verify redirect to dashboard with success message
  - Check Supabase profiles table → plan = 'pro' ✅
  - Check Stripe Dashboard → subscription created ✅
  - **DONE = Payments working end-to-end** ✅

- [ ] **7:30-8:00pm** - Test subscription cancellation
  - Log in as paid test user
  - Click "Manage Subscription" (if button exists)
  - OR call API: `fetch('/api/create-portal-session', {method: 'POST'})`
  - Cancel subscription in Stripe portal
  - Verify profile downgrades to 'free'
  - **DONE = Subscription lifecycle working** ✅

**Wednesday Deliverable:** ✅ Full payment system functional

---

## THURSDAY (3 hours) - Insurance

### Evening (After Work):
- [ ] **6:00-7:00pm** - Get insurance quotes
  - Hiscox.com → Business insurance → Tech E&O
  - Fill out form (takes 30 min)
  - Get quote
  - **Quote 1:** $______/year ✅
  
  - SimplyBusiness.com → Compare quotes
  - Fill out form
  - Get 3-5 quotes
  - **Best quote:** $______/year ✅

- [ ] **7:00-8:00pm** - Purchase insurance
  - Cyber Liability: $1,000-3,000/year (REQUIRED)
  - E&O (Professional): $800-1,500/year (REQUIRED)
  - General Liability: $300-600/year (OPTIONAL for now)
  - Pay for policies
  - Download certificates
  - Save to Google Drive → Insurance folder
  - **DONE = Legally protected** ✅

- [ ] **8:00-9:00pm** - Update Vercel environment variables
  - Go to Vercel Dashboard → Settings → Environment Variables
  - Add ALL from .env.local:
    - NEXT_PUBLIC_SITE_URL
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    - SUPABASE_SERVICE_ROLE_KEY
    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    - STRIPE_SECRET_KEY
    - STRIPE_PRO_PRICE_ID
    - STRIPE_PREMIUM_PRICE_ID
    - STRIPE_WEBHOOK_SECRET
  - Click "Save"
  - Redeploy
  - **DONE = Production environment configured** ✅

**Thursday Deliverable:** ✅ Business protected, production ready

---

## FRIDAY (3 hours) - Legal Docs

### Evening (After Work):
- [ ] **6:00-7:00pm** - Create Terms of Service
  - Go to Termly.io or TermsFeed.com
  - Generate Terms of Service ($50-100)
  - Customize for WorthApply:
    - Add refund policy (7-day money-back)
    - Add disclaimer (AI-generated content)
    - Add limitation of liability
  - Download HTML
  - **DONE = Terms created** ✅

- [ ] **7:00-8:00pm** - Create Privacy Policy
  - Use same service (Termly/TermsFeed)
  - Generate Privacy Policy (GDPR/CCPA compliant)
  - Include:
    - What data we collect (resumes, email, usage)
    - How we use it (job analysis, AI processing)
    - Third parties (Stripe, OpenAI, Supabase)
    - User rights (delete data, export data)
  - Download HTML
  - **DONE = Privacy policy created** ✅

- [ ] **8:00-9:00pm** - Add to website
  - Create /terms page
  - Create /privacy page
  - Add links to footer
  - Update signup page (checkbox: "I agree to Terms and Privacy Policy")
  - Deploy
  - **DONE = Legal compliance** ✅

**Friday Deliverable:** ✅ Legally compliant, ready to accept customers

---

## SATURDAY-SUNDAY (4 hours) - Polish & Prep

### Saturday Morning (2 hours):
- [ ] **9:00-10:00am** - Fix all console errors
  - Open Chrome DevTools → Console
  - Fix each error/warning
  - Test all pages (homepage, pricing, demo, analyzer, dashboard)
  - Verify ZERO errors
  - **DONE = Clean console** ✅

- [ ] **10:00-11:00am** - Add loading states
  - Add spinners to:
    - Signup form (while creating account)
    - Analyzer (while analyzing job)
    - Payment button (while processing)
  - Test each one
  - **DONE = Better UX** ✅

### Sunday Morning (2 hours):
- [ ] **9:00-10:00am** - Test on mobile
  - Open worthapply.com on phone
  - Test full flow: signup → analyze → upgrade
  - Fix any UI issues (buttons too small, text overlapping)
  - **DONE = Mobile-friendly** ✅

- [ ] **10:00-11:00am** - Create demo video
  - Record screen with Loom (free)
  - Show: signup → upload resume → analyze job → see 92% score
  - 3-5 minutes max
  - Upload to YouTube (unlisted)
  - Embed on /demo page
  - **DONE = Demo video ready** ✅

**Weekend Deliverable:** ✅ Product polished, ready to show customers

---

## END OF WEEK 1 CHECKLIST

### ✅ COMPLETED:
- [ ] LLC formed (legal entity exists)
- [ ] EIN received (can hire, pay taxes)
- [ ] Business bank account open (can accept payments)
- [ ] Accounting set up (QuickBooks)
- [ ] RLS policies fixed (backend working)
- [ ] Stripe webhook configured (payments automated)
- [ ] Payment flow tested (end-to-end working)
- [ ] Insurance purchased (legally protected)
- [ ] Terms & Privacy created (legal compliance)
- [ ] Console errors fixed (polished product)
- [ ] Loading states added (better UX)
- [ ] Mobile tested (responsive design)
- [ ] Demo video created (sales asset)

### 📊 METRICS:
- [ ] Hours worked this week: _____ / 18
- [ ] Money spent: $_______ / $2,500
- [ ] Blockers encountered: _________________
- [ ] Help needed: _________________

### 🎯 WEEK 2 PREVIEW:
**Next week focus:** Content creation, marketing setup, launch prep
- Write 3 blog posts (SEO)
- Set up social media accounts
- Create Product Hunt listing
- Plan launch strategy

**You'll be ready to launch in Week 4!**

---

## 🔥 MOTIVATION

**You committed.**

**Now execute.**

**No excuses. Just ship.**

**Week 1 = Foundation.**
**Week 4 = Launch.**
**Month 18 = $10k MRR.**

**Let's go.** 🚀

---

**Print this checklist. Cross off each item. Feel the momentum build.**
