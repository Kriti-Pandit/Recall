# TrackMyApply

An India-first job application context & memory tracker. Full spec and roadmap: [`project_description_roadmap.md`](./project_description_roadmap.md).

## Structure

```
backend/     FastAPI + SQLAlchemy + PostgreSQL
frontend/    React + TypeScript + Tailwind (Vite)
extension/   Chrome Manifest V3 extension (Phase 3, not yet started)
docs/        Schema diagram, project plan / milestone log
```

## Getting started

### Backend
```
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env          # then point DATABASE_URL at your Postgres instance
uvicorn app.main:app --reload --port 8000
```

### Frontend
```
npm install
cp frontend/.env.example frontend/.env   # set VITE_GOOGLE_CLIENT_ID, see Auth below
npm run dev --workspace frontend
```

Frontend dev server proxies `/api/*` to `http://localhost:8000`.

### Auth (Google Sign-In)

Auth is "Sign in with Google" via [Google Identity Services](https://developers.google.com/identity/gsi/web) — the frontend gets an ID token from Google, sends it to `POST /api/auth/google`, and the backend verifies it and issues its own JWT (used as `Authorization: Bearer <token>` on subsequent API calls).

To set up your own Google OAuth client:
1. [Google Cloud Console](https://console.cloud.google.com) → create/select a project.
2. **APIs & Services → OAuth consent screen** → User Type: External → fill in app name + your email → save (Testing mode is fine).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type: Web application → Authorized JavaScript origins: `http://localhost:5173` → Authorized redirect URIs: `http://localhost:5173`.
4. Copy the Client ID into both:
   - `frontend/.env`: `VITE_GOOGLE_CLIENT_ID=...`
   - `backend/.env`: `GOOGLE_CLIENT_ID=...` (backend verifies the token's audience against this)

### Database

1. Create a Postgres database and an app-specific role (don't use the `postgres` superuser):
   ```sql
   CREATE ROLE trackmyapply_app LOGIN PASSWORD 'choose-a-password';
   CREATE DATABASE trackmyapply OWNER trackmyapply_app;
   ```
2. Set `DATABASE_URL` in `backend/.env` (copy from `.env.example`) to point at it.
3. Apply the schema via Alembic (this is the source of truth going forward; [`backend/db/schema.sql`](backend/db/schema.sql) + [`docs/schema.md`](docs/schema.md) are the human-readable reference the migrations are generated from):
   ```
   cd backend
   alembic upgrade head
   ```

To change the schema later: edit the SQLAlchemy models in `backend/app/models/`, then run `alembic revision --autogenerate -m "..."` and `alembic upgrade head`. Keep `backend/db/schema.sql` and `docs/schema.md` in sync with any model changes.

## Progress

See [`docs/project_plan.md`](docs/project_plan.md) for the weekly milestone log.
