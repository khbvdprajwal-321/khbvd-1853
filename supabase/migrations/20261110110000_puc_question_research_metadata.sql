ALTER TABLE public.practice_questions
  ADD COLUMN IF NOT EXISTS chapter text,
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'single_choice',
  ADD COLUMN IF NOT EXISTS research_reference text;

ALTER TABLE public.practice_questions
  DROP CONSTRAINT IF EXISTS practice_questions_question_type_check,
  ADD CONSTRAINT practice_questions_question_type_check
    CHECK (question_type IN ('single_choice', 'numerical_choice'));

CREATE INDEX IF NOT EXISTS idx_practice_questions_track_subject_chapter
  ON public.practice_questions (track, subject, chapter, difficulty);

COMMENT ON COLUMN public.practice_questions.chapter IS
  'Curriculum chapter for the question; null for legacy questions without verified chapter metadata.';
COMMENT ON COLUMN public.practice_questions.question_type IS
  'Question interaction format supported by the current four-option practice interface.';
COMMENT ON COLUMN public.practice_questions.research_reference IS
  'Verified non-PDF source and topic reference used to author the original question.';
