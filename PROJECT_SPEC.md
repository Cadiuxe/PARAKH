# PARAKH Adaptive MCQ Testing Platform (MULYAN)

> This file is the single source of truth for the project.
> Read this file before making architectural or implementation decisions.
>
> **Canonical Source of Truth Rule**:
> The Source of Truth is documentation, not permission to redesign the project. Existing implementation takes precedence when the documentation is stale. When documentation and code disagree, stop and report the discrepancy before making architectural changes.

## Project Status

**Current Checkpoint**: Phase 5.8 — Adaptive Question Selection Refinement (Completed)

### Completed Milestones
- **Phase 1 (Foundation)**: Next.js 16 App Router, Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion, Recharts, Geist typography.
- **Phase 2 & 4 (UI Prototype & Analytics Dashboard)**: Assessment screen, results analytics, student dashboard, admin question/review queue layout, help, settings.
- **Phase 5.1 & 5.2 (Supabase SSR Auth & Foundation Schema)**: PostgreSQL schema migration (`profiles`, `topics`, `questions`, `sessions`, `responses`, `ability_estimates`), RLS policies, browser client, server admin client, auth context provider, route proxy.
- **Phase 5.3 (Assessment Persistence & Server Authority)**:
  - **Server Authority**: Authenticated student identity validated from SSR cookies. Assessment session ownership enforced.
  - **Server-Authoritative Evaluation**: Question answers, correctness, base score (100 pts), speed bonus (up to +25 pts), ability recalibration, and completion status evaluated 100% server-side via Next.js Server Actions.
  - **Security Sanitization**: Client receives `QuestionSafeRow` stripped of `correct_option_index` and `explanation`. Feedback is revealed only after server verification.
  - **Idempotency & Reconnect**: Safe duplicate submission guards; full support for session restoration on page refresh / reconnect (`getActiveAssessmentSession`).
  - **Schema Update**: `20240102000000_assessment_in_progress_status.sql` enabled `'in_progress'` status on `sessions`.
- **Phase 5.4 (Database-backed Student Dashboard)**:
  - `src/lib/actions/dashboard.ts` — `getStudentDashboardData()` server action aggregating sessions, responses, and ability_estimates over ALL completed sessions (no cap).
  - `src/lib/dashboard-context.tsx` — `DashboardProvider` and `useDashboard()` context hook.
  - `src/app/dashboard/page.tsx` — converted to async Server Component; data fetched SSR and passed as `initialData`.
  - All 6 dashboard components converted from `getStoredAssessments()` to `useDashboard()`:
    - `welcome-section.tsx`, `proficiency-card.tsx`, `ability-chart.tsx`, `insights-section.tsx`, `topic-cards.tsx`, `recent-assessments.tsx`
  - Lifetime aggregate stats are never capped; Recent Assessments card displays 4 most recent.
  - New-student empty states preserved.
- **Phase 5.5 (Database-backed Student Results)**:
  - `src/lib/actions/results.ts` — `getSessionResult(sessionId?)` server action. Authenticates student from SSR cookies, verifies session ownership (`student_id` match), checks `status === 'completed'`, fetches responses, fetches full question details including `correct_option_index` and `explanation` (server-only), assembles `SessionResultData`.
  - `src/components/results/results-view.tsx` — Client Component receiving pre-fetched `SessionResult`. Zero localStorage reads. Session switching calls `getSessionResult()` via `useTransition`. Handles: valid session, no sessions, invalid ID, ownership violation, in-progress session.
  - `src/app/results/page.tsx` — converted to async Server Component. Reads `?id` from `searchParams`, calls `getSessionResult()` SSR.
  - All result values (score, accuracy, speed bonus, ability, questions, explanations, correct answers, session history, topic breakdown, chart data) come exclusively from the database.
- **Phase 5.6 (Continuous Difficulty Model)**:
  - `supabase/migrations/20240104000000_add_difficulty_score.sql` — added nullable `difficulty_score numeric(5,2)` to `questions` and `responses` with `CHECK (difficulty_score BETWEEN 0 AND 100)`. Backfilled existing 60 questions with prototype level centroids (Level 1: 15.00, Level 2: 30.00, Level 3: 50.00, Level 4: 70.00, Level 5: 88.00).
  - `src/lib/db/types.ts` — added `difficulty_score` to `QuestionRow`, `QuestionSafeRow`, `ResponseRow`, and `ResponseInsert`.
  - `src/lib/mock-data.ts` — added `difficultyScore: number` to `AssessmentQuestion` and mapped `QUESTION_BANK` with continuous centroid difficulty values for all 60 prototype items.
  - `src/lib/db/questions.ts` — updated `fetchApprovedQuestions`, `fetchQuestionById`, `mockToQuestionRow`, and `toSafeQuestion` to map and preserve `difficulty_score`.
  - `src/lib/db/responses.ts` — updated `insertResponse` to persist `difficulty_score`.
  - `src/lib/adaptive-engine.ts` — updated `selectNextQuestion` to target student continuous ability (0–100) directly using distance minimization.
  - `src/lib/actions/assessment.ts` — passed `difficultyScore` into response persistence, session completion summaries, and reconnect data.
- **Phase 5.7 (Continuous Ability Estimation)**:
  - Implemented continuous mathematical ability updating in `src/lib/adaptive-engine.ts`:
    $$E = \frac{1}{1 + 10^{-(\theta - d) / 40}}$$
    $$\Delta\theta = 15 \cdot (y - E)$$
    $$\theta_{\text{next}} = \text{clamp}(\theta + \Delta\theta, 5, 100)$$
  - Integrated `question.difficultyScore` into `submitQuestionAnswer` server action in `src/lib/actions/assessment.ts`.
  - Maintained complete backward compatibility for legacy integer difficulty inputs.
- **Phase 5.8 (Adaptive Question Selection Refinement)**:
  - Refined `selectNextQuestion` in `src/lib/adaptive-engine.ts` with continuous distance tiering and session-level topic balancing for Mixed assessments.
  - Implemented deterministic multi-topic rotation: tracks topic frequency in the active session and prioritizes least-represented topics among candidates at optimal difficulty.
  - Added robust handling for sparse candidate pools and difficulty region exhaustion.

### Files Changed in Phase 5.8
- `src/lib/adaptive-engine.ts` (refined `selectNextQuestion` with proximity candidate tiering and Mixed session topic balancing)
- `PROJECT_SPEC.md` (documented selection algorithm, topic balancing, tests, and limitations)

### Tests Performed (Phase 5.8)
- `npm run build`: Production build and TypeScript validation passed with 0 errors.
- Deterministic Validation Suite:
  1. Centroid targeting across 15, 30, 50, 70, 88.
  2. Strict used-question exclusion (`usedIds` no-repeat guard).
  3. Single-topic filtering strictly enforced (e.g. topic = 'OS').
  4. Mixed assessment multi-topic rotation: verified all 4 distinct topics (DSA, DBMS, OS, CN) are covered across the first 4 questions of a Mixed session.
  5. Exhaustion fallback: verified graceful transition to adjacent difficulty bands when primary level is exhausted.
  6. Sparse candidate pool robustness: tested pools with missing intermediate difficulty levels.
  7. End-to-end multi-step assessment lifecycle test via Server Actions: verified continuous ability transitions, topic rotation, response persistence, and idempotent duplicate submission protection.

### Known Limitations
- Response time weighting in ability updates is deferred to Phase 5.9.
- Question calibration from aggregate student responses is deferred to Phase 5.9+.

### Next Planned Phase
- **Phase 5.9**: Response Time & Speed-Weighted Psychometric Updates.

---

## Core Rule

Do not introduce new technologies, databases, frameworks,
or architectural patterns without explicit approval.

The project is intentionally designed to be simple,
vibe-codeable, and suitable for an internal SIH prototype.

Yes. **This is the final version I would build.** It takes Claude's stronger product architecture and combines it with the simpler, vibe-codeable implementation we discussed.

# PARAKH — Final Build Specification

## 1. Project objective

Build a **premium AI-powered Computer Adaptive Testing (CAT) platform** for the SIH problem statement.

The platform should:

1. Conduct a short **pre-assessment**.
2. Estimate the student's initial ability.
3. Dynamically select subsequent MCQs based on:

   * Correct/incorrect answers
   * Difficulty
   * Topic-wise performance
   * Response time
   * Previous question exposure
4. Generate new MCQs using **Gemini AI** when the question bank lacks a suitable question.
5. Provide detailed student and admin analytics.
6. Maintain an **AI question review queue** so AI-generated questions aren't automatically trusted.

### Critical constraint

This is an **internal college hackathon prototype**.

Do **not** build a production-scale psychometric system.

Prioritize:

> **Premium UI + working adaptive behavior + visible AI + convincing demonstration.**

---

# 2. Final technology stack

## Frontend

* **Next.js — App Router**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui**
* **Lucide React**
* **Framer Motion**
* **Recharts**

## Backend

Use:

* **Next.js API routes / Server Actions**

Do **not** introduce Express or Spring Boot.

## Database / Auth

Use:

* **Supabase**
* PostgreSQL
* Supabase Auth

Do **not** use MongoDB, Firebase, Prisma, or another database.

## AI

* **Gemini API**

Use it for:

* MCQ generation
* Explanations
* Performance analysis

## Deployment

* **Vercel**
* Supabase cloud

---

# 3. Architecture

```text
                         STUDENT
                            │
                            ▼
                  ┌──────────────────┐
                  │     Next.js      │
                  │                  │
                  │ Tailwind         │
                  │ shadcn/ui        │
                  │ Framer Motion    │
                  │ Recharts         │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Adaptive Engine │
                  │                  │
                  │ Ability          │
                  │ Difficulty       │
                  │ Topic weakness   │
                  │ Response time    │
                  │ Exposure         │
                  └────────┬─────────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
          ┌─────────────┐      ┌─────────────┐
          │  Supabase   │      │ Gemini API  │
          │             │      │             │
          │ Users       │      │ MCQ Gen     │
          │ Questions   │      │ Explanation │
          │ Sessions    │      │ Analysis    │
          │ Responses   │      └─────────────┘
          │ Performance │
          └─────────────┘
                 │
                 ▼
          Admin Review Queue
```

---

# 4. Database

Use Supabase PostgreSQL.

## `users`

```text
id
name
email
role              // student / admin
created_at
```

## `topics`

```text
id
name
parent_topic_id
```

## `questions`

```text
id
topic_id
subtopic
question
options
correct_option
explanation
difficulty        // 1–5
source            // question_bank / ai_generated
times_used
correct_count
incorrect_count
avg_time_sec
review_status     // approved / pending / rejected
created_at
```

## `sessions`

```text
id
user_id
type              // pre_assessment / adaptive
subject
started_at
ended_at
status
score
final_ability
```

## `responses`

```text
id
session_id
question_id
selected_option
is_correct
time_taken_sec
ability_before
ability_after
created_at
```

## `ability_estimates`

```text
id
user_id
topic_id
ability
updated_at
```

This is enough for both the MVP and future psychometric upgrades.

---

# 5. Adaptive algorithm

## Do NOT implement IRT initially.

Use a simple, explainable adaptive model.

Start:

```text
ability = 50
```

### Correct answer

```text
Easy   → +8
Medium → +10
Hard   → +12
```

### Incorrect answer

```text
Easy   → -5
Medium → -8
Hard   → -10
```

Keep ability within:

```text
0–100
```

### Difficulty selection

```text
Ability < 40
→ Easy

40–70
→ Medium

> 70
→ Hard
```

---

## Topic adaptation

Track topic accuracy.

Example:

```text
DSA          86%
DBMS         48%
Operating Systems  72%
Networks     55%
```

The engine should give a **higher probability** to weaker topics.

It should not completely ignore strong topics.

---

## Response time

Use response time as a **small modifier**, not a major factor.

For example:

```text
Correct + very fast
→ small ability boost

Correct + very slow
→ smaller boost

Incorrect + very fast
→ possible misconception

Incorrect + very slow
→ stronger evidence of difficulty
```

Do not build complicated statistical modelling.

---

## Question exposure

Every question stores:

```text
times_used
```

When choosing between equally suitable questions:

> Prefer the question with lower exposure.

This directly addresses the SIH requirement about questions being asked repeatedly.

---

# 6. Question selection

The adaptive engine should essentially do:

```text
Current ability
      +
Weak topic
      +
Target difficulty
      +
Response history
      +
Question exposure
      ↓
Select best question
```

If an appropriate approved question exists:

```text
Use question bank
```

If not:

```text
Gemini generates question
        ↓
Validation
        ↓
Pending review
```

For the live student assessment, only use approved questions unless you explicitly choose a safe demo mode.

---

# 7. AI question generation

Gemini receives structured information:

```text
Topic: DBMS
Subtopic: Normalization
Difficulty: Medium
Question type: Conceptual
```

Return structured JSON:

```json
{
  "question": "...",
  "options": [
    "...",
    "...",
    "...",
    "..."
  ],
  "correct_option": 1,
  "explanation": "...",
  "topic": "DBMS",
  "subtopic": "Normalization",
  "difficulty": 3
}
```

### Pipeline

```text
Adaptive Engine
      ↓
Needs suitable question
      ↓
Gemini
      ↓
Generate
      ↓
Validate structure
      ↓
Duplicate check
      ↓
Save as pending
      ↓
Admin review
      ↓
Approved
      ↓
Question pool
```

---

# 8. AI performance analysis

At the end of an assessment, send Gemini:

```text
Overall score
Overall ability
Topic scores
Questions answered
Response times
Difficulty progression
Strengths
Weak areas
```

Gemini generates:

### Strengths

> Strong understanding of data structures and algorithmic concepts.

### Areas to improve

> Database normalization and operating-system scheduling require further practice.

### Recommendation

> Focus on 2NF/3NF and transaction-management concepts before attempting advanced DBMS questions.

This is a very visible AI feature for the demo.

---

# 9. Student pages

Build these first.

## 1. Landing page

Premium SaaS/AI aesthetic.

Headline:

> **Assess Smarter. Learn Deeper.**

Subheading:

> AI-powered adaptive assessments that dynamically adjust to your knowledge level.

CTA:

> **Start Assessment**

---

## 2. Authentication

Supabase Auth.

Keep it simple.

---

## 3. Student Dashboard

Display:

```text
Overall Proficiency
78%

DSA              88%
DBMS             62%
Operating Systems 78%
Networks         51%
```

Also:

* recent assessments
* strengths
* weak areas
* current ability
* start assessment

---

## 4. Assessment Setup

Allow:

* Subject
* Topic
* Number of questions

Then:

> Start Pre-Assessment

---

## 5. Pre-Assessment

5–10 mixed questions.

Purpose:

> Establish initial ability.

---

## 6. Adaptive Assessment

This is the **hero feature**.

Display:

* Question
* Four options
* Progress
* Timer
* Submit
* Next
* subtle transitions

Do **not** expose:

> "Difficulty = Hard"

to the student.

The adaptive nature should happen behind the scenes.

---

# 10. Adaptive journey

After/during assessment, show:

```text
Q1   Easy       ✓
 │
Q2   Medium     ✓
 │
Q3   Medium     ✓
 │
Q4   Hard       ✓
 │
Q5   Hard       ✗
 │
Q6   Medium     ✓
 │
Q7   Hard       ✓
```

And an ability graph:

```text
Ability
100 ┤
 80 ┤              ●──●
 70 ┤         ●──●
 60 ┤    ●──●
 50 ┤ ●
    └──────────────────
      Q1 Q2 Q3 Q4 Q5 Q6 Q7
```

This is one of the most important screens for the SIH presentation.

---

# 11. Results dashboard

Show:

### Overall proficiency

```text
78%
Intermediate / Advanced
```

### Topic proficiency

Use charts.

### Ability trajectory

Use Recharts.

### Adaptive journey

Show question difficulty progression.

### AI analysis

Display Gemini's:

* strengths
* weaknesses
* recommendations

---

# 12. Admin dashboard

This will significantly improve the project's perceived completeness.

Show:

### Overview

```text
Students             248
Assessments          621
Average Ability      67%
AI Questions         134
```

### Question bank

Filters:

```text
Topic
Difficulty
Source
Review status
```

### Item statistics

```text
Question
Difficulty
Times Used
Accuracy
Avg Time
Source
Status
```

### AI review queue

Example:

```text
┌─────────────────────────────────────┐
│ AI GENERATED • PENDING REVIEW       │
│                                     │
│ Which normal form removes...?       │
│                                     │
│ Topic: DBMS                         │
│ Difficulty: Medium                  │
│                                     │
│ [Edit] [Reject] [Approve]           │
└─────────────────────────────────────┘
```

---

# 13. UI design

This is a **major priority**.

The project should look like a polished commercial AI/SaaS product, not a college CRUD application.

### Design inspiration

* Linear
* Notion
* modern AI SaaS products
* premium analytics dashboards

### Design characteristics

Use:

* excellent typography
* whitespace
* subtle borders
* sophisticated cards
* restrained gradients
* modern charts
* subtle shadows
* consistent spacing
* smooth transitions
* responsive layouts

### Avoid

* excessive gradients
* rainbow colors
* excessive glassmorphism
* giant decorative elements
* random animations
* Bootstrap-style generic layouts

---

# 14. UI libraries

### shadcn/ui

Primary component library.

### Lucide

Icons.

### Framer Motion

Animations:

* page transitions
* question transitions
* card entrance
* score animations
* progress animations
* hover interactions

### Recharts

Charts:

* ability progression
* topic proficiency
* accuracy
* response time
* difficulty progression

### Font

Use:

**Geist** or **Inter**.

---

# 15. Development environment

## Computer

```text
Node.js LTS       ✅
npm               ✅
Git               ✅
Antigravity       ✅
Chrome             ✅
```

Docker:

```text
❌ Not required
```

Python:

```text
❌ Not required
```

Java:

```text
❌ Not required
```

MongoDB:

```text
❌ Not required
```

---

# 16. Antigravity MCPs

Install only:

### Essential

```text
GitHub MCP
Supabase MCP
Chrome DevTools MCP
```

### Optional

```text
Context7 MCP
```

Do not add a large number of MCPs unless there's a specific reason.

---

# 17. Build order

Follow this order strictly.

### Phase 1 — Foundation

```text
Next.js
Supabase
shadcn
Tailwind
Framer Motion
Recharts
Authentication
Database schema
```

### Phase 2 — Basic assessment

```text
Question bank
↓
Assessment
↓
Answer
↓
Score
↓
Results
```

Get this working before adaptive logic.

### Phase 3 — Adaptive engine

Implement:

```text
Ability
Difficulty
Topic performance
Response time
Exposure
```

### Phase 4 — Student dashboard

Add:

* charts
* proficiency
* history
* strengths
* weaknesses

### Phase 5 — Admin dashboard

Add:

* question management
* statistics
* AI review queue

### Phase 6 — Gemini

Add:

* question generation
* explanations
* performance analysis

### Phase 7 — Premium polish

Add:

* animations
* loading states
* skeletons
* empty states
* responsive design
* error handling
* micro-interactions

### Phase 8 — Optional stretch

Only if everything else works:

> **IRT / 2PL adaptive engine**

---

# 18. Seed data

Do NOT wait for real data.

Currently seeded:

```text
60 curated MCQs (15 each across DSA, DBMS, OS, CN; 3 per difficulty level 1–5)
```

across:

```text
Data Structures & Algorithms (DSA)
Database Management Systems (DBMS)
Operating Systems (OS)
Computer Networks (CN)
```

with:

```text
5 difficulty levels (3 questions per level per topic)
```

You can use seeded/synthetic historical usage data for the admin analytics.

Be transparent that these are **prototype/calibration values**, not real national assessment statistics.

---

# 19. What NOT to build

Do not waste time on:

❌ FastAPI
❌ Spring Boot
❌ MongoDB
❌ Prisma
❌ Microservices
❌ Docker
❌ Kubernetes
❌ Training your own ML model
❌ Full production-grade IRT
❌ Massive question database
❌ Complicated recommendation system
❌ Multiple frontend frameworks

The goal is:

> **One polished Next.js application.**

---

# 20. Future scalability

Don't implement this now, but architect the adaptive engine as an isolated module:

```text
selectNextQuestion(
    studentState,
    questionPool
)
```

Currently:

```text
Rule-based adaptive engine
```

Future:

```text
2PL IRT
```

This lets you explain to judges:

> "The current prototype uses an explainable adaptive heuristic. The selection engine is isolated so it can later be replaced by a calibrated IRT-based CAT engine when sufficient response data becomes available."

That's a much more credible answer than pretending the prototype has a statistically validated national-scale CAT model.

---

# 21. Final project positioning

Do **not** pitch this as:

> "An AI quiz website."

Pitch it as:

> **"An AI-powered Computer Adaptive Testing platform that continuously estimates student proficiency and dynamically personalizes assessment difficulty and topic selection, while using generative AI to expand and maintain the question pool."**

### Your three core innovations

**1. Adaptive assessment**

Questions change based on student performance.

**2. AI-powered question generation**

The system can generate suitable questions when the existing bank lacks coverage.

**3. Explainable assessment analytics**

Students and administrators can see proficiency, topic gaps, difficulty progression, and assessment behavior.

---

## Final priority hierarchy

If time becomes limited:

```text
                    PRIORITY

                 Premium UI
                     │
                     ▼
             Working assessment
                     │
                     ▼
            Adaptive difficulty
                     │
                     ▼
              Topic adaptation
                     │
                     ▼
             Gemini integration
                     │
                     ▼
             Results analytics
                     │
                     ▼
             Admin dashboard
                     │
                     ▼
               AI review queue
                     │
                     ▼
                  IRT
```

**Do not move to the next level until the previous one works.**
