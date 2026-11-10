/*
# Add exam reviews

1. New Tables
- `exam_reviews`: one optional review per completed exam attempt.
- `id`: unique review identifier.
- `attempt_id`: the reviewed exam attempt.
- `user_id`: the authenticated owner of the review.
- `rating`: star rating from 1 to 5.
- `comment`: optional learner feedback.
- `created_at`: review creation time.

2. Security
- Row-level security is enabled on `exam_reviews`.
- Authenticated users can only read, create, update, or delete reviews they own.
- A unique constraint prevents multiple reviews for the same attempt.

3. Important Notes
- Existing exam attempts are unchanged.
- Reviews are optional and can be submitted after any exam or assignment.
*/

CREATE TABLE IF NOT EXISTS exam_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exam_reviews_attempt_id_key UNIQUE (attempt_id)
);

ALTER TABLE exam_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own exam reviews" ON exam_reviews;
CREATE POLICY "Users can view own exam reviews" ON exam_reviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own exam reviews" ON exam_reviews;
CREATE POLICY "Users can create own exam reviews" ON exam_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own exam reviews" ON exam_reviews;
CREATE POLICY "Users can update own exam reviews" ON exam_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own exam reviews" ON exam_reviews;
CREATE POLICY "Users can delete own exam reviews" ON exam_reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);