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

### Week 4 (2026-07-27)
- **GitHub Project board set up:** [github.com/users/Kriti-Pandit/projects/1](https://github.com/users/Kriti-Pandit/projects/1) ("TrackMyApply Roadmap"), linked to `Kriti-Pandit/Recall`. Note: GitHub Projects can only be linked to a repo if the project is owned by the *same account* as the repo (a repo collaborator can't create a project directly under the repo owner) — this required installing `gh` CLI and authenticating as the `Kriti-Pandit` account specifically, not the collaborator account used for git commits.
  - Added a custom single-select `Phase` field with all 9 roadmap phases (Phase 0–8), alongside the default `Status` field (Todo/In Progress/Done).
  - Seeded 31 items from the roadmap's deliverables across all phases, with Phase 0 and Phase 1 items marked Done and everything else Todo.
  - **Manual step still needed (not exposed by the GitHub API):** open the project and set a Board view's "Group by" to `Phase` to get literal Phase columns — the GraphQL API has no mutations for view/layout configuration.
- **Still open:** real Google OAuth Client ID hasn't been provided yet, so Google Sign-In is still only verified via a manually-issued JWT, not real end-to-end sign-in.

### Week 5 (2026-07-28) — Phase 2: Resume Attachment & Versioning
- **Backend:** `POST /api/resumes` (multipart upload — validates `.pdf` extension, `%PDF-` magic bytes, and a 10 MB size cap before touching disk), `GET /api/resumes` (list, newest first), `GET /api/resumes/{id}/file` (download, ownership-checked), `DELETE /api/resumes/{id}` (removes DB row + file from disk). Files are stored under `backend/uploads/<uuid>.pdf`; the original filename is kept separately in the DB for display so on-disk names never depend on user input.
- `Application.resume_id` is now exposed on the create/update/read schemas, with an explicit ownership check so a user can't attach another user's resume by guessing/forging a UUID.
- Deleting a resume that's attached to an application correctly detaches it (`resume_id` → `null`) rather than erroring, verified via the existing DB `ON DELETE SET NULL` — no ORM cascade bug this time since, unlike the Phase 1 delete bug, `Resume` has no back-populated collection of `Application`s for the unit-of-work to mismanage.
- **Frontend:** new Resume Library page (`/resumes`) — upload with a version label, list, download (fetched as an authenticated blob since the endpoint needs a Bearer token, not a plain link), delete. The application form now has a "Resume version" dropdown, and the list view shows which resume version is attached per application.
- **Verified end-to-end via Playwright**: seeded-JWT login → upload a resume → create an application with it attached → list view shows the attached version label → edit view correctly pre-selects it → delete both → zero console errors.
- **Still open:** real Google OAuth Client ID hasn't been provided yet, so Google Sign-In is still only verified via a manually-issued JWT, not real end-to-end sign-in.

### Week 6 (2026-08-13)
- **Google Sign-In fully closed out:** got a real OAuth Client ID from Google Cloud Console, wired it into `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`) and `backend/.env` (`GOOGLE_CLIENT_ID`, plus a real random `JWT_SECRET`). Hit Google's documented propagation delay after creating the client ("5 minutes to a few hours to take effect") before the origin was recognized — not a config bug, just needed to wait.
- Local dev backend port moved from 8000 → 8001 permanently: something on this machine (VS Code itself) tends to bind port 8000, causing repeated collisions. Updated `vite.config.ts` proxy and the README accordingly.
- **Phase 3 (Chrome Extension) built:** Manifest V3 extension in `extension/` — see [`extension/README.md`](../extension/README.md) for full details.
  - Auth bridge: a content script on the web app mirrors its login token into the extension's storage, so the extension is signed in automatically whenever you're signed into the web app.
  - Content scripts for LinkedIn (`jobs/*`) and Naukri (`job-listings*`) job pages scrape title, company, JD text, and (Naukri) salary text, with ordered-fallback selectors — substring attribute selectors (`[class*="..."]`) are preferred where possible since they survive Naukri's hashed CSS-module class names regenerating on every deploy.
  - Popup shows a preview, flags any fields it couldn't find (rather than failing silently), and a "Save to Tracker" button POSTs straight to the existing `/api/applications` endpoint.
  - **Important caveat**: built and tested without live access to LinkedIn/Naukri (no browser access to the real sites in this environment). Verified rigorously via Playwright against realistic mock HTML fixtures matching documented page structure — not the live sites. **Needs a manual sanity check against a real LinkedIn/Naukri job posting** before relying on it; selectors may need adjusting if they don't match current live markup.
  - Confirmed empirically (not just from docs) that Manifest V3 extension pages/background with `host_permissions` covering `localhost:8001` bypass CORS entirely — no backend changes were needed for the extension to call the API.
- **Testing note:** MV3 service workers did not start under Playwright's headless Chromium on this machine; testing required a real (non-headless) browser window launched via `launch_persistent_context`.

### Week 7 — planned
- **You: sanity-check the extension against a real LinkedIn and Naukri job posting** — this is the one thing that couldn't be verified in this environment.
- (Stretch, time-permitting) Simple diff viewer between two resume text versions.
- Start Phase 4 (Week 9–10): India-specific application types (campus drive, referral) and salary formatting polish.

## Deliverable status (Phase 0)

- [x] Finalize which platforms to support first
- [x] Set up GitHub repo
- [x] Design full database schema
- [x] Set up dev environment: React frontend, backend skeleton
- [x] PostgreSQL instance provisioned and connected
- [x] Project board / weekly milestone log tooling on GitHub — [project board](https://github.com/users/Kriti-Pandit/projects/1) (this file remains the detailed log)

## Deliverable status (Phase 1)

- [x] CRUD screens: Add / Edit / Delete application
- [x] List view with sorting (date, status, company)
- [x] Search bar by company name
- [x] Basic authentication (Google Sign-In, backend-verified)
- [x] Real Google Client ID wired up and tested

## Deliverable status (Phase 2)

- [x] File upload for resumes (PDF)
- [x] Resume library — view all uploaded versions
- [x] Attach a specific resume version to an application
- [ ] (Stretch) Diff viewer between two resume text versions

## Deliverable status (Phase 3)

- [x] Build Manifest V3 extension
- [x] Content script: LinkedIn job page capture
- [x] Content script: Naukri job page capture
- [x] "Save to Tracker" button → authenticated API call
- [x] Handle edge cases: missing fields, page structure changes (fallback selectors + visible warnings)
- [ ] **Sanity-checked against real LinkedIn/Naukri pages** (only tested against mock fixtures so far — see Week 6 log)
