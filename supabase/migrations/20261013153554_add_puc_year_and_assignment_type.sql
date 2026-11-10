/*
# Add PUC Year column and Assignment exam type support

1. Modified Tables
- `profiles`: Add `puc_year` integer column (nullable) to store PUC student's current year (1 or 2).
  This lets PUC students set their current year in onboarding/settings, which determines which subjects open up.

2. Notes
- The `exam_attempts.exam_type` column already accepts text values, so the new 'assignment' exam type
  requires no schema change — it's just a new value written by the frontend.
- `puc_year` is nullable because degree students don't have a PUC year.
- No new RLS policies needed — existing profile policies already cover the new column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'puc_year'
  ) THEN
    ALTER TABLE profiles ADD COLUMN puc_year integer;
  END IF;
END $$;
