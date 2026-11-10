/*
# KHBV.D Learn and Gain Knowledge - Core Database Schema

## Purpose
Support PUC students with CET/NEET/JEE preparation and Degree students with
career/company skill gap analysis. Includes exam system, homework tracking,
resume analysis, and subscription tiers.

## New Tables

1. `profiles` — User registration data (extends auth.users)
   - id (uuid, PK, FK to auth.users)
   - full_name (text)
   - gender (text: male/female/other)
   - age (integer)
   - district (text)
   - state (text)
   - pincode (text)
   - user_type (text: puc / degree)
   - exam_stream (text: cet / neet / jee — PUC only)
   - degree_type (text — Degree only)
   - current_semester (integer)
   - is_premium (boolean, default false)
   - subscription_tier (text: free / premium / institutional)
   - created_at, updated_at (timestamps)

2. `exam_attempts` — Tracks every exam taken
   - id (uuid PK)
   - user_id (uuid FK to auth.users)
   - exam_type (text: subject / stream_practice / gap_assessment / homework)
   - subject (text)
   - total_questions (integer, default 25)
   - correct_answers (integer)
   - score_percentage (numeric)
   - difficulty_breakdown (jsonb)
   - question_data (jsonb — generated questions for this attempt)
   - answers (jsonb — user answers)
   - started_at, completed_at (timestamps)

3. `homework_tracking` — Daily homework cycle (1,2,3,2 pattern)
   - id (uuid PK)
   - user_id (uuid FK)
   - subject (text)
   - cycle_day (integer: 1-4)
   - questions_target (integer)
   - questions_completed (integer)
   - status (text: pending / in_progress / completed)
   - assigned_date (date)
   - completed_at (timestamp)

4. `resume_analyses` — GBSI engine results
   - id (uuid PK)
   - user_id (uuid FK)
   - degree_type (text)
   - target_role (text)
   - resume_text (text)
   - identified_skills (jsonb)
   - missing_skills (jsonb)
   - skill_gap_score (numeric)
   - generated_questions (jsonb)
   - created_at (timestamp)

5. `career_mappings` — Degree-to-company-role mapping reference data
   - id (uuid PK)
   - degree_type (text)
   - target_role (text)
   - company_examples (jsonb)
   - required_skills (jsonb)
   - average_salary_range (text)

## Security
- RLS enabled on all tables
- Owner-scoped CRUD policies using auth.uid()
- career_mappings is readable by all authenticated users (reference data)
- Default user_id = auth.uid() on all owner tables
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  age integer,
  district text,
  state text,
  pincode text,
  user_type text CHECK (user_type IN ('puc', 'degree')),
  exam_stream text CHECK (exam_stream IN ('cet', 'neet', 'jee')),
  degree_type text,
  current_semester integer DEFAULT 1,
  is_premium boolean NOT NULL DEFAULT false,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'institutional')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Exam attempts table
CREATE TABLE IF NOT EXISTS exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type text NOT NULL CHECK (exam_type IN ('subject', 'stream_practice', 'gap_assessment', 'homework')),
  subject text NOT NULL,
  total_questions integer NOT NULL DEFAULT 25,
  correct_answers integer,
  score_percentage numeric,
  difficulty_breakdown jsonb,
  question_data jsonb,
  answers jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_attempts" ON exam_attempts;
CREATE POLICY "select_own_attempts" ON exam_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attempts" ON exam_attempts;
CREATE POLICY "insert_own_attempts" ON exam_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attempts" ON exam_attempts;
CREATE POLICY "update_own_attempts" ON exam_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attempts" ON exam_attempts;
CREATE POLICY "delete_own_attempts" ON exam_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Homework tracking table
CREATE TABLE IF NOT EXISTS homework_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  cycle_day integer NOT NULL CHECK (cycle_day BETWEEN 1 AND 4),
  questions_target integer NOT NULL,
  questions_completed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_at timestamptz
);

ALTER TABLE homework_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_homework" ON homework_tracking;
CREATE POLICY "select_own_homework" ON homework_tracking FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_homework" ON homework_tracking;
CREATE POLICY "insert_own_homework" ON homework_tracking FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_homework" ON homework_tracking;
CREATE POLICY "update_own_homework" ON homework_tracking FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_homework" ON homework_tracking;
CREATE POLICY "delete_own_homework" ON homework_tracking FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Resume analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  degree_type text,
  target_role text,
  resume_text text,
  identified_skills jsonb DEFAULT '[]'::jsonb,
  missing_skills jsonb DEFAULT '[]'::jsonb,
  skill_gap_score numeric,
  generated_questions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resumes" ON resume_analyses;
CREATE POLICY "select_own_resumes" ON resume_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resumes" ON resume_analyses;
CREATE POLICY "insert_own_resumes" ON resume_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_resumes" ON resume_analyses;
CREATE POLICY "update_own_resumes" ON resume_analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resumes" ON resume_analyses;
CREATE POLICY "delete_own_resumes" ON resume_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Career mappings table (reference data, readable by all authenticated)
CREATE TABLE IF NOT EXISTS career_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  degree_type text NOT NULL,
  target_role text NOT NULL,
  company_examples jsonb DEFAULT '[]'::jsonb,
  required_skills jsonb DEFAULT '[]'::jsonb,
  average_salary_range text
);

ALTER TABLE career_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_career_mappings" ON career_mappings;
CREATE POLICY "select_career_mappings" ON career_mappings FOR SELECT
  TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_homework_user_id ON homework_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_career_degree ON career_mappings(degree_type);
