ALTER TABLE public.sslc_chapters
  ADD COLUMN IF NOT EXISTS academic_year text,
  ADD COLUMN IF NOT EXISTS lesson_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_verified_at timestamptz;

ALTER TABLE public.sslc_papers
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_verified_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_sslc_chapters_subject_year
  ON public.sslc_chapters (subject, academic_year, chapter_number);

COMMENT ON COLUMN public.sslc_chapters.academic_year IS
  'Karnataka syllabus year in YYYY-YY format, for example 2026-27.';
COMMENT ON COLUMN public.sslc_chapters.lesson_content IS
  'Verified language-specific lesson, vocabulary, important Q&A, and exam preparation material.';
COMMENT ON COLUMN public.sslc_chapters.source_verified_at IS
  'Timestamp when the syllabus source was checked against the board reference.';
