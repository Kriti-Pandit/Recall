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

### Week 2 — planned
- Provision PostgreSQL (local install or hosted free tier) and apply `schema.sql`.
- Set up Alembic migrations against the live schema.
- Confirm `/api/health/db` returns 200.
- Set up GitHub project board with Phase 1–8 columns from the roadmap.

## Deliverable status (Phase 0)

- [x] Finalize which platforms to support first
- [x] Set up GitHub repo
- [x] Design full database schema
- [x] Set up dev environment: React frontend, backend skeleton
- [ ] PostgreSQL instance provisioned and connected (carried to Week 2)
- [ ] Project board / weekly milestone log tooling on GitHub (this file serves as the log for now)
