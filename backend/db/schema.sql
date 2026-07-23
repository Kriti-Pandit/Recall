-- TrackMyApply — PostgreSQL schema
-- Phase 0 (Week 1-2) deliverable. Matches docs/schema.md ER diagram.
-- Reference only — db/migrations/ (Alembic) is the source of truth applied to real databases.

CREATE TYPE platform_enum AS ENUM (
    'linkedin', 'naukri', 'campus_drive', 'referral', 'company_website', 'other'
);

CREATE TYPE application_type_enum AS ENUM (
    'standard', 'campus_drive', 'referral'
);

CREATE TYPE status_enum AS ENUM (
    'applied', 'oa_test', 'interview', 'offer', 'rejected', 'withdrawn'
);

CREATE TYPE salary_type_enum AS ENUM (
    'ctc', 'stipend'
);

CREATE TYPE interaction_type_enum AS ENUM (
    'status_change', 'note', 'email_linked', 'resume_attached', 'custom'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    google_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version_label TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    platform platform_enum NOT NULL,
    application_type application_type_enum NOT NULL DEFAULT 'standard',
    status status_enum NOT NULL DEFAULT 'applied',
    salary_type salary_type_enum,
    salary_fixed_lpa NUMERIC(6, 2),
    salary_variable_lpa NUMERIC(6, 2),
    stipend_monthly INTEGER,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_user_company ON applications (user_id, company_name);
CREATE INDEX idx_applications_user_status ON applications (user_id, status);

-- Snapshot, never link: full JD text stored permanently, independent of source_url.
CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    source_url TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1:1 extension for campus_drive application_type.
CREATE TABLE campus_drive_details (
    application_id UUID PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
    drive_date DATE,
    eligibility_criteria TEXT,
    shortlist_rounds TEXT,
    placement_cell_contact TEXT
);

-- 1:1 extension for referral application_type.
CREATE TABLE referral_details (
    application_id UUID PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
    referrer_name TEXT NOT NULL,
    relationship TEXT,
    notes TEXT
);

-- Timeline / narrative view is built from this table, ordered by occurred_at.
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    type interaction_type_enum NOT NULL,
    content TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interactions_application ON interactions (application_id, occurred_at);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    notes TEXT
);
