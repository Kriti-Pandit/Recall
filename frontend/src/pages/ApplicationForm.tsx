import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, type ApplicationInput, type Platform, type SalaryType, type Status } from '../lib/api'

const emptyForm: ApplicationInput = {
  company_name: '',
  role_title: '',
  platform: 'linkedin',
  application_type: 'standard',
  status: 'applied',
  salary_type: null,
  salary_fixed_lpa: null,
  salary_variable_lpa: null,
  stipend_monthly: null,
  applied_date: new Date().toISOString().slice(0, 10),
  notes: '',
  jd_text: '',
  jd_source_url: '',
}

export default function ApplicationForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<ApplicationInput>(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api
      .getApplication(id)
      .then((a) =>
        setForm({
          company_name: a.company_name,
          role_title: a.role_title,
          platform: a.platform,
          application_type: a.application_type,
          status: a.status,
          salary_type: a.salary_type,
          salary_fixed_lpa: a.salary_fixed_lpa,
          salary_variable_lpa: a.salary_variable_lpa,
          stipend_monthly: a.stipend_monthly,
          applied_date: a.applied_date,
          notes: a.notes ?? '',
          jd_text: a.jd_text ?? '',
          jd_source_url: a.jd_source_url ?? '',
        }),
      )
      .catch(() => setError('Could not load this application.'))
      .finally(() => setLoading(false))
  }, [id])

  function update<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEdit && id) {
        await api.updateApplication(id, form)
      } else {
        await api.createApplication(form)
      }
      navigate('/')
    } catch {
      setError('Could not save this application.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-500">Loading…</div>

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
        <h1 className="text-xl font-semibold">{isEdit ? 'Edit application' : 'Add application'}</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company">
            <input
              required
              value={form.company_name}
              onChange={(e) => update('company_name', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Role">
            <input
              required
              value={form.role_title}
              onChange={(e) => update('role_title', e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Platform">
            <select
              value={form.platform}
              onChange={(e) => update('platform', e.target.value as Platform)}
              className="input"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="naukri">Naukri</option>
              <option value="campus_drive">Campus drive</option>
              <option value="referral">Referral</option>
              <option value="company_website">Company website</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value as Status)}
              className="input"
            >
              <option value="applied">Applied</option>
              <option value="oa_test">OA / Test</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </Field>
          <Field label="Applied date">
            <input
              type="date"
              value={form.applied_date ?? ''}
              onChange={(e) => update('applied_date', e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Field label="Salary type">
            <select
              value={form.salary_type ?? ''}
              onChange={(e) => update('salary_type', (e.target.value || null) as SalaryType | null)}
              className="input"
            >
              <option value="">—</option>
              <option value="ctc">CTC</option>
              <option value="stipend">Stipend</option>
            </select>
          </Field>
          {form.salary_type === 'ctc' && (
            <>
              <Field label="Fixed (LPA)">
                <input
                  type="number"
                  step="0.01"
                  value={form.salary_fixed_lpa ?? ''}
                  onChange={(e) => update('salary_fixed_lpa', e.target.value ? Number(e.target.value) : null)}
                  className="input"
                />
              </Field>
              <Field label="Variable (LPA)">
                <input
                  type="number"
                  step="0.01"
                  value={form.salary_variable_lpa ?? ''}
                  onChange={(e) => update('salary_variable_lpa', e.target.value ? Number(e.target.value) : null)}
                  className="input"
                />
              </Field>
            </>
          )}
          {form.salary_type === 'stipend' && (
            <Field label="Stipend / month (₹)">
              <input
                type="number"
                value={form.stipend_monthly ?? ''}
                onChange={(e) => update('stipend_monthly', e.target.value ? Number(e.target.value) : null)}
                className="input"
              />
            </Field>
          )}
        </div>

        <Field label="Job description (full snapshot)">
          <textarea
            value={form.jd_text ?? ''}
            onChange={(e) => update('jd_text', e.target.value)}
            rows={8}
            className="input"
          />
        </Field>

        <Field label="JD source URL (optional)">
          <input
            value={form.jd_source_url ?? ''}
            onChange={(e) => update('jd_source_url', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Notes">
          <textarea value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} rows={3} className="input" />
        </Field>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      {children}
    </label>
  )
}
