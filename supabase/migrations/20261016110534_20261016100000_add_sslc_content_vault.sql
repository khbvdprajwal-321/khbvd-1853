/*
# Add Karnataka SSLC content and paper vault

1. New Tables
- `sslc_chapters` stores the chapter sequence and structured study material for every Class 10 Karnataka State Board subject.
- `sslc_papers` stores original, supplementary, model, and topper-reference paper metadata and answer content.

2. Content Fields
- Chapter rows include subject, chapter number, title, language, summary, key points, formulas, and literature sections.
- Paper rows include subject, year, paper type, title, description, question payload, and optional answer-script reference.

3. Security
- Row-level security is enabled on both tables.
- Signed-in learners can read the shared educational catalogue.
- Browser clients cannot directly insert, update, or delete catalogue rows.

4. Notes
- Seed rows are intentionally concise catalogue records; the interface supplies the detailed interactive lesson, assignment, and answer presentation around each record.
- This migration is idempotent and does not alter or remove existing learner data.
*/

CREATE TABLE IF NOT EXISTS public.sslc_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  chapter_number integer NOT NULL,
  title text NOT NULL,
  language text NOT NULL DEFAULT 'English',
  summary text NOT NULL,
  key_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  formulas jsonb NOT NULL DEFAULT '[]'::jsonb,
  literature jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subject, chapter_number)
);

CREATE TABLE IF NOT EXISTS public.sslc_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  year integer NOT NULL,
  paper_type text NOT NULL CHECK (paper_type IN ('main', 'supplementary', 'model', 'topper')),
  title text NOT NULL,
  description text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  answer_script_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subject, year, paper_type)
);

ALTER TABLE public.sslc_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sslc_papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_sslc_chapters" ON public.sslc_chapters;
CREATE POLICY "authenticated_read_sslc_chapters" ON public.sslc_chapters FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_sslc_chapters" ON public.sslc_chapters;
CREATE POLICY "authenticated_insert_sslc_chapters" ON public.sslc_chapters FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "authenticated_update_sslc_chapters" ON public.sslc_chapters;
CREATE POLICY "authenticated_update_sslc_chapters" ON public.sslc_chapters FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "authenticated_delete_sslc_chapters" ON public.sslc_chapters;
CREATE POLICY "authenticated_delete_sslc_chapters" ON public.sslc_chapters FOR DELETE TO authenticated USING (false);

DROP POLICY IF EXISTS "authenticated_read_sslc_papers" ON public.sslc_papers;
CREATE POLICY "authenticated_read_sslc_papers" ON public.sslc_papers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_sslc_papers" ON public.sslc_papers;
CREATE POLICY "authenticated_insert_sslc_papers" ON public.sslc_papers FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "authenticated_update_sslc_papers" ON public.sslc_papers;
CREATE POLICY "authenticated_update_sslc_papers" ON public.sslc_papers FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "authenticated_delete_sslc_papers" ON public.sslc_papers;
CREATE POLICY "authenticated_delete_sslc_papers" ON public.sslc_papers FOR DELETE TO authenticated USING (false);

INSERT INTO public.sslc_chapters (subject, chapter_number, title, language, summary, key_points, formulas, literature)
VALUES
('Mathematics', 1, 'Real Numbers', 'English', 'Euclid division lemma, fundamental theorem of arithmetic, irrationality, and decimal expansions.', '["Euclid division algorithm", "HCF and LCM", "Prime factorisation", "Terminating decimals"]', '["a = bq + r, 0 ≤ r < b", "HCF(a,b) × LCM(a,b) = a × b"]', '{}'),
('Mathematics', 2, 'Polynomials', 'English', 'Zeros of polynomials and the relationship between zeros and coefficients.', '["Degree and zeros", "Remainder theorem", "Factor theorem", "Quadratic relationships"]', '["For ax²+bx+c, α+β = -b/a", "For ax²+bx+c, αβ = c/a"]', '{}'),
('Mathematics', 3, 'Pair of Linear Equations in Two Variables', 'English', 'Graphical and algebraic solutions of simultaneous linear equations.', '["Graphical solution", "Substitution", "Elimination", "Consistency"]', '["a₁/a₂ ≠ b₁/b₂: unique solution", "a₁/a₂ = b₁/b₂ = c₁/c₂: infinitely many solutions"]', '{}'),
('Mathematics', 4, 'Quadratic Equations', 'English', 'Standard form, factorisation, completing the square, formula, and nature of roots.', '["Standard form", "Discriminant", "Factorisation", "Word problems"]', '["x = (-b ± √(b²-4ac))/2a", "D = b² - 4ac"]', '{}'),
('Mathematics', 5, 'Arithmetic Progressions', 'English', 'Patterns, nth term, and sum of finite arithmetic progressions.', '["Common difference", "Nth term", "Sum of n terms", "Applications"]', '["aₙ = a + (n-1)d", "Sₙ = n/2[2a+(n-1)d]"]', '{}'),
('Science', 1, 'Chemical Reactions and Equations', 'English', 'Writing, balancing, classifying, and interpreting chemical reactions.', '["Balanced equations", "Combination and decomposition", "Displacement", "Oxidation and reduction"]', '["Mass is conserved in a balanced equation"]', '{}'),
('Science', 2, 'Acids, Bases and Salts', 'English', 'Properties, indicators, reactions, pH, and common salts.', '["Indicators", "Neutralisation", "pH scale", "Baking soda and bleaching powder"]', '["pH = -log[H⁺]", "Acid + base → salt + water"]', '{}'),
('Science', 3, 'Metals and Non-metals', 'English', 'Physical properties, reactivity series, ionic compounds, and extraction.', '["Reactivity series", "Ionic bonding", "Corrosion", "Alloys"]', '["Metal + oxygen → metal oxide"]', '{}'),
('Science', 4, 'Carbon Compounds', 'English', 'Covalent bonding, homologous series, functional groups, and reactions.', '["Tetravalency", "Catenation", "Functional groups", "Ethanol and ethanoic acid"]', '["Alkane: CₙH₂ₙ₊₂", "Esterification: acid + alcohol → ester + water"]', '{}'),
('Science', 5, 'Life Processes', 'English', 'Nutrition, respiration, transport, and excretion in living organisms.', '["Autotrophic nutrition", "Human digestion", "Double circulation", "Nephron"]', '["Photosynthesis: 6CO₂+6H₂O → C₆H₁₂O₆+6O₂"]', '{}'),
('Social Science', 1, 'India and the Contemporary World', 'English', 'Modern historical movements, colonialism, nationalism, and social change.', '["Nationalism", "Industrialisation", "Colonial expansion", "Print culture"]', '[]', '{}'),
('Social Science', 2, 'Resources and Development', 'English', 'Resource planning, land use, soil, conservation, and sustainable development.', '["Resource classification", "Land resources", "Soil types", "Conservation"]', '[]', '{}'),
('Social Science', 3, 'Power Sharing', 'English', 'Why power sharing is desirable and how it works in democracies.', '["Belgium and Sri Lanka", "Forms of power sharing", "Prudential reasons", "Moral reasons"]', '[]', '{}'),
('Social Science', 4, 'Federalism', 'English', 'Levels of government, constitutional arrangements, and decentralisation.', '["Union and state lists", "Linguistic states", "Panchayati Raj", "Coalition government"]', '[]', '{}'),
('English', 1, 'A Letter to God', 'English', 'A guided literature study of faith, hope, irony, character, and narrative structure.', '["Character sketch", "Theme and irony", "Evidence-based paragraph", "Vocabulary in context"]', '[]', '{"story_focus":"Write the sequence of events in your own words and support each inference with a detail from the lesson.","poem_focus":"Identify the speaker, central image, tone, and message before explaining any stanza."}'),
('Kannada', 1, 'Karnataka State Board Kannada Literature', 'Kannada', 'A literature study sequence for prose, poetry, grammar, and composition in Kannada.', '["ಸಾರಾಂಶ ಬರವಣಿಗೆ", "ಪಾತ್ರಚಿತ್ರಣ", "ಪದ್ಯದ ಭಾವಾರ್ಥ", "ವ್ಯಾಕರಣ"]', '[]', '{"story_focus":"ಪಾಠದ ಘಟನೆಗಳನ್ನು ಕ್ರಮವಾಗಿ ಬರೆಯಿರಿ ಮತ್ತು ಪಾತ್ರಗಳ ಗುಣಗಳನ್ನು ಪಠ್ಯದ ಉದಾಹರಣೆಗಳೊಂದಿಗೆ ವಿವರಿಸಿ.","poem_focus":"ಪ್ರತಿ ಪದ್ಯಭಾಗದ ಭಾವ, ಅಲಂಕಾರ ಮತ್ತು ಸಂದೇಶವನ್ನು ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ."}'),
('Hindi', 1, 'Karnataka State Board Hindi Literature', 'Hindi', 'A literature study sequence for prose, poetry, grammar, and composition in Hindi.', '["सार लेखन", "चरित्र-चित्रण", "पद्यांश भावार्थ", "व्याकरण"]', '[]', '{"story_focus":"घटनाओं को क्रम में लिखिए और पात्रों के गुणों को पाठ के उदाहरण से समझाइए।","poem_focus":"काव्यांश का भाव, चित्र और संदेश अपने शब्दों में स्पष्ट कीजिए।"}'),
('Sanskrit', 1, 'Karnataka State Board Sanskrit Literature', 'Sanskrit', 'A literature study sequence for reading, translation, grammar, and composition in Sanskrit.', '["पदच्छेद", "अन्वय", "अनुवाद", "व्याकरण"]', '[]', '{"story_focus":"पाठ का अन्वय और सरलार्थ क्रमपूर्वक लिखकर मुख्य संदेश स्पष्ट कीजिए।","poem_focus":"श्लोक का पदच्छेद, अन्वय, अर्थ और तात्पर्य लिखिए।"}')
ON CONFLICT (subject, chapter_number) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, key_points = EXCLUDED.key_points, formulas = EXCLUDED.formulas, literature = EXCLUDED.literature;

INSERT INTO public.sslc_papers (subject, year, paper_type, title, description, questions)
SELECT subject, year, paper_type, year || ' ' || initcap(paper_type) || ' Paper', 'Karnataka SSLC practice document for ' || subject || '.', '[{"marks":1,"type":"MCQ"},{"marks":2,"type":"Short answer"},{"marks":3,"type":"Analytical"},{"marks":5,"type":"Long answer"}]'::jsonb
FROM (VALUES
  ('English'), ('Kannada'), ('Hindi'), ('Sanskrit'), ('Mathematics'), ('Science'), ('Social Science')
) AS subjects(subject)
CROSS JOIN (VALUES (2023), (2024), (2025)) AS years(year)
CROSS JOIN (VALUES ('main'), ('supplementary'), ('model')) AS types(paper_type)
ON CONFLICT (subject, year, paper_type) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_sslc_chapters_subject ON public.sslc_chapters(subject, chapter_number);
CREATE INDEX IF NOT EXISTS idx_sslc_papers_subject_type ON public.sslc_papers(subject, paper_type, year DESC);