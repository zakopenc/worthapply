-- ============================================================
-- ADD STRIPE COLUMNS TO PROFILES TABLE
-- Required for Stripe subscription integration
-- ============================================================

-- Add Stripe-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON profiles(subscription_status);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('stripe_customer_id', 'stripe_subscription_id', 'subscription_status', 'subscription_current_period_end')
ORDER BY column_name;

-- ============================================================
-- EXPECTED RESULT:
-- You should see 4 rows:
-- 1. stripe_customer_id (text)
-- 2. stripe_subscription_id (text)
-- 3. subscription_current_period_end (timestamp with time zone)
-- 4. subscription_status (text)
-- ============================================================
