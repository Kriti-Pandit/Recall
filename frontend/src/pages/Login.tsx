import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loginWithGoogleCredential } = useAuth()
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return
    try {
      setError(null)
      await loginWithGoogleCredential(response.credential)
    } catch {
      setError('Sign-in failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-neutral-900">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">TrackMyApply</h1>
        <p className="text-neutral-500 mt-1">Sign in to track your applications.</p>
      </div>
      <GoogleLogin onSuccess={handleSuccess} onError={() => setError('Sign-in failed. Please try again.')} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
