import { useEffect, useState } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? setApiStatus('ok') : setApiStatus('error')))
      .catch(() => setApiStatus('error'))
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-semibold">TrackMyApply</h1>
      <p className="text-neutral-500">Week 1 scaffold — frontend is up.</p>
      <p className="text-sm">
        Backend API:{' '}
        <span
          className={
            apiStatus === 'ok'
              ? 'text-green-600'
              : apiStatus === 'error'
                ? 'text-red-600'
                : 'text-neutral-400'
          }
        >
          {apiStatus === 'checking' ? 'checking…' : apiStatus === 'ok' ? 'connected' : 'not reachable'}
        </span>
      </p>
    </div>
  )
}

export default App
