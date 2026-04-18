# ✅ Stripe Subscriptions Setup Complete

**Date:** April 5, 2026  
**Status:** 🟢 **READY FOR TESTING**  
**Test Mode:** Active (using test API keys)  

---

## 🎯 WHAT'S BEEN SET UP

### 1. Stripe Products Created ✅

**Pro Plan:**
- Product ID: `prod_UHWjFhnUlvk2Jd`
- Price ID: `price_1TIxfZGty111o9ymXU6tlxO5`
- Amount: **$39/month**
- Features:
  - Unlimited job analyses
  - Advanced resume tailoring
  - Cover letter generator
  - 10 LinkedIn job searches/month
  - Application tracking
  - Email support

**Premium Plan:**
- Product ID: `prod_UHWjdWZDE6OVLP`
- Price ID: `price_1TIxfaGty111o9ymASINHJSR`
- Amount: **$79/month**
- Features:
  - Everything in Pro
  - 20 LinkedIn job searches/month
  - Priority email support
  - Early access to new features
  - Dedicated success manager

---

### 2. API Routes Created ✅

| Route | Purpose | Method |
|-------|---------|--------|
| `/api/create-checkout-session` | Create Stripe checkout session | POST |
| `/api/webhooks/stripe` | Handle Stripe webhook events | POST |
| `/api/create-portal-session` | Create customer portal session | POST |

---

### 3. Pages Created ✅

| Page | Path | Description |
|------|------|-------------|
| Pricing Page | `/pricing` | Public pricing with Stripe checkout buttons |
| PricingCard Component | Component | Handles Stripe checkout flow |

---

### 4. Environment Variables Set ✅

```bash
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TBzCKGty111o9ym...
STRIPE_SECRET_KEY=sk_test_51TBzCKGty111o9ymwlFjcc...
STRIPE_PRO_PRICE_ID=price_1TIxfZGty111o9ymXU6tlxO5
STRIPE_PREMIUM_PRICE_ID=price_1TIxfaGty111o9ymASINHJSR
STRIPE_WEBHOOK_SECRET=(to be set after webhook creation)

# App URL
NEXT_PUBLIC_SITE_URL=https://worthapply.com
```

---

## 🔧 NEXT STEPS (Required Before Going Live)

### Step 1: Set Up Stripe Webhook (10 minutes)

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Click "Add Endpoint"**

3. **Configure Webhook:**
   - Endpoint URL: `https://worthapply.com/api/webhooks/stripe`
   - Events to send:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`

4. **Get Webhook Secret:**
   - After creating, click on the webhook
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

5. **Add to Environment:**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

6. **Redeploy:**
   ```bash
   git push  # Vercel will auto-deploy
   ```

---

### Step 2: Update Database Schema (5 minutes)

Add Stripe-related columns to the `profiles` table:

```sql
-- Add to profiles table (if not already there)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON profiles(subscription_status);
```

Run this in: **Supabase Dashboard → SQL Editor**

---

### Step 3: Test the Payment Flow (15 minutes)

#### Test Card Numbers (Test Mode):

| Card | Number | Result |
|------|--------|--------|
| Success | `4242 4242 4242 4242` | Payment succeeds |
| Declined | `4000 0000 0000 0002` | Card declined |
| Insufficient Funds | `4000 0000 0000 9995` | Insufficient funds |
| Requires Authentication | `4000 0025 0000 3155` | 3D Secure |

**Test Details:**
- Any future expiry date (e.g., 12/30)
- Any 3-digit CVC
- Any ZIP code

#### Test Flow:

1. **Go to Pricing Page:**
   - Navigate to https://worthapply.com/pricing

2. **Click "Get Started" on Pro Plan:**
   - Should redirect to Stripe Checkout

3. **Fill in Test Card:**
   - Email: test@example.com
   - Card: 4242 4242 4242 4242
   - Expiry: 12/30
   - CVC: 123
   - ZIP: 12345

4. **Complete Payment:**
   - Should redirect to dashboard with `?success=true`

5. **Verify in Supabase:**
   - Check `profiles` table
   - Verify `plan` changed to `'pro'`
   - Verify `stripe_customer_id` and `stripe_subscription_id` are set

6. **Check Stripe Dashboard:**
   - Go to Customers
   - Find your test customer
   - Verify subscription is active

---

### Step 4: Test Subscription Management (10 minutes)

1. **Create a settings page button:**
   ```tsx
   // In Settings page
   const handleManageSubscription = async () => {
     const res = await fetch('/api/create-portal-session', {
       method: 'POST'
     });
     const { url } = await res.json();
     window.location.href = url;
   };
   ```

2. **Click "Manage Subscription":**
   - Should open Stripe Customer Portal

3. **Test Actions:**
   - ✅ Update payment method
   - ✅ View invoices
   - ✅ Cancel subscription
   - ✅ Resume subscription

4. **Verify Changes:**
   - Check Supabase profiles table
   - Verify status updates (active → canceled)

---

### Step 5: Deploy to Production (When Ready)

1. **Get Production Stripe Keys:**
   - Stripe Dashboard → Switch to "Production"
   - Developers → API Keys
   - Copy Publishable Key and Secret Key

2. **Create Production Products:**
   - Run the product creation script with production keys
   - Or create manually in Stripe Dashboard

3. **Update Vercel Environment:**
   ```bash
   # Production Environment Variables
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRO_PRICE_ID=price_prod_...
   STRIPE_PREMIUM_PRICE_ID=price_prod_...
   STRIPE_WEBHOOK_SECRET=whsec_prod_...
   ```

4. **Set Up Production Webhook:**
   - Use same steps as test webhook
   - URL: `https://worthapply.com/api/webhooks/stripe`

---

## 📊 HOW IT WORKS

### Payment Flow:

```
1. User clicks "Get Started" on Pro plan
   ↓
2. Frontend calls /api/create-checkout-session
   ↓
3. API creates Stripe checkout session
   ↓
4. User redirected to Stripe Checkout
   ↓
5. User enters payment info
   ↓
6. Stripe processes payment
   ↓
7. Stripe sends webhook: checkout.session.completed
   ↓
8. Webhook handler updates user profile:
   - plan: 'pro'
   - stripe_customer_id: 'cus_...'
   - stripe_subscription_id: 'sub_...'
   - subscription_status: 'active'
   ↓
9. User redirected to dashboard with success message
```

### Webhook Events:

| Event | Triggered When | Action |
|-------|---------------|--------|
| `checkout.session.completed` | User completes payment | Activate subscription, update profile |
| `customer.subscription.updated` | Plan changed or renewed | Update profile with new status |
| `customer.subscription.deleted` | User cancels subscription | Downgrade to free plan |
| `invoice.payment_succeeded` | Recurring payment succeeds | Log successful payment |
| `invoice.payment_failed` | Recurring payment fails | Send email notification |

---

## 🧪 TESTING CHECKLIST

### Before Launch:

- [ ] Webhook endpoint created and secret added to env
- [ ] Database schema updated with Stripe columns
- [ ] Test checkout flow works (card 4242...)
- [ ] Verify profile updates after payment
- [ ] Test customer portal (manage subscription)
- [ ] Test subscription cancellation
- [ ] Verify webhook events are received
- [ ] Test payment failure scenario
- [ ] Check email notifications (if implemented)
- [ ] Review Stripe Dashboard for test data

### Production Checklist:

- [ ] Switch to production Stripe keys
- [ ] Create production products and prices
- [ ] Set up production webhook
- [ ] Update environment variables in Vercel
- [ ] Test with real payment (small amount)
- [ ] Verify production webhook works
- [ ] Check production Stripe Dashboard
- [ ] Enable fraud detection (Stripe Radar)
- [ ] Set up billing alerts
- [ ] Review tax settings (if applicable)

---

## 🔐 SECURITY NOTES

### Webhook Signature Verification:

The webhook handler verifies that requests are actually from Stripe:

```typescript
const event = stripe.webhooks.constructEvent(
  body, 
  signature, 
  webhookSecret
);
```

This prevents unauthorized requests from updating user subscriptions.

### Environment Variables:

**Never commit:**
- ❌ `STRIPE_SECRET_KEY`
- ❌ `STRIPE_WEBHOOK_SECRET`

**Safe to commit:**
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (public key)
- ✅ Product/Price IDs (public)

### RLS Policies:

Ensure Supabase RLS policies allow webhook to update profiles:

```sql
-- Service role key bypasses RLS, but good practice to have policy
CREATE POLICY "Allow stripe webhook to update subscriptions"
ON profiles
FOR UPDATE
TO service_role
USING (true);
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Unauthorized" when clicking Get Started

**Cause:** User not logged in  
**Fix:** Redirect to /login first, then to pricing

### Issue: Webhook not receiving events

**Cause 1:** Webhook secret not set in env  
**Fix:** Add `STRIPE_WEBHOOK_SECRET` to Vercel env vars

**Cause 2:** Webhook URL incorrect  
**Fix:** Verify URL is `https://worthapply.com/api/webhooks/stripe`

**Cause 3:** Vercel deployment pending  
**Fix:** Wait for deployment to complete, redeploy if needed

### Issue: Profile not updating after payment

**Cause 1:** Webhook handler error  
**Fix:** Check Vercel logs: `vercel logs --follow`

**Cause 2:** User ID not in webhook metadata  
**Fix:** Verify `metadata.userId` is set in checkout session

**Cause 3:** Database permissions  
**Fix:** Use service role key in webhook handler (already configured)

### Issue: Stripe checkout shows wrong amount

**Cause:** Using wrong Price ID  
**Fix:** Verify `STRIPE_PRO_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID` are correct

---

## 📈 ANALYTICS TO TRACK

### Key Metrics:

1. **Conversion Rate:**
   - Pricing page views → Checkout starts
   - Checkout starts → Successful payments

2. **Revenue Metrics:**
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Average revenue per user (ARPU)

3. **Payment Failures:**
   - Failed payment rate
   - Declined card reasons
   - Dunning success rate

### Stripe Dashboard Reports:

- Revenue → Overview
- Customers → Subscriptions
- Billing → Invoices
- Payments → Declined payments

---

## 🎓 RESOURCES

### Stripe Documentation:

- [Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Testing](https://stripe.com/docs/testing)

### Useful Stripe CLI Commands:

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to localhost (for local testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

---

## 📝 FILES CREATED

| File | Purpose |
|------|---------|
| `src/app/api/create-checkout-session/route.ts` | Create Stripe checkout sessions |
| `src/app/api/webhooks/stripe/route.ts` | Handle Stripe webhook events |
| `src/app/api/create-portal-session/route.ts` | Create customer portal sessions |
| `src/app/(marketing)/pricing/page.tsx` | Public pricing page |
| `src/components/marketing/PricingCard.tsx` | Pricing card with checkout |
| `STRIPE_SETUP_COMPLETE.md` | This documentation |

---

## 🚀 LAUNCH STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Stripe Products | ✅ Created | Pro ($39) + Premium ($79) |
| API Routes | ✅ Built | Checkout, Webhook, Portal |
| Pricing Page | ✅ Built | /pricing with Stripe buttons |
| Environment | ✅ Configured | Test keys added |
| Database | ⚠️ Pending | Need to add Stripe columns |
| Webhook | ⚠️ Pending | Need to create in Stripe Dashboard |
| Testing | ⏸️ Ready | Waiting for webhook setup |
| Production | ⏸️ Pending | Need production keys |

---

## ⏱️ TIME TO LAUNCH

**Remaining Tasks:**
1. Add Stripe columns to database (5 min)
2. Create webhook in Stripe Dashboard (10 min)
3. Test payment flow (15 min)
4. Test subscription management (10 min)

**Total:** ~40 minutes to fully tested

---

## 🎉 SUCCESS CRITERIA

Payment system is ready when:

✅ User can upgrade from pricing page  
✅ Payment succeeds with test card  
✅ Profile updates to 'pro' plan  
✅ Stripe customer and subscription IDs are saved  
✅ User can access Pro features  
✅ User can manage subscription from settings  
✅ Webhook events are logged correctly  
✅ Subscription cancellation works  

---

**Status:** 🟢 Core implementation complete, ready for webhook setup  
**Next:** Follow Step 1 to set up webhook in Stripe Dashboard
