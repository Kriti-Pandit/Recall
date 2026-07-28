import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Resume } from '../lib/api'

export default function ResumeLibrary() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [versionLabel, setVersionLabel] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    try {
      setResumes(await api.listResumes())
    } catch {
      setError('Could not load resumes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file || !versionLabel.trim()) {
      setError('Pick a PDF file and give it a version label.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      await api.uploadResume(file, versionLabel.trim())
      setVersionLabel('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await load()
    } catch {
      setError('Upload failed. Make sure the file is a valid PDF.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(resume: Resume) {
    if (!confirm(`Delete "${resume.version_label}"? Any applications referencing it will lose the attachment.`)) return
    await api.deleteResume(resume.id)
    setResumes((prev) => prev.filter((r) => r.id !== resume.id))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Resume library</h1>
        <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          ← Back to applications
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
        <form onSubmit={handleUpload} className="flex flex-col gap-3 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
          <p className="text-sm font-medium">Upload a resume version</p>
          <input
            type="text"
            placeholder='Version label, e.g. "v2 - backend focused"'
            value={versionLabel}
            onChange={(e) => setVersionLabel(e.target.value)}
            className="input"
          />
          <input ref={fileInputRef} type="file" accept="application/pdf" className="text-sm" />
          <button
            type="submit"
            disabled={uploading}
            className="self-start px-4 py-2 text-sm rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {loading && <p className="text-neutral-500 text-sm">Loading…</p>}
        {!loading && resumes.length === 0 && (
          <p className="text-neutral-500 text-sm py-8 text-center">No resumes uploaded yet.</p>
        )}

        <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
          {resumes.map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{r.version_label}</p>
                <p className="text-xs text-neutral-500 truncate">
                  {r.file_name} · uploaded {new Date(r.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs shrink-0">
                <button
                  onClick={() => api.downloadResume(r.id, r.file_name)}
                  className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Download
                </button>
                <button onClick={() => handleDelete(r)} className="text-neutral-400 hover:text-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
