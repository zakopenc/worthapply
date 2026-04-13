
-- Update the RPC function to ensure it creates the usage record if it doesn't exist
CREATE OR REPLACE FUNCTION public.reserve_monthly_usage(
  p_feature TEXT,
  p_limit INTEGER DEFAULT NULL,
  p_month DATE DEFAULT NULL
)
RETURNS TABLE(allowed BOOLEAN, used INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_count INTEGER := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  p_month := COALESCE(p_month, date_trunc('month', timezone('utc', now()))::date);

  IF p_feature NOT IN ('analyses', 'tailoring', 'cover_letters') THEN
    RAISE EXCEPTION 'Unsupported usage feature: %', p_feature;
  END IF;

  -- Ensure record exists for this user/month
  INSERT INTO public.usage_tracking (user_id, month)
  VALUES (current_user_id, p_month)
  ON CONFLICT (user_id, month) DO NOTHING;

  -- Fetch current usage with lock
  SELECT CASE
    WHEN p_feature = 'analyses' THEN analyses_count
    WHEN p_feature = 'tailoring' THEN tailoring_count
    ELSE cover_letter_count
  END
  INTO current_count
  FROM public.usage_tracking
  WHERE user_id = current_user_id
    AND month = p_month
  FOR UPDATE;

  -- Check limit
  IF p_limit IS NOT NULL AND current_count >= p_limit THEN
    RETURN QUERY SELECT false, current_count;
    RETURN;
  END IF;

  -- Increment usage
  UPDATE public.usage_tracking
  SET analyses_count = analyses_count + CASE WHEN p_feature = 'analyses' THEN 1 ELSE 0 END,
      tailoring_count = tailoring_count + CASE WHEN p_feature = 'tailoring' THEN 1 ELSE 0 END,
      cover_letter_count = cover_letter_count + CASE WHEN p_feature = 'cover_letters' THEN 1 ELSE 0 END
  WHERE user_id = current_user_id
    AND month = p_month
  RETURNING CASE
    WHEN p_feature = 'analyses' THEN analyses_count
    WHEN p_feature = 'tailoring' THEN tailoring_count
    ELSE cover_letter_count
  END
  INTO current_count;

  RETURN QUERY SELECT true, current_count;
END;
$$;
