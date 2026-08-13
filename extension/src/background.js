const API_BASE = 'http://localhost:8001/api'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'AUTH_TOKEN_UPDATE') {
    chrome.storage.local.set({ authToken: message.token })
    sendResponse({ ok: true })
    return true
  }

  if (message.type === 'SAVE_APPLICATION') {
    ;(async () => {
      try {
        const { authToken } = await chrome.storage.local.get('authToken')
        if (!authToken) {
          sendResponse({ ok: false, error: 'not_authenticated' })
          return
        }
        const res = await fetch(`${API_BASE}/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(message.payload),
        })
        if (!res.ok) {
          let detail = res.statusText
          try {
            const body = await res.json()
            detail = body.detail ?? detail
          } catch {
            // no JSON body
          }
          sendResponse({ ok: false, error: detail })
          return
        }
        const data = await res.json()
        sendResponse({ ok: true, data })
      } catch (err) {
        sendResponse({ ok: false, error: String(err) })
      }
    })()
    return true
  }

  return false
})
