/*
# Add department and experience_level columns to profiles

1. Modified Tables
- `profiles`: add `department` column (text, nullable) for B.E. department selection (CSE, Data Science, etc.)
- `profiles`: add `experience_level` column (text, nullable) for fresher/experienced selection
2. Security
- No RLS changes — existing policies already cover the profiles table.
3. Notes
- Both columns are nullable so existing profile rows are not affected.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS experience_level text;