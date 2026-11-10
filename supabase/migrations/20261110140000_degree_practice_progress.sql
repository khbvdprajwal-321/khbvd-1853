ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS track text,
  ADD COLUMN IF NOT EXISTS assessment_mode text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS answered_count integer,
  ADD COLUMN IF NOT EXISTS incorrect_answers integer,
  ADD COLUMN IF NOT EXISTS unanswered_count integer;

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  track text NOT NULL,
  subject text NOT NULL,
  completed_sets integer NOT NULL DEFAULT 0 CHECK (completed_sets >= 0),
  seen_question_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_practiced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, track, subject)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_progress TO authenticated;

DROP POLICY IF EXISTS learning_progress_select_own ON public.learning_progress;
CREATE POLICY learning_progress_select_own ON public.learning_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS learning_progress_insert_own ON public.learning_progress;
CREATE POLICY learning_progress_insert_own ON public.learning_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS learning_progress_update_own ON public.learning_progress;
CREATE POLICY learning_progress_update_own ON public.learning_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS learning_progress_delete_own ON public.learning_progress;
CREATE POLICY learning_progress_delete_own ON public.learning_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
