# PARAKH — AI Coding Rules

## 1. Source of Truth

Before making significant changes, read:

`PROJECT_SPEC.md`

PROJECT_SPEC.md defines the intended architecture,
technology stack, database structure, UI direction,
adaptive assessment behavior, and project scope.

Do not contradict the specification without explaining
why the change is necessary.

---

## 2. Technology Constraints

Use only the approved stack unless explicitly instructed otherwise.

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Framer Motion
- Recharts

### Backend
- Next.js API routes
- Next.js Server Actions where appropriate

### Database / Authentication
- Supabase
- PostgreSQL
- Supabase Auth

### AI
- Gemini API

### Deployment
- Vercel

Do NOT introduce:
- MongoDB
- Firebase
- Prisma
- Express
- FastAPI
- Spring Boot
- Docker
- microservices
- another frontend framework

unless explicitly approved.

---

## 3. Architecture

Keep the application modular and simple.

Separate:

1. UI
2. Application logic
3. Adaptive engine
4. AI services
5. Supabase/data access

Do not place complex business logic directly inside React components.

---

## 4. Adaptive Engine

Adaptive question selection must be isolated from the UI.

The primary interface should conceptually be:

`selectNextQuestion(studentState, questionPool)`

The current implementation should use a simple,
explainable heuristic adaptive algorithm.

Do not implement IRT, 2PL, Bayesian estimation,
or machine learning unless explicitly requested.

The architecture should allow the adaptive algorithm
to be replaced later without changing the assessment UI.

---

## 5. AI Services

Keep Gemini/API calls isolated from UI components.

Use a dedicated AI service layer.

Examples:

- generateQuestion()
- analyzePerformance()
- explainAnswer()

Do not scatter direct Gemini API calls throughout the application.

Never expose API keys in client-side code.

---

## 6. Database Rules

Treat the database schema as stable.

Do not casually add, remove, rename, or modify database
columns or tables.

If a schema change is necessary:

1. Explain why.
2. Create a proper database migration.
3. Test the migration.
4. Update PROJECT_SPEC.md if the architecture changes.

Never silently change the schema.

---

## 7. Security

Never hardcode:

- API keys
- secrets
- passwords
- Supabase service-role keys

Use environment variables.

Never expose server-only credentials to the browser.

Respect Supabase Row Level Security.

Students must not be able to access other students'
private assessment data.

Admin functionality must require appropriate authorization.

---

## 8. UI / UX

The product should feel like a premium modern SaaS/AI product.

Prioritize:

- typography
- spacing
- visual hierarchy
- consistency
- responsive design
- accessibility
- subtle animations
- polished loading states
- error states
- empty states

Use shadcn/ui as the primary component system.

Use Lucide icons.

Use Framer Motion for restrained animations.

Use Recharts for analytics.

Avoid:

- excessive gradients
- excessive glassmorphism
- rainbow colors
- unnecessary animations
- generic Bootstrap-like layouts
- clutter

---

## 9. Code Quality

Prefer:

- small reusable components
- clear naming
- TypeScript types
- simple functions
- modular architecture
- existing components over duplicated components

Do not create abstractions unless they provide
a clear benefit.

Do not overengineer.

---

## 10. Existing Code

Before modifying a file:

1. Inspect the existing implementation.
2. Understand how it connects to the rest of the application.
3. Make the smallest reasonable change.

Do not rewrite working code unnecessarily.

Do not replace working architecture simply because
another approach is available.

---

## 11. Dependencies

Do not install a package unless it is actually needed.

Prefer the existing project dependencies.

Before adding a major dependency, explain:

- why it is needed
- what problem it solves
- whether the existing stack can solve the problem

---

## 12. Testing

After meaningful changes:

- run the relevant checks
- verify TypeScript
- verify the application builds
- test the affected user flow
- use browser testing where appropriate

Fix errors before moving to the next phase.

---

## 13. Git

Keep the repository in working states.

Create logical commits after completing major phases.

Do not make large unrelated changes in one commit.

Never delete or rewrite project history without explicit approval.

---

## 14. Development Workflow

Follow this order:

1. Understand the requirement.
2. Inspect existing code.
3. Make a plan.
4. Implement.
5. Run checks.
6. Test in browser when relevant.
7. Fix issues.
8. Summarize changes.

Do not immediately start modifying files without
understanding the current project state.

---

## 15. Scope Control

This is an internal SIH prototype.

Optimize for:

- working functionality
- premium UI
- reliable demo
- explainable adaptive behavior
- visible AI functionality

Do not optimize prematurely for:

- national-scale infrastructure
- complex ML
- production-grade psychometrics
- microservices
- unnecessary infrastructure

---

## 16. Important

When uncertain about an architectural decision,
prefer the simplest solution consistent with
PROJECT_SPEC.md.

If a decision would significantly affect:

- database schema
- authentication
- architecture
- technology stack
- adaptive algorithm

stop and explain the decision before proceeding.