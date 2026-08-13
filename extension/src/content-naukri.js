// Best-effort scraper for Naukri job posting pages. Naukri's React app uses
// hashed CSS-module class names (e.g. "styles_jd-header-title__rZwM1") that
// change on every deploy, so substring attribute selectors (which survive
// hash changes) are tried before exact known class names.

function queryText(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el && el.textContent.trim()) return el.textContent.trim()
  }
  return null
}

function scrapeNaukri() {
  const title = queryText([
    '[class*="jd-header-title"]',
    'h1[class*="title"]',
    'h1',
  ])

  const company = queryText([
    '[class*="jd-header-comp-name"] a',
    '[class*="comp-name"] a',
    '[class*="comp-name"]',
  ])

  const jd = queryText([
    '[class*="dang-inner-html"]',
    '#job-desc',
    '[class*="job-desc"]',
  ])

  const salaryText = queryText([
    '[class*="salary"] span',
    '[class*="jhc__salary"]',
    '[class*="salary"]',
  ])

  const missingFields = []
  if (!title) missingFields.push('role_title')
  if (!company) missingFields.push('company_name')
  if (!jd) missingFields.push('jd_text')

  return {
    platform: 'naukri',
    role_title: title || '',
    company_name: company || '',
    jd_text: jd || '',
    jd_source_url: window.location.href.split('?')[0],
    salary_text: salaryText && !/not disclosed/i.test(salaryText) ? salaryText : null,
    missing_fields: missingFields,
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SCRAPE_REQUEST') {
    sendResponse({ ok: true, data: scrapeNaukri() })
    return true
  }
  return false
})
