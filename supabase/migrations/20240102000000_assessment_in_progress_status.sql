-- ─────────────────────────────────────────────────────────────────────────────
-- PARAKH — Assessment In-Progress Status Migration
-- Phase 5.3: Assessment Persistence & Server Authority
--
-- Updates:
--   - public.sessions status constraint to include 'in_progress'
--   - default session status to 'in_progress'
--   - default column values for in-progress session creation
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop existing status check constraint
ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_status_check;

-- 2. Add updated status check constraint allowing 'in_progress'
ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('in_progress', 'completed', 'abandoned'));

-- 3. Set sensible column defaults for when an in-progress session is created
ALTER TABLE public.sessions
  ALTER COLUMN status SET DEFAULT 'in_progress',
  ALTER COLUMN actual_count SET DEFAULT 0,
  ALTER COLUMN correct_count SET DEFAULT 0,
  ALTER COLUMN percentage_score SET DEFAULT 0.0,
  ALTER COLUMN total_score SET DEFAULT 0,
  ALTER COLUMN total_bonus SET DEFAULT 0,
  ALTER COLUMN ability_final SET DEFAULT 50.0,
  ALTER COLUMN ability_delta SET DEFAULT 0.0;

COMMENT ON CONSTRAINT sessions_status_check ON public.sessions IS
  'Sessions start as in_progress, transition to completed on finish, or abandoned if cancelled.';
