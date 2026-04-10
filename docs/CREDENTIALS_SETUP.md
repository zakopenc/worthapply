# 🔑 Credentials Setup Guide

## Supabase Credentials

**Project ID Found:** `hfeitnerllyoszkcqlof`

### Your Supabase URL:
```
https://hfeitnerllyoszkcqlof.supabase.co
```

### How to Get Your Keys:

1. **Go to:** https://supabase.com/dashboard/project/hfeitnerllyoszkcqlof/settings/api

2. **Copy these values:**

   **NEXT_PUBLIC_SUPABASE_URL:**
   ```
   https://hfeitnerllyoszkcqlof.supabase.co
   ```

   **NEXT_PUBLIC_SUPABASE_ANON_KEY:**
   - Look for "Project API keys" section
   - Copy the `anon` / `public` key
   - Should start with `eyJ...`

   **SUPABASE_SERVICE_ROLE_KEY:**
   - In same section
   - Copy the `service_role` key
   - Should start with `eyJ...`
   - ⚠️ Keep this secret (has admin access)

3. **Add to `.env.local`:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hfeitnerllyoszkcqlof.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (paste your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (paste your service role key)

# Gemini (already added)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDYraG5UPMylg-OyxQVSI3QSFwD3hg4s8c
```

---

## Stripe Credentials

### How to Get Your Keys:

1. **Go to:** https://dashboard.stripe.com/test/apikeys

2. **For Testing (Recommended First):**

   **STRIPE_SECRET_KEY:**
   - Copy "Secret key" (starts with `sk_test_`)
   - Click "Reveal test key"

   **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:**
   - Copy "Publishable key" (starts with `pk_test_`)

3. **For Webhooks:**

   **a) Install Stripe CLI (for local testing):**
   ```bash
   brew install stripe/stripe-cli/stripe
   # or
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

   **b) Login:**
   ```bash
   stripe login
   ```

   **c) Forward webhooks:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   This will give you a webhook secret like: `whsec_...`

4. **Add to `.env.local`:**
```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_... (paste your secret key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (paste your publishable key)
STRIPE_WEBHOOK_SECRET=whsec_... (from stripe listen command)
```

### For Production:
- Use `sk_live_` and `pk_live_` keys
- Set up webhook endpoint in Stripe Dashboard
- Use production webhook secret

---

## Vercel Environment Variables

If you're deploying to Vercel, also add these in:
**Vercel Dashboard → Project → Settings → Environment Variables**

Add all the same variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## Quick Test After Setup

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Signup
- Go to http://localhost:3000/signup
- Create an account
- Should redirect to dashboard

### 3. Test AI Analyzer
- Go to http://localhost:3000/analyzer
- Upload a test resume (PDF or DOCX)
- Paste a job description
- Click "Analyze Job Fit"
- Should see analysis results in ~10 seconds

### 4. Test Stripe Checkout
- Go to http://localhost:3000/pricing
- Click "Upgrade to Pro"
- Should open Stripe checkout
- Use test card: `4242 4242 4242 4242`
- Any future date, any CVC

If all 4 work → **YOU'RE READY TO LAUNCH** 🚀

---

## Troubleshooting

### Supabase Connection Errors
```
Error: Invalid JWT token
```
**Fix:** Check that your anon key is correct and not expired

```
Error: relation "profiles" does not exist
```
**Fix:** Run migrations:
```bash
cd supabase
./run-migration.sh
```

### Gemini API Errors
```
Error: API key not valid
```
**Fix:** Verify key at https://aistudio.google.com/apikey

```
Error: Quota exceeded
```
**Fix:** Check billing in Google Cloud Console

### Stripe Errors
```
Error: No such customer
```
**Fix:** Make sure you're using test keys for test mode

```
Error: Webhook signature verification failed
```
**Fix:** Update `STRIPE_WEBHOOK_SECRET` from `stripe listen` output

---

## Security Notes

⚠️ **NEVER commit `.env.local` to git** (already in .gitignore)

⚠️ **Service Role Key** has full database access - keep it secret

⚠️ **Production Stripe Keys** should only be in Vercel, not local

✅ **Anon Keys** are safe to expose (they're client-side)

---

## Next Steps After Setup

1. [ ] Add credentials to `.env.local`
2. [ ] Test signup flow
3. [ ] Test analyzer with real job
4. [ ] Test Stripe checkout
5. [ ] Add same credentials to Vercel
6. [ ] Deploy to production
7. [ ] Test production build
8. [ ] Launch Google Ads 🚀

**ETA:** 30 minutes if you have access to all dashboards
