CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_started
  ON public.exam_attempts (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_homework_user_assigned
  ON public.homework_tracking (user_id, assigned_date DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_created_id
  ON public.profiles (created_at DESC, id);

CREATE INDEX IF NOT EXISTS idx_practice_questions_track_subject_difficulty
  ON public.practice_questions (track, subject, difficulty);

CREATE OR REPLACE FUNCTION public.admin_student_page(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  user_type text,
  attempt_count bigint,
  average_score numeric,
  total_profiles bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_users AS admin
    WHERE admin.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH profile_page AS (
    SELECT
      profile.id,
      profile.full_name,
      profile.user_type,
      profile.created_at,
      count(*) OVER () AS total_profiles
    FROM public.profiles AS profile
    ORDER BY profile.created_at DESC NULLS LAST, profile.id
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  )
  SELECT
    profile_page.id,
    profile_page.full_name,
    profile_page.user_type,
    count(attempt.id) AS attempt_count,
    avg(attempt.score_percentage) AS average_score,
    profile_page.total_profiles
  FROM profile_page
  LEFT JOIN public.exam_attempts AS attempt
    ON attempt.user_id = profile_page.id
  GROUP BY
    profile_page.id,
    profile_page.full_name,
    profile_page.user_type,
    profile_page.created_at,
    profile_page.total_profiles
  ORDER BY profile_page.created_at DESC NULLS LAST, profile_page.id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_student_page(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_student_page(integer, integer) TO authenticated;
