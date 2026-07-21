# TrackMyApply (Working Title)
### An India-First Job Application Context & Memory Tracker

---

## 1. Project Overview

### 1.1 Title
**TrackMyApply — A Contextual Job Application Tracking System for the Indian Hiring Ecosystem**

*(Rename freely — suggestions: ApplyMemo, ReCall, JobContext, SmritiTrack)*

### 1.2 Domain
HRTech / Career Technology / Productivity Tools

### 1.3 One-Line Pitch
A browser-extension-powered tracker that permanently preserves the exact job description, resume version, salary details, and application context for every job a candidate applies to — so that when a recruiter reaches out weeks later, the candidate can instantly reconstruct what they applied for and how they presented themselves.

---

## 2. Background & Motivation

Modern hiring, especially for students and early-career candidates in India, is fragmented across LinkedIn, Naukri, campus placement portals, referral links, and company career pages. A single candidate may apply to 50–100+ roles across a placement season.

The hiring process is also **slow and asynchronous**: recruiters may respond days, weeks, or even months after an application. By the time contact happens, candidates have usually:
- Applied to dozens of other roles
- Forgotten the exact job description
- Lost track of which resume version was sent
- Forgotten what salary/CTC was listed
- Lost the original context of why they applied

This creates avoidable friction during interview preparation and increases the risk of missed or mishandled opportunities — not because of lack of effort, but lack of a reliable memory system.

### 2.2 Existing Solutions and Their Gaps

Tools like **Teal**, **Huntr**, and **Simplify** already address parts of this problem for the global/US market. Research into these tools reveals a consistent pattern:

| Gap Area | Observation |
|---|---|
| Platform coverage | Built around LinkedIn, Indeed, Workday, Greenhouse — no support for Naukri or Indian campus/referral portals |
| Core focus | Optimized for resume tailoring, ATS keyword scoring, and auto-apply — not for long-term context recall |
| Paywalls | Core insights (keyword analysis, matching) gated behind subscriptions |
| Inbox awareness | None of them parse or link recruiter emails back to applications automatically |
| Salary formatting | US-style ranges; no support for LPA/CTC-style Indian salary conventions |
| JD permanence | JD is stored as a secondary artifact for keyword matching, not preserved as the canonical record of what was promised/required |

This is a validated market — millions of users rely on these tools — but the **India-specific, memory-first use case remains unaddressed.**

---

## 3. Problem Statement

> Job seekers need a reliable way to preserve and reconstruct the complete context of every job application — the exact job description, resume version, salary details, platform, and application history — so that when an employer responds, regardless of the time gap, the candidate can immediately regain full context, without relying on memory or scattered records.

---

## 4. Proposed Solution

TrackMyApply is a **capture-and-recall system**, not a full career-management suite. It does one thing very well: **when you applied for what, with what, and what was promised — permanently retrievable.**

### 4.1 Core Principles (Design Philosophy)
1. **Snapshot, never link** — JDs and details are stored as permanent text records, not just URLs (URLs die; job posts get taken down).
2. **Context over automation** — the goal is not to auto-apply or optimize resumes, but to preserve and resurface context reliably.
3. **India-first** — built around Naukri, campus drives, referral chains, and Indian salary conventions from day one, not as an afterthought.
4. **Free and complete** — no gated core features, since it is designed for students and early-career job seekers.

### 4.2 Target User
Final-year engineering/college students and early-career professionals applying across multiple Indian platforms during placement season — a validated user group since the developer is part of it.

---

## 5. Core Features

### 5.1 Must-Have (Core Scope)
| Feature | Description |
|---|---|
| Manual + extension-based application entry | Add applications manually or auto-capture via Chrome extension |
| Full JD snapshot | Complete job description text stored permanently, independent of the original link |
| Resume attachment per application | Exact resume file/version tied to each application |
| Salary/CTC field (India format) | LPA, stipend, package terminology supported |
| Platform tagging | LinkedIn, Naukri, campus portal, referral, company website |
| Status/stage tracking | Applied → OA/Test → Interview → Offer/Rejected |
| Search & lookup | Instantly find an application by company name when an email/call arrives |
| Notes per application | Freeform notes, prep points, interviewer names, etc. |

### 5.2 Differentiator Features (What Makes It Unique)
| Feature | Why It's Unique |
|---|---|
| Chrome extension with Naukri + campus portal support | Neither Teal nor Huntr support Naukri or campus drives |
| Campus Drive application type | Fields like drive date, eligibility criteria, shortlist round — not modeled by any existing tool |
| Timeline / narrative view | A single linear story per application: JD → resume sent → emails → status changes → notes. Distinct from competitors' Kanban/table-first UI |
| WhatsApp message parsing (stretch) | Paste a WhatsApp recruiter message → auto-extract company/role/details via LLM — reflects real Indian recruiter communication habits |
| Email-to-application matching (stretch) | Detects incoming recruiter emails and flags which existing application they belong to |
| Resume-to-JD claim tracking (stretch) | Tags which resume points map to which JD requirements, resurfaced as interview prep cues |
| Offer comparison view (stretch) | Side-by-side comparison of offers using already-stored salary/role/notes data |
| No paywall | All core features free and unlimited |

### 5.3 Explicitly Out of Scope
- Auto-apply / automated form submission
- AI resume/cover letter generation
- ATS keyword optimization scoring
- Full CRM-style recruiter relationship management

Keeping these out of scope is intentional — it keeps the project focused and prevents scope creep into territory Teal/Huntr already dominate.

---

## 6. System Architecture

```
┌─────────────────────┐        ┌──────────────────────┐
│  Chrome Extension    │──────▶ │   Backend API          │
│  (Manifest V3)        │        │  (FastAPI / Node.js)   │
│  - LinkedIn scraper   │        │  - Auth (Google OAuth) │
│  - Naukri scraper     │        │  - Application CRUD    │
└─────────────────────┘        │  - Resume storage       │
                                  │  - Search/lookup        │
┌─────────────────────┐        │  - (Optional) Email      │
│  Web Dashboard (React) │◀─────▶│    parsing service       │
│  - Add/View/Search      │        └──────────────────────┘
│  - Timeline view          │                 │
│  - Resume manager        │                 ▼
└─────────────────────┘        ┌──────────────────────┐
                                  │  PostgreSQL Database   │
                                  │  - applications         │
                                  │  - resumes (versioned)  │
                                  │  - job_descriptions     │
                                  │  - interactions          │
                                  └──────────────────────┘
```

### 6.1 Suggested Tech Stack
| Layer | Technology | Reasoning |
|---|---|---|
| Frontend | React + Tailwind CSS | Fast to build, widely resume-recognized |
| Backend | FastAPI (Python) or Node.js (Express) | FastAPI pairs well if LLM/email parsing is added later |
| Database | PostgreSQL | Relational model fits applications/resumes/interactions well |
| Extension | Chrome Manifest V3 | Standard, safe, ToS-compliant capture method |
| Auth | Google OAuth | Also unlocks Gmail API for optional email features |
| File storage | Local/S3-compatible bucket | For resume file uploads |
| LLM (optional, stretch) | Claude/GPT API | For WhatsApp parsing, email classification |

---

## 7. Detailed Roadmap (16-Week Semester Plan)

### Phase 0 — Setup & Scoping (Week 1–2)
**Goal:** Finalize scope, set up infrastructure.
- Finalize which 2–3 platforms to support first (recommended: LinkedIn, Naukri, manual entry for others)
- Set up GitHub repo, project board, weekly milestone log
- Design full database schema (applications, resumes, job_descriptions, interactions, contacts)
- Set up dev environment: React frontend, backend skeleton, PostgreSQL instance

**Deliverable:** Approved schema diagram + project plan document.

---

### Phase 1 — Core Data Model & Manual Tracker (Week 3–5)
**Goal:** A working manual tracker as the foundation — usable even without automation.
- Build CRUD screens: Add / Edit / Delete application
- Fields: company, role, JD text, salary, platform, date, status, notes
- List view with sorting (by date, status, company)
- Search bar (by company name — this is your key "email arrived" lookup flow)
- Basic authentication (so it's a real deployable product, not just local)

**Deliverable / Milestone Demo 1:** Manually add 10 real applications, search and retrieve one instantly.

---

### Phase 2 — Resume Attachment & Versioning (Week 5–6)
**Goal:** Tie exact resume files to exact applications.
- File upload for resumes (PDF)
- Resume library — see all uploaded versions
- Attach a specific resume version to each application record
- (Stretch) Simple diff viewer between two resume text versions

**Deliverable / Milestone Demo 2:** Show that Application X is provably linked to Resume Version Y, retrievable instantly.

---

### Phase 3 — Chrome Extension for Auto-Capture (Week 6–9)
**Goal:** Reduce manual entry; core technical differentiator.
- Build Manifest V3 extension
- Content script for LinkedIn job pages: extract title, company, JD, URL
- Content script for Naukri job pages: extract title, company, JD, salary (if listed), URL
- "Save to Tracker" button → sends data to backend via authenticated API call
- Handle edge cases: missing fields, page structure changes

**Deliverable / Milestone Demo 3:** Click extension on a live LinkedIn and Naukri job posting → application auto-created with full JD captured.

*Note: This uses only DOM-reading on pages the user is actively viewing — no background scraping, no credential automation. Same safe pattern used by Teal/Huntr.*

---

### Phase 4 — India-Specific Application Types (Week 9–10)
**Goal:** Build out the core differentiator — Indian hiring context support.
- Campus Drive application type: drive date, eligibility criteria, shortlist rounds, placement cell contact
- Referral application type: referrer name, relationship, notes
- Salary field formatting: LPA, CTC breakup (fixed/variable), stipend for internships

**Deliverable / Milestone Demo 4:** Add a campus drive application and a referral application, showing fields no competitor tool supports.

---

### Phase 5 — Timeline / Narrative View (Week 10–12)
**Goal:** Build the standout differentiator screen.
- Single linear timeline per application: JD saved → resume attached → status changes → notes added → (optional) emails linked
- Visually distinct from competitors' Kanban/table views
- This becomes your primary demo screen

**Deliverable / Milestone Demo 5:** Show a full timeline for one real application from your own placement season.

---

### Phase 6 — Stretch Features (Week 12–14, time-permitting)
Pick 1–2 based on remaining time:
- **Email-to-application matching:** Gmail API (read-only) scans inbox, keyword/company-name matches incoming emails to existing applications, flags them on the dashboard
- **WhatsApp message parsing:** paste a message, LLM extracts company/role/details, pre-fills a new application
- **Resume-to-JD claim tagging:** tag resume bullet points against JD requirements, surfaced as prep cues
- **Offer comparison view:** side-by-side comparison table generated from stored data

**Deliverable:** At least one working stretch feature, demoed live.

---

### Phase 7 — Polish, Reminders, Dashboard (Week 14–15)
- Follow-up reminders (e.g., "no response in 10 days")
- Summary dashboard: total applications, response rate, stage breakdown
- UI polish pass, error handling, empty states

---

### Phase 8 — Testing, Documentation, Report (Week 15–16)
- User-test with 3–5 classmates actively job hunting; collect and act on feedback
- Write project report: problem statement, related work (Teal/Huntr gap analysis), architecture, evaluation
- Prepare scripted final demo — ideally using your own real application data collected throughout the semester

**Deliverable:** Final report + working deployed demo + presentation deck.

---

## 8. Evaluation Criteria (Suggested, for your own tracking)

| Criterion | How to Measure |
|---|---|
| Data integrity | JD/resume/salary correctly preserved and retrievable for 100% of test applications |
| Extension reliability | Successfully captures data from LinkedIn/Naukri job pages in >90% of test cases |
| Retrieval speed | Company search returns correct application in under 2 seconds |
| Real usage | Number of your own real applications tracked through the system during the semester |
| User feedback | Feedback from 3–5 peer testers on usefulness of timeline view and search |

---

## 9. Related Work / Competitive Positioning Summary

| Aspect | Teal / Huntr | TrackMyApply |
|---|---|---|
| Market focus | US/global | India-first |
| Core value | Resume optimization, ATS scoring, auto-fill | Permanent context memory for recruiter recall |
| Platform support | LinkedIn, Indeed, Workday, Greenhouse | LinkedIn, Naukri, campus portals, referrals |
| Salary format | US-style | LPA/CTC Indian format |
| Pricing | Freemium with gated core features | Fully free |
| Standout screen | Kanban board / resume analyzer | Narrative timeline per application |

---

## 10. Future Scope (For Report — Beyond Semester)
- Full LLM-based context reconstruction assistant ("recruiter just called — here's your prep sheet")
- Mobile app for on-the-go capture
- Integration with placement cell systems for bulk campus drive import
- Community-shared salary insights (anonymized, opt-in) across users

---

*Prepared as a project scoping and roadmap document for final-year academic submission.*
