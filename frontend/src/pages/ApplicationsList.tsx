import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, type Application } from '../lib/api'

const STATUS_LABEL: Record<Application['status'], string> = {
  applied: 'Applied',
  oa_test: 'OA / Test',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const STATUS_COLOR: Record<Application['status'], string> = {
  applied: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  oa_test: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  interview: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  offer: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  withdrawn: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500',
}

export default function ApplicationsList() {
  const { user, logout } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('applied_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listApplications({ search, sort_by: sortBy, sort_dir: sortDir })
      setApplications(data)
    } catch {
      setError('Could not load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortDir])

  async function handleDelete(id: string) {
    if (!confirm('Delete this application? This cannot be undone.')) return
    await api.deleteApplication(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">TrackMyApply</h1>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <Link to="/resumes" className="hover:text-neutral-900 dark:hover:text-neutral-100">
            Resume library
          </Link>
          <span>{user?.name}</span>
          <button onClick={logout} className="hover:text-neutral-900 dark:hover:text-neutral-100">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search by company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="applied_date">Sort: Date applied</option>
            <option value="company_name">Sort: Company</option>
            <option value="status">Sort: Status</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm"
            title="Toggle sort direction"
          >
            {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
          <Link
            to="/applications/new"
            className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium"
          >
            + Add application
          </Link>
        </div>

        {loading && <p className="text-neutral-500 text-sm">Loading…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && applications.length === 0 && (
          <p className="text-neutral-500 text-sm py-8 text-center">
            No applications yet. Add your first one to get started.
          </p>
        )}

        <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
          {applications.map((a) => (
            <li key={a.id} className="py-3 flex items-center justify-between gap-4">
              <Link to={`/applications/${a.id}/edit`} className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {a.company_name} <span className="text-neutral-500 font-normal">— {a.role_title}</span>
                </p>
                <p className="text-xs text-neutral-500">
                  {a.platform} · applied {a.applied_date}
                  {a.resume_version_label && <> · resume: {a.resume_version_label}</>}
                </p>
              </Link>
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLOR[a.status]}`}>
                {STATUS_LABEL[a.status]}
              </span>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-xs text-neutral-400 hover:text-red-600"
                title="Delete"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
