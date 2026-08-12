-- ─────────────────────────────────────────────────────────────────────────────
-- PARAKH — Foundation Schema Migration
-- Phase 5.1A
--
-- Creates:
--   profiles, topics, questions, sessions, responses, ability_estimates
--
-- Enables RLS on all tables.
-- Seeds topics and the existing question bank from mock-data.ts.
--
-- Apply via: Supabase Dashboard → SQL Editor, or Supabase CLI migrations.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────

-- gen_random_uuid() is available in PostgreSQL 13+ without extension.
-- pgcrypto is a safe fallback for older Supabase projects.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

-- Helper function to fetch user role safely without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

COMMENT ON FUNCTION public.get_user_role(uuid) IS
  'SECURITY DEFINER lookup for user role from profiles. '
  'Prevents RLS recursion when policies evaluate admin privileges.';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: profiles
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        NOT NULL,
  full_name     text        NOT NULL,
  roll_number   text        NULL,
  institution   text        NULL,
  role          text        NOT NULL DEFAULT 'student',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT profiles_pkey
    PRIMARY KEY (id),

  -- Links to Supabase Auth. Deleting the auth user cascades to profile.
  CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id)
    ON DELETE CASCADE,

  CONSTRAINT profiles_role_check
    CHECK (role IN ('student', 'admin'))
);

COMMENT ON TABLE public.profiles IS
  'Application-level student/admin profile. Linked 1:1 to auth.users. '
  'Role cannot be changed by the student — only via admin or migration.';

COMMENT ON COLUMN public.profiles.id IS
  'Same UUID as auth.users.id. Do not generate separately.';

COMMENT ON COLUMN public.profiles.role IS
  'student or admin. Students cannot change this field — enforced by RLS.';


-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: auto-create profile on auth.users insert
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
-- Use SECURITY DEFINER so the function runs with owner privileges
-- and can write to profiles regardless of the calling user's permissions.
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    -- Use raw_user_meta_data.full_name if provided at signup,
    -- otherwise fall back to the email prefix.
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if it already exists (idempotent re-runs)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates a profiles row when a new auth.users record is inserted. '
  'Role is always set to student — never admin. '
  'Admin role must be assigned manually or via a separate migration.';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: topics
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.topics (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  code          text        NOT NULL,
  name          text        NOT NULL,
  parent_id     uuid        NULL,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT topics_pkey
    PRIMARY KEY (id),

  CONSTRAINT topics_code_unique
    UNIQUE (code),

  CONSTRAINT topics_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES public.topics(id)
    ON DELETE SET NULL
);

COMMENT ON TABLE public.topics IS
  'Master topic taxonomy. Top-level topics: DSA, DBMS, OS, CN. '
  'parent_id enables future subtopic nesting.';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: questions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.questions (
  id                   uuid        NOT NULL DEFAULT gen_random_uuid(),
  topic_id             uuid        NOT NULL,
  subtopic             text        NOT NULL,
  difficulty_level     smallint    NOT NULL,
  difficulty_label     text        NOT NULL,
  question_text        text        NOT NULL,
  options              jsonb       NOT NULL,
  correct_option_index smallint    NOT NULL,
  explanation          text        NULL,
  source               text        NOT NULL DEFAULT 'question_bank',
  review_status        text        NOT NULL DEFAULT 'approved',
  is_active            boolean     NOT NULL DEFAULT true,
  times_used           integer     NOT NULL DEFAULT 0,
  correct_count        integer     NOT NULL DEFAULT 0,
  incorrect_count      integer     NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT questions_pkey
    PRIMARY KEY (id),

  CONSTRAINT questions_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES public.topics(id),

  CONSTRAINT questions_difficulty_check
    CHECK (difficulty_level BETWEEN 1 AND 5),

  CONSTRAINT questions_source_check
    CHECK (source IN ('question_bank', 'ai_generated')),

  CONSTRAINT questions_review_status_check
    CHECK (review_status IN ('approved', 'pending', 'rejected')),

  CONSTRAINT questions_correct_option_check
    CHECK (correct_option_index BETWEEN 0 AND 3)
);

COMMENT ON TABLE public.questions IS
  'Question bank. Do NOT hard-delete rows — use is_active=false instead. '
  'correct_option_index must never be exposed to students. '
  'Question selection must happen server-side.';

COMMENT ON COLUMN public.questions.correct_option_index IS
  'SENSITIVE: Never expose this column to student RLS policies or client code.';

COMMENT ON COLUMN public.questions.options IS
  'JSONB array of exactly 4 option strings. '
  'Example: ["Option A", "Option B", "Option C", "Option D"]';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: sessions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sessions (
  id               uuid           NOT NULL DEFAULT gen_random_uuid(),
  student_id       uuid           NOT NULL,
  topic_filter     text           NOT NULL,
  requested_count  smallint       NOT NULL,
  actual_count     smallint       NOT NULL,
  correct_count    smallint       NOT NULL,
  percentage_score numeric(5,2)   NOT NULL,
  total_score      integer        NOT NULL,
  total_bonus      integer        NOT NULL,
  ability_start    numeric(6,2)   NOT NULL,
  ability_final    numeric(6,2)   NOT NULL,
  ability_delta    numeric(6,2)   NOT NULL,
  status           text           NOT NULL DEFAULT 'completed',
  started_at       timestamptz    NOT NULL,
  completed_at     timestamptz    NULL,

  CONSTRAINT sessions_pkey
    PRIMARY KEY (id),

  CONSTRAINT sessions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  CONSTRAINT sessions_status_check
    CHECK (status IN ('completed', 'abandoned')),

  CONSTRAINT sessions_topic_filter_check
    CHECK (topic_filter IN ('Mixed', 'DSA', 'DBMS', 'OS', 'CN'))
);

COMMENT ON TABLE public.sessions IS
  'One row per completed or abandoned assessment session. '
  'Scores and ability values should be computed server-side before insertion.';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: responses
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.responses (
  id                    uuid         NOT NULL DEFAULT gen_random_uuid(),
  session_id            uuid         NOT NULL,
  question_id           uuid         NOT NULL,
  question_order        smallint     NOT NULL,
  topic_code            text         NOT NULL,
  difficulty_level      smallint     NOT NULL,
  selected_option_index smallint     NOT NULL,
  is_correct            boolean      NOT NULL,
  time_remaining_sec    smallint     NOT NULL,
  time_taken_sec        smallint     NOT NULL,
  ability_before        numeric(6,2) NOT NULL,
  ability_after         numeric(6,2) NOT NULL,
  base_score            smallint     NOT NULL,
  speed_bonus           smallint     NOT NULL,
  total_score           smallint     NOT NULL,
  answered_at           timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT responses_pkey
    PRIMARY KEY (id),

  CONSTRAINT responses_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES public.sessions(id)
    ON DELETE CASCADE,

  CONSTRAINT responses_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES public.questions(id),

  -- One row per question position per session
  CONSTRAINT responses_session_order_unique
    UNIQUE (session_id, question_order),

  CONSTRAINT responses_selected_option_check
    CHECK (selected_option_index BETWEEN -1 AND 3),

  CONSTRAINT responses_difficulty_check
    CHECK (difficulty_level BETWEEN 1 AND 5)
);

COMMENT ON TABLE public.responses IS
  'One row per question attempt within a session. '
  'topic_code and difficulty_level are denormalized at time of attempt '
  'to preserve historical accuracy if questions are later re-tagged. '
  'question_text is NOT duplicated here — JOIN on question_id.';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: ability_estimates
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ability_estimates (
  id              uuid          NOT NULL DEFAULT gen_random_uuid(),
  student_id      uuid          NOT NULL,
  topic_id        uuid          NOT NULL,
  ability         numeric(6,2)  NOT NULL,
  total_questions integer       NOT NULL DEFAULT 0,
  correct_count   integer       NOT NULL DEFAULT 0,
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT ability_estimates_pkey
    PRIMARY KEY (id),

  CONSTRAINT ability_estimates_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  CONSTRAINT ability_estimates_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES public.topics(id),

  CONSTRAINT ability_estimates_student_topic_unique
    UNIQUE (student_id, topic_id)
);

COMMENT ON TABLE public.ability_estimates IS
  'Per-student, per-topic rolling ability estimates.';


-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- sessions: student dashboard queries (all sessions for a student)
CREATE INDEX IF NOT EXISTS idx_sessions_student_id
  ON public.sessions (student_id);

-- sessions: recent assessments ordered by time
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at
  ON public.sessions (completed_at DESC NULLS LAST);

-- responses: results page (all responses for a session)
CREATE INDEX IF NOT EXISTS idx_responses_session_id
  ON public.responses (session_id);

-- responses: admin question item statistics
CREATE INDEX IF NOT EXISTS idx_responses_question_id
  ON public.responses (question_id);

-- questions: adaptive engine question selection (composite)
-- Filters by topic, difficulty, approval status, and active flag
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty
  ON public.questions (topic_id, difficulty_level, review_status, is_active);

-- questions: admin review queue
CREATE INDEX IF NOT EXISTS idx_questions_review_status
  ON public.questions (review_status, source);

-- ability_estimates: student lookup
CREATE INDEX IF NOT EXISTS idx_ability_estimates_student
  ON public.ability_estimates (student_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ability_estimates ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────────────────────────

-- Students can read only their own profile.
CREATE POLICY "profiles: student reads own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Students can update only their own row, and only safe fields.
-- The WITH CHECK clause uses get_user_role() to prevent self-referential RLS recursion.
CREATE POLICY "profiles: student updates own safe fields"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = public.get_user_role(auth.uid())
  );

-- Admins can read all profiles.
CREATE POLICY "profiles: admin reads all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ── topics ────────────────────────────────────────────────────────────────────

-- All authenticated users can read topics.
CREATE POLICY "topics: authenticated reads all"
  ON public.topics
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify topics.
CREATE POLICY "topics: admin writes"
  ON public.topics
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- ── questions ─────────────────────────────────────────────────────────────────

-- Admins can manage all questions (select, insert, update, delete).
CREATE POLICY "questions: admin manages all"
  ON public.questions
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- ── sessions ──────────────────────────────────────────────────────────────────

-- Students can read only their own sessions.
CREATE POLICY "sessions: student reads own"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Admins can read all sessions.
CREATE POLICY "sessions: admin reads all"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ── responses ─────────────────────────────────────────────────────────────────

-- Students can read responses belonging to their own sessions.
CREATE POLICY "responses: student reads own session responses"
  ON public.responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = responses.session_id
        AND s.student_id = auth.uid()
    )
  );

-- Admins can read all responses.
CREATE POLICY "responses: admin reads all"
  ON public.responses
  FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ── ability_estimates ─────────────────────────────────────────────────────────

-- Students can read only their own ability estimates.
CREATE POLICY "ability_estimates: student reads own"
  ON public.ability_estimates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Admins can read all ability estimates.
CREATE POLICY "ability_estimates: admin reads all"
  ON public.ability_estimates
  FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin');


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED DATA: topics
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.topics (code, name, display_order) VALUES
  ('DSA',  'Data Structures & Algorithms',   1),
  ('DBMS', 'Database Management Systems',     2),
  ('OS',   'Operating Systems',              3),
  ('CN',   'Computer Networks',              4)
ON CONFLICT (code) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- SEED DATA: questions
-- Sourced from: src/lib/mock-data.ts — QUESTION_BANK
-- 21 questions across DSA (6), DBMS (5), OS (5), CN (5)  [6+5+5+5 = 21]
-- ─────────────────────────────────────────────────────────────────────────────

WITH topic_ids AS (
  SELECT id, code FROM public.topics WHERE code IN ('DSA', 'DBMS', 'OS', 'CN')
)
INSERT INTO public.questions
  (topic_id, subtopic, difficulty_level, difficulty_label, question_text, options, correct_option_index, explanation, source, review_status)
SELECT
  t.id,
  q.subtopic,
  q.difficulty_level,
  q.difficulty_label,
  q.question_text,
  q.options::jsonb,
  q.correct_option_index,
  q.explanation,
  'question_bank',
  'approved'
FROM topic_ids t
JOIN (VALUES

  -- ── DSA ─────────────────────────────────────────────────────────────────

  ('DSA', 'Arrays', 1, 'Easy',
   'What is the time complexity of accessing an element in an array by index?',
   '["O(n)", "O(log n)", "O(1)", "O(n²)"]',
   2,
   'Array elements are stored in contiguous memory. Accessing by index computes the address directly, giving O(1) constant time.'),

  ('DSA', 'Linked Lists', 2, 'Easy',
   'In a singly linked list, which operation is O(1) when performed at the head?',
   '["Deletion at tail", "Insertion at head", "Searching for a value", "Reversing the list"]',
   1,
   'Insertion at the head only requires updating the head pointer, which takes O(1). All other options require traversal.'),

  ('DSA', 'Binary Trees', 3, 'Medium',
   'Which traversal of a Binary Search Tree produces keys in sorted ascending order?',
   '["Pre-order", "In-order", "Post-order", "Level-order"]',
   1,
   'In-order traversal (Left → Root → Right) visits BST nodes in non-decreasing order because every left subtree contains smaller keys.'),

  ('DSA', 'Sorting', 3, 'Medium',
   'Which sorting algorithm has the best average-case time complexity?',
   '["Bubble Sort — O(n²)", "Merge Sort — O(n log n)", "Insertion Sort — O(n²)", "Selection Sort — O(n²)"]',
   1,
   'Merge Sort divides the array recursively and merges in O(n) per level, giving O(n log n) average and worst-case complexity.'),

  ('DSA', 'Graph Algorithms', 4, 'Hard',
   'What is the worst-case time complexity of Dijkstra''s algorithm using a Min-Heap?',
   '["O(V²)", "O((V + E) log V)", "O(V × E)", "O(E log E)"]',
   1,
   'With a binary min-heap, each vertex is extracted once (O(V log V)) and each edge is relaxed once (O(E log V)), giving O((V + E) log V) total.'),

  ('DSA', 'Dynamic Programming', 5, 'Very Hard',
   'In the 0/1 Knapsack problem with n items and capacity W, the standard DP solution has time complexity:',
   '["O(n log n)", "O(n + W)", "O(n × W)", "O(2ⁿ)"]',
   2,
   'The DP table has n rows and W+1 columns. Filling each cell takes O(1), so the total is O(n × W) — pseudo-polynomial time.'),

  -- ── DBMS ────────────────────────────────────────────────────────────────

  ('DBMS', 'Basics', 1, 'Easy',
   'Which SQL command is used to retrieve data from a database table?',
   '["INSERT", "UPDATE", "SELECT", "DELETE"]',
   2,
   'SELECT is the SQL Data Query Language (DQL) command used to fetch data from one or more tables based on specified conditions.'),

  ('DBMS', 'Keys', 2, 'Easy',
   'A Primary Key in a relational database must be:',
   '["Nullable and unique", "Unique and not null", "Duplicate across rows", "A foreign key from another table"]',
   1,
   'A Primary Key uniquely identifies each row. It must be unique (no two rows share the same value) and NOT NULL (every row must have a value).'),

  ('DBMS', 'Normalization', 3, 'Medium',
   'Which normal form removes transitive functional dependencies of non-prime attributes?',
   '["1NF", "2NF", "3NF", "BCNF"]',
   2,
   'Third Normal Form (3NF) requires the relation to be in 2NF with no non-prime attribute transitively dependent on any candidate key.'),

  ('DBMS', 'Concurrency Control', 4, 'Hard',
   'Which locking protocol prevents cascading rollbacks by releasing exclusive locks only at commit/abort?',
   '["2-Phase Locking (2PL)", "Strict 2PL", "Basic Timestamp Ordering", "Optimistic Concurrency Control"]',
   1,
   'Strict 2PL holds all exclusive locks until the transaction commits or aborts, ensuring dirty data is never read by other transactions.'),

  ('DBMS', 'Normalization', 5, 'Very Hard',
   'Which condition must hold for a relation to be in Boyce-Codd Normal Form (BCNF)?',
   '["Every non-prime attribute is fully dependent on the primary key", "For every non-trivial FD X → Y, X must be a superkey", "There are no multi-valued dependencies", "All foreign keys reference valid primary keys"]',
   1,
   'BCNF requires that for every non-trivial functional dependency X → Y, X must be a superkey. This is stricter than 3NF.'),

  -- ── OS ──────────────────────────────────────────────────────────────────

  ('OS', 'Basics', 1, 'Easy',
   'Which of the following is NOT a function of an Operating System?',
   '["Memory management", "Process scheduling", "Compiling source code", "File system management"]',
   2,
   'Compiling source code is the job of a compiler, not the OS. The OS manages hardware resources, processes, memory, and files.'),

  ('OS', 'Scheduling', 2, 'Easy',
   'In Round-Robin CPU scheduling, what determines the context switch frequency?',
   '["Process priority", "Memory size", "Time quantum", "Number of CPU cores"]',
   2,
   'Round-Robin assigns each process a fixed time quantum. When it expires, the CPU switches to the next process regardless of completion.'),

  ('OS', 'Process Synchronization', 3, 'Medium',
   'Which condition is NOT required for a deadlock to occur?',
   '["Mutual Exclusion", "Hold and Wait", "Preemption Enabled", "Circular Wait"]',
   2,
   'Deadlock requires No Preemption (resources cannot be forcibly taken). If preemption is enabled, resources can be reclaimed, preventing deadlock.'),

  ('OS', 'Virtual Memory', 4, 'Hard',
   'Which page replacement algorithm suffers from Belady''s Anomaly?',
   '["LRU", "FIFO", "Optimal (OPT)", "Second Chance (Clock)"]',
   1,
   'FIFO can produce more page faults when the number of frames increases — this counterintuitive behavior is called Belady''s Anomaly.'),

  ('OS', 'Memory Management', 5, 'Very Hard',
   'In a segmented-paging memory model, a logical address is typically resolved through:',
   '["Direct mapping via a single-level page table", "Segment table → page table → physical frame", "Inverted page table only", "Base register addition only"]',
   1,
   'In segmented-paging, the segment table locates the page table for the segment, which then maps the page number to a physical frame plus offset.'),

  -- ── CN ──────────────────────────────────────────────────────────────────

  ('CN', 'Basics', 1, 'Easy',
   'Which layer of the OSI model is responsible for end-to-end communication between applications?',
   '["Network Layer", "Data Link Layer", "Transport Layer", "Physical Layer"]',
   2,
   'The Transport Layer (Layer 4) provides end-to-end communication, segmentation, error recovery, and flow control via TCP or UDP.'),

  ('CN', 'IP Addressing', 2, 'Easy',
   'How many bits are in an IPv4 address?',
   '["16 bits", "32 bits", "64 bits", "128 bits"]',
   1,
   'IPv4 addresses are 32 bits long, written as four 8-bit octets in dotted-decimal notation (e.g., 192.168.1.1).'),

  ('CN', 'Transport Protocols', 3, 'Medium',
   'What triggers TCP''s Fast Retransmit algorithm?',
   '["Three duplicate ACKs received", "Retransmission timeout (RTO) expiry", "Window size dropping to 1 MSS", "TCP SYN re-synchronization"]',
   0,
   'Fast Retransmit is triggered when the sender receives 3 duplicate ACKs, indicating packet loss without waiting for the RTO timer to expire.'),

  ('CN', 'Routing', 4, 'Hard',
   'Which routing protocol uses the Bellman-Ford algorithm and is limited to 15 hops?',
   '["OSPF", "BGP", "RIP", "EIGRP"]',
   2,
   'RIP (Routing Information Protocol) uses distance-vector routing based on Bellman-Ford with a maximum hop count of 15 to prevent routing loops.'),

  ('CN', 'Congestion Control', 5, 'Very Hard',
   'In TCP CUBIC congestion control, after a packet loss event, the congestion window (cwnd) is set to:',
   '["Half of the current cwnd (multiplicative decrease)", "1 MSS (restart from slow start)", "A fixed value unrelated to current cwnd", "ssthresh remains unchanged"]',
   0,
   'TCP CUBIC uses multiplicative decrease: after loss, cwnd is multiplied by a factor β (typically 0.7), then CUBIC growth resumes from that point.')
) AS q(topic_code, subtopic, difficulty_level, difficulty_label, question_text, options, correct_option_index, explanation)
ON t.code = q.topic_code
ON CONFLICT DO NOTHING;
