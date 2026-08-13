// Runs on the TrackMyApply web app itself. Mirrors its login token into the
// extension's storage so the popup/background can make authenticated calls.
const TOKEN_KEY = 'trackmyapply_token'
let lastToken

function syncToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token === lastToken) return
  lastToken = token
  chrome.runtime.sendMessage({ type: 'AUTH_TOKEN_UPDATE', token: token || null })
}

syncToken()
// The `storage` event only fires in other tabs/documents, not this one, so
// poll modestly to notice login/logout that happens right here.
setInterval(syncToken, 3000)
