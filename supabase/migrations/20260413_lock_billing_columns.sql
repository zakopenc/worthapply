-- Migration: Prevent users from modifying billing-sensitive columns via RLS
-- These columns should only be updated by the service role (webhook handler).

-- Create a trigger function that blocks user-level updates to billing columns.
-- The service role bypasses RLS (and triggers marked SECURITY DEFINER), so
-- webhook updates still work.
CREATE OR REPLACE FUNCTION public.protect_billing_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the current role is the service_role, allow all changes (webhooks)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block changes to billing-sensitive columns
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'Cannot modify plan directly. Use the billing portal.';
  END IF;

  IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Cannot modify stripe_customer_id directly.';
  END IF;

  IF NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id THEN
    RAISE EXCEPTION 'Cannot modify stripe_subscription_id directly.';
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'Cannot modify subscription_status directly.';
  END IF;

  IF NEW.subscription_current_period_end IS DISTINCT FROM OLD.subscription_current_period_end THEN
    RAISE EXCEPTION 'Cannot modify subscription_current_period_end directly.';
  END IF;

  IF NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at THEN
    RAISE EXCEPTION 'Cannot modify trial_ends_at directly.';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS protect_billing_columns_trigger ON public.profiles;
CREATE TRIGGER protect_billing_columns_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_billing_columns();
