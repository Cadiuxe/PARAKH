-- ─────────────────────────────────────────────────────────────────────────────
-- PARAKH — Phase 5.6: Add Continuous Difficulty Score
--
-- Adds nullable difficulty_score column (0–100) to questions and responses,
-- preserving existing difficulty_level (1–5) and difficulty_label unchanged.
--
-- Initial prototype heuristic mapping:
--   Level 1 (Easy)      → 15.00
--   Level 2 (Easy+)     → 30.00
--   Level 3 (Medium)    → 50.00
--   Level 4 (Hard)      → 70.00
--   Level 5 (Very Hard) → 88.00
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Update questions table ───────────────────────────────────────────────

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS difficulty_score numeric(5,2) NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'questions'
      AND constraint_name = 'questions_difficulty_score_check'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_difficulty_score_check
        CHECK (difficulty_score BETWEEN 0 AND 100);
  END IF;
END $$;

COMMENT ON COLUMN public.questions.difficulty_score IS
  'Continuous item difficulty score (0–100 scale) for adaptive targeting. '
  'Seeded from heuristic level mapping; will be calibrated in future phases.';

-- Backfill all existing questions based on difficulty_level
UPDATE public.questions
SET difficulty_score = CASE difficulty_level
    WHEN 1 THEN 15.00
    WHEN 2 THEN 30.00
    WHEN 3 THEN 50.00
    WHEN 4 THEN 70.00
    WHEN 5 THEN 88.00
    ELSE 50.00
  END
WHERE difficulty_score IS NULL;

-- ─── 2. Update responses table ───────────────────────────────────────────────

ALTER TABLE public.responses
  ADD COLUMN IF NOT EXISTS difficulty_score numeric(5,2) NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'responses'
      AND constraint_name = 'responses_difficulty_score_check'
  ) THEN
    ALTER TABLE public.responses
      ADD CONSTRAINT responses_difficulty_score_check
        CHECK (difficulty_score BETWEEN 0 AND 100);
  END IF;
END $$;

COMMENT ON COLUMN public.responses.difficulty_score IS
  'Continuous difficulty score of the question at the time of attempt (denormalized).';
