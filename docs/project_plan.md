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

### Week 3 — planned (Phase 1: Core Data Model & Manual Tracker)
- Build CRUD screens: Add / Edit / Delete application.
- Fields: company, role, JD text, salary, platform, date, status, notes.
- List view with sorting (by date, status, company).
- Search bar (by company name).
- Basic authentication.
- Set up GitHub project board with Phase 1–8 columns from the roadmap.

## Deliverable status (Phase 0)

- [x] Finalize which platforms to support first
- [x] Set up GitHub repo
- [x] Design full database schema
- [x] Set up dev environment: React frontend, backend skeleton
- [x] PostgreSQL instance provisioned and connected
- [ ] Project board / weekly milestone log tooling on GitHub (this file serves as the log for now)
