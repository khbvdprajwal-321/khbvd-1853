ALTER TABLE public.practice_questions
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'practice',
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_verified_at timestamptz;

ALTER TABLE public.practice_questions
  DROP CONSTRAINT IF EXISTS practice_questions_track_check;

ALTER TABLE public.practice_questions
  ADD CONSTRAINT practice_questions_track_check
  CHECK (track IN (
    'cet', 'neet', 'jee', 'degree', 'sslc', 'degree-it', 'degree-nonit',
    'business-hr', 'business-operations', 'business-management'
  ));

ALTER TABLE public.practice_questions
  DROP CONSTRAINT IF EXISTS practice_questions_source_type_check;

ALTER TABLE public.practice_questions
  ADD CONSTRAINT practice_questions_source_type_check
  CHECK (source_type IN ('practice', 'generated', 'previous_year'));

ALTER TABLE public.practice_questions
  DROP CONSTRAINT IF EXISTS practice_questions_verified_source_check;

ALTER TABLE public.practice_questions
  ADD CONSTRAINT practice_questions_verified_source_check
  CHECK (
    source_type <> 'previous_year'
    OR (source_url IS NOT NULL AND source_verified_at IS NOT NULL)
  );

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

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

DROP POLICY IF EXISTS admin_users_read_self ON public.admin_users;
CREATE POLICY admin_users_read_self ON public.admin_users
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_admin_read ON public.profiles;
CREATE POLICY profiles_admin_read ON public.profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS exam_attempts_admin_read ON public.exam_attempts;
CREATE POLICY exam_attempts_admin_read ON public.exam_attempts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

GRANT INSERT, UPDATE, DELETE ON public.practice_questions TO authenticated;
DROP POLICY IF EXISTS authenticated_insert_practice_questions ON public.practice_questions;
CREATE POLICY authenticated_insert_practice_questions ON public.practice_questions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS authenticated_update_practice_questions ON public.practice_questions;
CREATE POLICY authenticated_update_practice_questions ON public.practice_questions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS authenticated_delete_practice_questions ON public.practice_questions;
CREATE POLICY authenticated_delete_practice_questions ON public.practice_questions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.company_catalog (
  id text PRIMARY KEY,
  name text NOT NULL,
  introduction text NOT NULL,
  common_roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  technical_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  programming_languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  aptitude_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  interview_prep jsonb NOT NULL DEFAULT '[]'::jsonb,
  careers_url text NOT NULL,
  learning_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_catalog ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_catalog TO authenticated;

DROP POLICY IF EXISTS company_catalog_read_authenticated ON public.company_catalog;
CREATE POLICY company_catalog_read_authenticated ON public.company_catalog
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS company_catalog_admin_insert ON public.company_catalog;
CREATE POLICY company_catalog_admin_insert ON public.company_catalog
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS company_catalog_admin_update ON public.company_catalog;
CREATE POLICY company_catalog_admin_update ON public.company_catalog
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS company_catalog_admin_delete ON public.company_catalog;
CREATE POLICY company_catalog_admin_delete ON public.company_catalog
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.learning_catalog (
  track text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (track, subject, topic)
);

ALTER TABLE public.learning_catalog ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_catalog TO authenticated;

DROP POLICY IF EXISTS learning_catalog_read_authenticated ON public.learning_catalog;
CREATE POLICY learning_catalog_read_authenticated ON public.learning_catalog
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS learning_catalog_admin_insert ON public.learning_catalog;
CREATE POLICY learning_catalog_admin_insert ON public.learning_catalog
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS learning_catalog_admin_update ON public.learning_catalog;
CREATE POLICY learning_catalog_admin_update ON public.learning_catalog
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS learning_catalog_admin_delete ON public.learning_catalog;
CREATE POLICY learning_catalog_admin_delete ON public.learning_catalog
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

GRANT INSERT, UPDATE, DELETE ON public.sslc_chapters, public.sslc_papers TO authenticated;
DROP POLICY IF EXISTS sslc_chapters_admin_insert ON public.sslc_chapters;
CREATE POLICY sslc_chapters_admin_insert ON public.sslc_chapters
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS sslc_chapters_admin_update ON public.sslc_chapters;
CREATE POLICY sslc_chapters_admin_update ON public.sslc_chapters
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS sslc_chapters_admin_delete ON public.sslc_chapters;
CREATE POLICY sslc_chapters_admin_delete ON public.sslc_chapters
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS sslc_papers_admin_insert ON public.sslc_papers;
CREATE POLICY sslc_papers_admin_insert ON public.sslc_papers
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS sslc_papers_admin_update ON public.sslc_papers;
CREATE POLICY sslc_papers_admin_update ON public.sslc_papers
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS sslc_papers_admin_delete ON public.sslc_papers;
CREATE POLICY sslc_papers_admin_delete ON public.sslc_papers
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

INSERT INTO public.company_catalog (id, name, introduction, common_roles, technical_skills, programming_languages, aptitude_topics, interview_prep, careers_url, learning_links)
VALUES
  ('tcs', 'TCS', 'Global technology services and consulting company.', '["Software Engineer", "Systems Engineer", "Analyst"]', '["Problem solving", "Data structures", "Databases", "Software fundamentals"]', '["C", "C++", "Java", "Python"]', '["Quantitative aptitude", "Logical reasoning", "Verbal ability"]', '["Practice coding fundamentals", "Review project decisions", "Prepare clear examples of teamwork"]', 'https://www.tcs.com/careers', '[{"label":"TCS iON","url":"https://www.tcsion.com/"}]'),
  ('infosys', 'Infosys', 'Global digital services and consulting company.', '["Software Engineer", "Systems Engineer", "Consultant"]', '["Programming fundamentals", "Data structures", "Databases", "Cloud concepts"]', '["Java", "Python", "JavaScript", "C++"]', '["Numerical ability", "Reasoning", "Communication"]', '["Practice problem solving", "Explain projects and trade-offs", "Review core CS concepts"]', 'https://www.infosys.com/careers.html', '[{"label":"Infosys Springboard","url":"https://infyspringboard.onwingspan.com/"}]'),
  ('wipro', 'Wipro', 'Technology services and consulting company.', '["Project Engineer", "Software Developer", "Consultant"]', '["Programming", "Testing", "Databases", "Networking basics"]', '["Java", "Python", "C", "JavaScript"]', '["Quantitative aptitude", "Reasoning", "Verbal ability"]', '["Review fundamentals", "Prepare project walkthroughs", "Practice concise communication"]', 'https://careers.wipro.com/', '[]'),
  ('accenture', 'Accenture', 'Technology and professional services company.', '["Software Engineer", "Application Developer", "Analyst"]', '["Software engineering", "Cloud", "Data", "Cybersecurity fundamentals"]', '["Java", "Python", "JavaScript", "SQL"]', '["Numerical reasoning", "Logical reasoning", "Communication"]', '["Practice coding and case questions", "Prepare project examples", "Review role-specific fundamentals"]', 'https://www.accenture.com/careers', '[]'),
  ('cognizant', 'Cognizant', 'Technology and consulting services company.', '["Programmer Analyst", "Software Engineer", "Quality Engineer"]', '["Programming", "Testing", "SQL", "Web fundamentals"]', '["Java", "Python", "JavaScript", "SQL"]', '["Quantitative aptitude", "Analytical reasoning", "Verbal ability"]', '["Review coding basics", "Practice debugging explanations", "Prepare project examples"]', 'https://careers.cognizant.com/', '[]'),
  ('capgemini', 'Capgemini', 'Technology and consulting services company.', '["Software Engineer", "Application Consultant", "Data Analyst"]', '["Software development", "Cloud", "Data", "Testing"]', '["Java", "Python", "C++", "JavaScript"]', '["Numerical reasoning", "Logic", "Communication"]', '["Practice technical fundamentals", "Explain project contributions", "Prepare behavioral examples"]', 'https://www.capgemini.com/careers/', '[]'),
  ('hcltech', 'HCLTech', 'Global technology services and engineering company.', '["Graduate Engineer Trainee", "Software Developer", "Support Engineer"]', '["Programming", "Networking", "Databases", "Cloud fundamentals"]', '["C", "C++", "Java", "Python"]', '["Quantitative aptitude", "Reasoning", "Verbal ability"]', '["Review core CS topics", "Practice coding", "Prepare project and teamwork examples"]', 'https://www.hcltech.com/careers', '[]'),
  ('tech-mahindra', 'Tech Mahindra', 'Technology consulting and digital transformation company.', '["Software Engineer", "Associate Engineer", "Network Engineer"]', '["Software development", "Networking", "Testing", "Databases"]', '["Java", "Python", "C++", "JavaScript"]', '["Quantitative aptitude", "Logical reasoning", "Communication"]', '["Review role fundamentals", "Practice problem solving", "Prepare project summaries"]', 'https://www.techmahindra.com/careers/', '[]'),
  ('ibm', 'IBM', 'Technology and consulting company focused on hybrid cloud and AI.', '["Software Developer", "Associate Consultant", "Data Engineer"]', '["Programming", "Cloud", "Data", "Operating systems"]', '["Java", "Python", "C++", "JavaScript"]', '["Analytical reasoning", "Problem solving", "Communication"]', '["Practice coding", "Review systems fundamentals", "Prepare project and behavioral examples"]', 'https://www.ibm.com/careers', '[{"label":"IBM SkillsBuild","url":"https://skillsbuild.org/"}]'),
  ('microsoft', 'Microsoft', 'Global software, cloud and technology company.', '["Software Engineer", "Cloud Engineer", "Data Scientist"]', '["Algorithms", "System design fundamentals", "Cloud", "Accessibility"]', '["C#", "C++", "Java", "Python", "JavaScript"]', '["Analytical reasoning", "Problem solving", "Communication"]', '["Practice algorithms", "Explain design trade-offs", "Prepare collaboration examples"]', 'https://careers.microsoft.com/', '[{"label":"Microsoft Learn","url":"https://learn.microsoft.com/"}]')
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_practice_questions_track_subject
  ON public.practice_questions (track, subject);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_track_mode
  ON public.exam_attempts (user_id, track, assessment_mode);