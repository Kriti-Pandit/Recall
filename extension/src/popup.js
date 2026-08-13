const API_BASE = 'http://localhost:8001/api'
const WEBAPP_URL = 'http://localhost:5173'

const authStatusEl = document.getElementById('auth-status')
const mainEl = document.getElementById('main')

function setAuthStatus(text, cls) {
  authStatusEl.textContent = text
  authStatusEl.className = `auth-status ${cls}`
}

function render(html) {
  mainEl.innerHTML = html
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

async function getStoredToken() {
  const { authToken } = await chrome.storage.local.get('authToken')
  return authToken || null
}

async function fetchCurrentUser(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

function matchSupportedJobPage(url) {
  if (!url) return null
  if (/^https:\/\/www\.linkedin\.com\/jobs\//.test(url)) return 'linkedin'
  if (/^https:\/\/www\.naukri\.com\/(job-listings|.*jobid=)/.test(url)) return 'naukri'
  return null
}

function requestScrape(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_REQUEST' }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message })
        return
      }
      resolve(response ?? { ok: false, error: 'no_response' })
    })
  })
}

function renderPreview(data) {
  const jdSnippet = data.jd_text ? data.jd_text.slice(0, 400) : ''
  const missing = data.missing_fields ?? []

  render(`
    ${missing.length > 0 ? `<div class="warning">Couldn't find: ${missing.join(', ')}. The page layout may have changed — you can still save and fill these in manually.</div>` : ''}
    <div>
      <p class="field-label">Role</p>
      <p class="field-value ${!data.role_title ? 'empty' : ''}">${data.role_title ? escapeHtml(data.role_title) : 'Not found'}</p>
      <p class="field-label">Company</p>
      <p class="field-value ${!data.company_name ? 'empty' : ''}">${data.company_name ? escapeHtml(data.company_name) : 'Not found'}</p>
      <p class="field-label">Job description</p>
      <div class="jd-preview">${data.jd_text ? escapeHtml(jdSnippet) + (data.jd_text.length > 400 ? '…' : '') : 'Not found'}</div>
    </div>
    <button id="save-btn">Save to Tracker</button>
    <div id="result"></div>
  `)

  document.getElementById('save-btn').addEventListener('click', () => handleSave(data))
}

async function handleSave(data) {
  const btn = document.getElementById('save-btn')
  const resultEl = document.getElementById('result')
  btn.disabled = true
  btn.textContent = 'Saving…'
  resultEl.innerHTML = ''

  const payload = {
    company_name: data.company_name || '(unknown company)',
    role_title: data.role_title || '(unknown role)',
    platform: data.platform,
    jd_text: data.jd_text || null,
    jd_source_url: data.jd_source_url || null,
    notes: data.salary_text ? `Salary (from ${data.platform}): ${data.salary_text}` : null,
  }

  chrome.runtime.sendMessage({ type: 'SAVE_APPLICATION', payload }, (response) => {
    btn.disabled = false
    btn.textContent = 'Save to Tracker'
    if (!response || !response.ok) {
      const error = response?.error === 'not_authenticated' ? 'You were signed out — sign in again.' : response?.error
      resultEl.innerHTML = `<div class="result error">Could not save: ${escapeHtml(String(error || 'unknown error'))}</div>`
      return
    }
    resultEl.innerHTML = `<div class="result success">Saved "${escapeHtml(response.data.company_name)}" to your tracker.</div>`
    btn.remove()
  })
}

async function init() {
  const token = await getStoredToken()
  if (!token) {
    setAuthStatus('Not signed in', 'signed-out')
    render(`
      <p class="muted">Sign in to TrackMyApply to save applications from here.</p>
      <a class="link-button" href="${WEBAPP_URL}/login" target="_blank" rel="noopener">Open TrackMyApply</a>
    `)
    return
  }

  const user = await fetchCurrentUser(token)
  if (!user) {
    setAuthStatus('Session expired', 'signed-out')
    render(`
      <p class="muted">Your session expired. Sign in again in TrackMyApply.</p>
      <a class="link-button" href="${WEBAPP_URL}/login" target="_blank" rel="noopener">Open TrackMyApply</a>
    `)
    return
  }

  setAuthStatus(user.email, 'signed-in')

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const platform = matchSupportedJobPage(tab?.url)

  if (!platform) {
    render('<p class="muted">Open a LinkedIn or Naukri job posting to save it here.</p>')
    return
  }

  render('<p class="muted">Reading this page…</p>')
  const scrapeResult = await requestScrape(tab.id)
  if (!scrapeResult.ok) {
    render('<p class="muted">Couldn\'t read this page. Try reloading it, then reopen this popup.</p>')
    return
  }

  renderPreview(scrapeResult.data)
}

init()
