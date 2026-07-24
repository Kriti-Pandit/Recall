# TrackMyApply — Project Plan & Milestone Log

Full roadmap: [`project_description_roadmap.md`](../project_description_roadmap.md).
This file tracks weekly progress against that roadmap.

## Platform scope (finalized)

Per roadmap §Phase 0: first-class support for **LinkedIn**, **Naukri**, and **manual entry** (covering campus drives, referrals, and other portals) for the initial build. Extension auto-capture (Phase 3) targets LinkedIn + Naukri only; everything else is manual entry through the dashboard.

## Stack (finalized)

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS, via Vite |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Repo structure | npm workspaces monorepo (`frontend`, `extension`) + standalone `backend` (Python) |
| Extension | Chrome Manifest V3 (Phase 3) |

## Milestone Log

### Week 1 (2026-07-21)
- Repo initialized, connected to `github.com/Kriti-Pandit/Recall`.
- Monorepo scaffold created: `frontend/` (Vite + React + TS + Tailwind), `backend/` (FastAPI + SQLAlchemy), `extension/` (placeholder for Phase 3), `docs/`.
- Database schema designed and documented: [`docs/schema.md`](./schema.md) (ER diagram) + [`backend/db/schema.sql`](../backend/db/schema.sql) (DDL). Tables: `users`, `resumes`, `applications`, `job_descriptions`, `campus_drive_details`, `referral_details`, `interactions`, `contacts`.
- Backend skeleton verified: FastAPI boots, `/api/health` returns 200, SQLAlchemy models mirror the schema.
- Frontend skeleton verified: `npm run build` succeeds, dev server proxies `/api` to the backend.
- **Open item carried to Week 2:** provision a local or hosted PostgreSQL instance and run `schema.sql` against it (`/api/health/db` will 500 until then — this is expected, not a bug).

### Week 2 (2026-07-23)
- Found PostgreSQL 17 and 18 already installed locally (Windows services, both running) — used 17.
- Created a dedicated `trackmyapply_app` login role and `trackmyapply` database (not using the `postgres` superuser, per least-privilege practice). Superuser password was unknown/never set, so `pg_hba.conf` was temporarily switched to `trust` (with the user's explicit consent and an elevated PowerShell restart) just long enough to set the new role's password, then reverted to `scram-sha-256` and the service restarted again — confirmed password auth is enforced again afterward.
- Set up Alembic (`backend/db/migrations/`), wired to the SQLAlchemy models and `Settings.database_url`.
- Aligned the SQLAlchemy models exactly with `schema.sql` (TEXT columns via a `type_annotation_map`, explicit Postgres enum names, explicit named indexes) so `alembic revision --autogenerate` produces a clean diff with no drift.
- Generated and applied the baseline migration (`123cdeda629d_initial_schema`) — recreates all 8 tables + enums + indexes from scratch.
- Confirmed `/api/health/db` returns `{"status":"ok","database":"connected"}`.
- **Note:** `backend/.env` now holds a real local `DATABASE_URL` with the generated app-role password. It's gitignored and was never committed. Whoever else sets this up locally should follow the new "Database" section in the root `README.md` (create their own role/db, `alembic upgrade head`) rather than share credentials.

### Week 3 (2026-07-24) — Phase 1: Core Data Model & Manual Tracker
- **Auth:** "Sign in with Google" (Google Identity Services) chosen over a plain email/password scheme, per the roadmap's suggested stack. Frontend gets a Google ID token, backend verifies it (`google-auth`) and issues its own JWT (`pyjwt`) for `Authorization: Bearer` on API calls. Requires a Google Cloud OAuth client — steps documented in the root `README.md` under "Auth". **Still waiting on the real Client ID** to be dropped into `frontend/.env` and `backend/.env` before real sign-in can be tested; everything else was verified with a manually-issued JWT in the meantime.
- **Backend:** `POST /api/auth/google`, `GET /api/auth/me`, and full CRUD on `/api/applications` (list with `search`/`sort_by`/`sort_dir`, create, get, update, delete), all scoped to the authenticated user. Job description text is stored via the existing `job_descriptions` 1:1 table and surfaced as a flat `jd_text` field on the API.
- **Bug found + fixed:** deleting an application 500'd with a `NotNullViolation` on `job_descriptions.application_id`. SQLAlchemy's ORM was trying to null out the child FK on parent delete instead of leaving it to Postgres's `ON DELETE CASCADE`. `passive_deletes=True` alone didn't fix it for the `uselist=False` one-to-one relationships in this SQLAlchemy version; switched to explicit `cascade="all, delete-orphan"` on the owned-child relationships (`job_description`, `campus_drive_details`, `referral_details`, `interactions`, `contacts` on `Application`; `resumes`, `applications` on `User`). No DB schema drift from this change — it's ORM-only config.
- **Frontend:** React Router with a `ProtectedRoute` guard, `AuthContext` (JWT in `localStorage`), Login page (`@react-oauth/google`), applications list (search + sort + delete), and a shared add/edit form.
- **Verified end-to-end via Playwright** (headless Chromium, since this machine has no browser-automation CLI preinstalled): logged-out `/` correctly redirects to `/login`; with a seeded JWT, add → search-filter → status edit → delete all worked with zero console errors. Screenshots confirmed visually.
- Company-search deliverable met: added test applications, searched by company name, got instant, correct results (Phase 1's stated milestone demo).

### Week 4 — planned
- Wire the real Google Client ID once provided; test actual Google sign-in end-to-end (not just the JWT-seeded path).
- Set up GitHub project board with Phase 1–8 columns from the roadmap.
- Start Phase 2 (Week 5–6): resume upload + versioning, attach a resume to an application.

## Deliverable status (Phase 0)

- [x] Finalize which platforms to support first
- [x] Set up GitHub repo
- [x] Design full database schema
- [x] Set up dev environment: React frontend, backend skeleton
- [x] PostgreSQL instance provisioned and connected
- [ ] Project board / weekly milestone log tooling on GitHub (this file serves as the log for now)

## Deliverable status (Phase 1)

- [x] CRUD screens: Add / Edit / Delete application
- [x] List view with sorting (date, status, company)
- [x] Search bar by company name
- [x] Basic authentication (Google Sign-In, backend-verified)
- [ ] Real Google Client ID wired up and tested (currently verified via a manually-issued JWT only)
