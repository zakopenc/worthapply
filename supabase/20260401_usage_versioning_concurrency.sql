ALTER TABLE public.usage_tracking
  ADD COLUMN IF NOT EXISTS tailoring_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cover_letter_count INTEGER NOT NULL DEFAULT 0;

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

  INSERT INTO public.usage_tracking (user_id, month)
  VALUES (current_user_id, p_month)
  ON CONFLICT (user_id, month) DO UPDATE SET updated_at = now();

  -- Get current count, defaulting to 0 if the row was just inserted
  SELECT CASE
    WHEN p_feature = 'analyses' THEN analyses_count
    WHEN p_feature = 'tailoring' THEN tailoring_count
    ELSE cover_letter_count
  END
  INTO current_count
  FROM public.usage_tracking
  WHERE user_id = current_user_id
    AND month = p_month;

  IF p_limit IS NOT NULL AND current_count >= p_limit THEN
    RETURN QUERY SELECT false, current_count;
    RETURN;
  END IF;

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

CREATE OR REPLACE FUNCTION public.release_monthly_usage(
  p_feature TEXT,
  p_month DATE DEFAULT NULL
)
RETURNS INTEGER
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

  INSERT INTO public.usage_tracking (user_id, month)
  VALUES (current_user_id, p_month)
  ON CONFLICT (user_id, month) DO NOTHING;

  UPDATE public.usage_tracking
  SET analyses_count = CASE
        WHEN p_feature = 'analyses' THEN GREATEST(analyses_count - 1, 0)
        ELSE analyses_count
      END,
      tailoring_count = CASE
        WHEN p_feature = 'tailoring' THEN GREATEST(tailoring_count - 1, 0)
        ELSE tailoring_count
      END,
      cover_letter_count = CASE
        WHEN p_feature = 'cover_letters' THEN GREATEST(cover_letter_count - 1, 0)
        ELSE cover_letter_count
      END
  WHERE user_id = current_user_id
    AND month = p_month
  RETURNING CASE
    WHEN p_feature = 'analyses' THEN analyses_count
    WHEN p_feature = 'tailoring' THEN tailoring_count
    ELSE cover_letter_count
  END
  INTO current_count;

  RETURN current_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_tailored_resume_version(
  p_application_id UUID,
  p_analysis_id UUID,
  p_content JSONB,
  p_original_score INTEGER,
  p_tailored_score INTEGER,
  p_ats_check JSONB,
  p_tone_check JSONB
)
RETURNS public.tailored_resumes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  next_version INTEGER := 1;
  inserted_row public.tailored_resumes%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.applications
    WHERE id = p_application_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.job_analyses
    WHERE id = p_analysis_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Analysis not found';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('tailored_resumes'), hashtext(current_user_id::text || ':' || p_application_id::text));

  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.tailored_resumes
  WHERE user_id = current_user_id
    AND application_id = p_application_id;

  INSERT INTO public.tailored_resumes (
    user_id,
    application_id,
    analysis_id,
    version,
    content,
    original_score,
    tailored_score,
    ats_check,
    tone_check
  )
  VALUES (
    current_user_id,
    p_application_id,
    p_analysis_id,
    next_version,
    COALESCE(p_content, '{}'::jsonb),
    COALESCE(p_original_score, 0),
    COALESCE(p_tailored_score, 0),
    COALESCE(p_ats_check, '{}'::jsonb),
    COALESCE(p_tone_check, '{}'::jsonb)
  )
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_cover_letter_version(
  p_application_id UUID,
  p_analysis_id UUID,
  p_recommendation TEXT,
  p_content TEXT
)
RETURNS public.cover_letters
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  next_version INTEGER := 1;
  inserted_row public.cover_letters%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.applications
    WHERE id = p_application_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.job_analyses
    WHERE id = p_analysis_id
      AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Analysis not found';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('cover_letters'), hashtext(current_user_id::text || ':' || p_application_id::text));

  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.cover_letters
  WHERE user_id = current_user_id
    AND application_id = p_application_id;

  INSERT INTO public.cover_letters (
    user_id,
    application_id,
    analysis_id,
    recommendation,
    content,
    version
  )
  VALUES (
    current_user_id,
    p_application_id,
    p_analysis_id,
    COALESCE(p_recommendation, 'skip'),
    p_content,
    next_version
  )
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_monthly_usage(TEXT, INTEGER, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_monthly_usage(TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tailored_resume_version(UUID, UUID, JSONB, INTEGER, INTEGER, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_cover_letter_version(UUID, UUID, TEXT, TEXT) TO authenticated;
