# TrackMyApply — Chrome Extension

Manifest V3 extension that captures LinkedIn and Naukri job postings straight into TrackMyApply.

## How it works

- **Auth**: `src/content-auth.js` runs on the web app (`http://localhost:5173`) and mirrors its login token into the extension's storage, so the extension is automatically signed in whenever you're signed into the web app in any tab.
- **Capture**: `src/content-linkedin.js` / `src/content-naukri.js` run on job posting pages and read the title, company, and job description straight out of the page DOM — nothing is fetched or scraped in the background. Click the extension icon to see a preview and hit "Save to Tracker".
- **Save**: the popup sends the scraped data to `src/background.js`, which calls the same `POST /api/applications` endpoint the web app uses.

This is intentionally **DOM-reading only, on pages you're actively viewing** — no background scraping, no LinkedIn/Naukri API, no credential automation. Same pattern Teal/Huntr use, and the only pattern that doesn't risk violating LinkedIn's/Naukri's Terms of Service.

## Loading it locally

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. **Load unpacked** → select this `extension/` folder
4. Make sure the backend (`http://localhost:8001`) and frontend (`http://localhost:5173`) are running, sign into the web app in a tab, then visit any LinkedIn or Naukri job posting and click the extension icon

## Known limitation: selectors are best-effort

The CSS selectors in the content scripts were written from commonly-documented LinkedIn/Naukri page structure and verified against realistic mock HTML fixtures (`docs` — not committed, used for local testing), **not the live sites**, since this was built without live browser access to LinkedIn/Naukri. Both sites' class names change over time (Naukri in particular uses hashed CSS-module class names that regenerate on every deploy), so:

- Selectors are tried as an ordered list of fallbacks, and substring attribute selectors (`[class*="..."]`) are preferred over exact class names where possible, since they survive hash suffix changes.
- If a field can't be found, the popup shows which ones are missing rather than failing silently — you can still save and fill them in via the web app.
- **If scraping breaks on a real page**, open dev tools on that page, inspect the actual title/company/JD elements, and update the selector lists in `src/content-linkedin.js` / `src/content-naukri.js` accordingly.
