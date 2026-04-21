-- Remove the 'lifetime' plan tier.
-- Any user previously on 'lifetime' becomes 'premium' (highest remaining tier)
-- with a non-expiring subscription_status of 'active' so their access
-- continues uninterrupted.
--
-- Safe to run multiple times.

UPDATE public.profiles
SET
  plan = 'premium',
  subscription_status = CASE
    WHEN subscription_status = 'lifetime' THEN 'active'
    WHEN subscription_status IS NULL THEN 'active'
    ELSE subscription_status
  END
WHERE plan = 'lifetime';

-- If a plan CHECK constraint existed that enumerated 'lifetime', replace it.
-- This is written defensively: if no constraint exists or it's already
-- correct, nothing breaks.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_plan_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_plan_check;
  END IF;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
    CHECK (plan IN ('free', 'pro', 'premium'));
EXCEPTION WHEN OTHERS THEN
  -- If the table has orphan rows that still say 'lifetime' (race with code deploy),
  -- fix them and retry.
  UPDATE public.profiles SET plan = 'premium' WHERE plan NOT IN ('free', 'pro', 'premium');
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
    CHECK (plan IN ('free', 'pro', 'premium'));
END $$;
