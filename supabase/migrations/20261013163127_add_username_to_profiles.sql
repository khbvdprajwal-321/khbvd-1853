/*
# Add username column to profiles

1. Modified Tables
- `profiles`: add `username` column (text, nullable) for username-based auth.
2. Security
- No RLS changes — existing policies already cover the profiles table.
3. Notes
- The column is nullable so existing profile rows are not affected.
- A unique constraint is added so no two users can share the same username.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Unique constraint so usernames are unique (only enforced for non-null values)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;