# Student College Tracker

Studywell is a secure personal college companion for managing subjects, attendance, tasks, exams, study sessions, analytics, and daily academic priorities.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/student-college-tracker run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- SQLite is created automatically at `data/student-tracker.sqlite` (override with `SQLITE_PATH`).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: SQLite + better-sqlite3
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/student-college-tracker/src/App.tsx` — authenticated web experience, routing, forms, and dashboard screens.
- `artifacts/student-college-tracker/src/index.css` — Studywell visual tokens and responsive styles.
- `artifacts/api-server/src/routes/student.ts` — auth, user-scoped CRUD, analytics, and recommendation endpoints.
- `artifacts/api-server/src/lib/sqlite.ts` — SQLite schema and connection setup.
- `lib/api-spec/openapi.yaml` — source of truth for the generated API hooks and validation schemas.

## Architecture decisions

- Local authentication is intentional: signup/login use scrypt-hashed passwords and opaque, hashed session tokens stored in SQLite.
- Every student-owned query includes `student_id`; ownership is enforced in the API rather than trusted from the client.
- Dates are stored as ISO date-only strings so attendance, due dates, exams, and study history stay timezone-stable.
- The frontend uses generated React Query hooks and invalidates affected views after every successful mutation.

## Product

- Students can create an account, sign in, sign out, and maintain a personal profile.
- Dashboard surfaces attendance percentage and 75% recovery math, open tasks, upcoming exams, study momentum, productivity score, streak, recent activity, and a next-action recommendation.
- Subjects support attendance records; tasks and exams support create/edit/delete flows; study sessions and analytics make progress visible.

## User preferences

- The requested product name is Student College Tracker; the in-app identity is Studywell.
- The user explicitly requested SQLite and hashed passwords.

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`.
- The API creates the SQLite file and tables on startup; no Postgres migration is required for this product.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
