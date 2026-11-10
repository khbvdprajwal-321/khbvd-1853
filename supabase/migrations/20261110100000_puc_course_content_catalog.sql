ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS puc_group text;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_puc_group_check,
  ADD CONSTRAINT profiles_puc_group_check
    CHECK (puc_group IS NULL OR puc_group IN ('pcmb', 'pcm', 'commerce', 'arts'));

CREATE TABLE IF NOT EXISTS public.puc_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  puc_year integer NOT NULL CHECK (puc_year IN (1, 2)),
  puc_group text NOT NULL CHECK (puc_group IN ('pcmb', 'pcm', 'commerce', 'arts')),
  subject text NOT NULL,
  chapter_number integer NOT NULL CHECK (chapter_number > 0),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  key_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  academic_year text NOT NULL,
  curriculum_status text NOT NULL DEFAULT 'pending'
    CHECK (curriculum_status IN ('pending', 'included', 'excluded')),
  source_name text,
  source_url text,
  source_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academic_year, puc_year, puc_group, subject, chapter_number)
);

ALTER TABLE public.puc_lessons ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.puc_lessons TO authenticated;

DROP POLICY IF EXISTS puc_lessons_read_verified ON public.puc_lessons;
CREATE POLICY puc_lessons_read_verified ON public.puc_lessons
  FOR SELECT TO authenticated
  USING (
    curriculum_status = 'included'
    AND source_url IS NOT NULL
    AND source_verified_at IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND puc_year = public.puc_lessons.puc_year
          AND puc_group = public.puc_lessons.puc_group
      )
      OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS puc_lessons_admin_read ON public.puc_lessons;
CREATE POLICY puc_lessons_admin_read ON public.puc_lessons
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS puc_lessons_admin_insert ON public.puc_lessons;
CREATE POLICY puc_lessons_admin_insert ON public.puc_lessons
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS puc_lessons_admin_update ON public.puc_lessons;
CREATE POLICY puc_lessons_admin_update ON public.puc_lessons
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS puc_lessons_admin_delete ON public.puc_lessons;
CREATE POLICY puc_lessons_admin_delete ON public.puc_lessons
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_puc_lessons_student_catalog
  ON public.puc_lessons (puc_year, puc_group, subject, chapter_number)
  WHERE curriculum_status = 'included'
    AND source_url IS NOT NULL
    AND source_verified_at IS NOT NULL;

ALTER TABLE public.practice_questions
  ADD COLUMN IF NOT EXISTS puc_year integer,
  ADD COLUMN IF NOT EXISTS puc_group text,
  ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES public.puc_lessons(id) ON DELETE SET NULL;

ALTER TABLE public.practice_questions
  DROP CONSTRAINT IF EXISTS practice_questions_track_check,
  ADD CONSTRAINT practice_questions_track_check
    CHECK (track IN (
      'cet', 'neet', 'jee', 'degree', 'sslc', 'degree-it', 'degree-nonit',
      'business-hr', 'business-operations', 'business-management', 'puc'
    )),
  DROP CONSTRAINT IF EXISTS practice_questions_puc_year_check,
  ADD CONSTRAINT practice_questions_puc_year_check
    CHECK (puc_year IS NULL OR puc_year IN (1, 2)),
  DROP CONSTRAINT IF EXISTS practice_questions_puc_group_check,
  ADD CONSTRAINT practice_questions_puc_group_check
    CHECK (puc_group IS NULL OR puc_group IN ('pcmb', 'pcm', 'commerce', 'arts')),
  DROP CONSTRAINT IF EXISTS practice_questions_puc_metadata_check,
  ADD CONSTRAINT practice_questions_puc_metadata_check
    CHECK (
      track <> 'puc'
      OR (puc_year IS NOT NULL AND puc_group IS NOT NULL AND lesson_id IS NOT NULL)
    );

CREATE INDEX IF NOT EXISTS idx_practice_questions_puc_lesson
  ON public.practice_questions (puc_year, puc_group, subject, lesson_id)
  WHERE track = 'puc';

DROP POLICY IF EXISTS authenticated_read_practice_questions ON public.practice_questions;
CREATE POLICY authenticated_read_practice_questions ON public.practice_questions
  FOR SELECT TO authenticated
  USING (
    track <> 'puc'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND puc_year = public.practice_questions.puc_year
        AND puc_group = public.practice_questions.puc_group
    )
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

COMMENT ON COLUMN public.profiles.puc_group IS
  'Student PUC curriculum group, independent of optional CET/NEET/JEE exam preparation.';
COMMENT ON TABLE public.puc_lessons IS
  'Verified, year- and group-specific PUC syllabus catalog. Only published rows with verified source references are student-readable.';
