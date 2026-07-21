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
npm run dev --workspace frontend
```

Frontend dev server proxies `/api/*` to `http://localhost:8000`.

### Database
Apply [`backend/db/schema.sql`](backend/db/schema.sql) to a PostgreSQL instance and set `DATABASE_URL` in `backend/.env` accordingly. See [`docs/schema.md`](docs/schema.md) for the ER diagram and design notes.

## Progress

See [`docs/project_plan.md`](docs/project_plan.md) for the weekly milestone log.
