// Best-effort scraper for LinkedIn job posting pages. LinkedIn's DOM/class
// names change over time, so this tries several known selectors in order
// and reports which fields it couldn't find rather than failing silently.

function queryText(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el && el.textContent.trim()) return el.textContent.trim()
  }
  return null
}

function scrapeLinkedIn() {
  const title = queryText([
    '.job-details-jobs-unified-top-card__job-title h1',
    '.job-details-jobs-unified-top-card__job-title',
    'h1.t-24',
    'h1[class*="job-title"]',
    'h1',
  ])

  const company = queryText([
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    'a[class*="company-name"]',
    '[class*="company-name"]',
  ])

  const jd = queryText([
    '.jobs-description__content .jobs-box__html-content',
    '#job-details',
    '.jobs-description-content__text',
    '[class*="jobs-description"]',
  ])

  const missingFields = []
  if (!title) missingFields.push('role_title')
  if (!company) missingFields.push('company_name')
  if (!jd) missingFields.push('jd_text')

  return {
    platform: 'linkedin',
    role_title: title || '',
    company_name: company || '',
    jd_text: jd || '',
    jd_source_url: window.location.href.split('?')[0],
    missing_fields: missingFields,
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SCRAPE_REQUEST') {
    sendResponse({ ok: true, data: scrapeLinkedIn() })
    return true
  }
  return false
})
