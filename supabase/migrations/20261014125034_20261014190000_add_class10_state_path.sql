/*
# Add Class 10 state-syllabus learning path

1. New columns
- `profiles.school_class` stores the school class for school learners.
- `profiles.first_language`, `profiles.second_language`, and `profiles.third_language` store the selected language subjects.

2. Modified profile access
- Extend the existing `profiles.user_type` check to allow `school` in addition to `puc` and `degree`.

3. Security
- Existing owner-scoped profile policies remain in place; no public access is added.

4. Notes
- Existing profile data is preserved.
- New fields are nullable so current PUC and degree learners continue working unchanged.
*/

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_type_check CHECK (user_type IN ('puc', 'degree', 'school'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_class integer,
  ADD COLUMN IF NOT EXISTS first_language text,
  ADD COLUMN IF NOT EXISTS second_language text,
  ADD COLUMN IF NOT EXISTS third_language text;
