ALTER TABLE public.sslc_chapters
  ADD COLUMN IF NOT EXISTS language_category text,
  ADD COLUMN IF NOT EXISTS section text,
  ADD COLUMN IF NOT EXISTS curriculum_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.practice_questions
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS language_category text;

ALTER TABLE public.practice_questions
  DROP CONSTRAINT IF EXISTS practice_questions_language_category_check,
  ADD CONSTRAINT practice_questions_language_category_check
    CHECK (language_category IS NULL OR language_category IN ('first_language', 'second_language', 'third_language'));

ALTER TABLE public.sslc_chapters
  DROP CONSTRAINT IF EXISTS sslc_chapters_language_category_check,
  ADD CONSTRAINT sslc_chapters_language_category_check
    CHECK (language_category IS NULL OR language_category IN ('first_language', 'second_language', 'third_language')),
  DROP CONSTRAINT IF EXISTS sslc_chapters_curriculum_status_check,
  ADD CONSTRAINT sslc_chapters_curriculum_status_check
    CHECK (curriculum_status IN ('pending', 'included', 'excluded', 'removed'));

ALTER TABLE public.sslc_chapters
  DROP CONSTRAINT IF EXISTS sslc_chapters_subject_chapter_number_key;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sslc_chapters TO authenticated;
GRANT SELECT ON public.sslc_papers TO authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sslc_chapters_subject_year_number
  ON public.sslc_chapters (subject, academic_year, chapter_number)
  WHERE academic_year IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sslc_chapters_verified_year
  ON public.sslc_chapters (academic_year, subject, language_category, chapter_number)
  WHERE curriculum_status = 'included'
    AND source_url IS NOT NULL
    AND source_verified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_practice_questions_sslc_lesson_language
  ON public.practice_questions (track, subject, topic, language, language_category);

DROP POLICY IF EXISTS admin_insert_sslc_chapters ON public.sslc_chapters;
CREATE POLICY admin_insert_sslc_chapters ON public.sslc_chapters
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS admin_update_sslc_chapters ON public.sslc_chapters;
CREATE POLICY admin_update_sslc_chapters ON public.sslc_chapters
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS admin_delete_sslc_chapters ON public.sslc_chapters;
CREATE POLICY admin_delete_sslc_chapters ON public.sslc_chapters
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

GRANT INSERT, UPDATE, DELETE ON public.sslc_papers TO authenticated;

DROP POLICY IF EXISTS admin_insert_sslc_papers ON public.sslc_papers;
CREATE POLICY admin_insert_sslc_papers ON public.sslc_papers
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS admin_update_sslc_papers ON public.sslc_papers;
CREATE POLICY admin_update_sslc_papers ON public.sslc_papers
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS admin_delete_sslc_papers ON public.sslc_papers;
CREATE POLICY admin_delete_sslc_papers ON public.sslc_papers
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.sslc_lesson_progress (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.sslc_chapters(id) ON DELETE RESTRICT,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id)
);

ALTER TABLE public.sslc_lesson_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sslc_lesson_progress TO authenticated;

DROP POLICY IF EXISTS sslc_lesson_progress_select_own ON public.sslc_lesson_progress;
CREATE POLICY sslc_lesson_progress_select_own ON public.sslc_lesson_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS sslc_lesson_progress_insert_own ON public.sslc_lesson_progress;
CREATE POLICY sslc_lesson_progress_insert_own ON public.sslc_lesson_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS sslc_lesson_progress_update_own ON public.sslc_lesson_progress;
CREATE POLICY sslc_lesson_progress_update_own ON public.sslc_lesson_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS sslc_lesson_progress_delete_own ON public.sslc_lesson_progress;
CREATE POLICY sslc_lesson_progress_delete_own ON public.sslc_lesson_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sslc_lesson_progress_user_completed
  ON public.sslc_lesson_progress (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_track_mode_started
  ON public.exam_attempts (user_id, track, assessment_mode, started_at DESC);

COMMENT ON COLUMN public.sslc_chapters.language_category IS
  'Karnataka SSLC language slot; populated only from the verified student subject combination.';
COMMENT ON COLUMN public.sslc_chapters.section IS
  'Verified textbook division such as prose, poetry, supplementary reading, or a subject division.';
COMMENT ON COLUMN public.sslc_chapters.curriculum_status IS
  'pending until verified against the applicable academic-year Karnataka syllabus.';
COMMENT ON COLUMN public.practice_questions.language IS
  'Language of the question, options, answer, and explanation; required for localized SSLC practice.';
