export type Platform = 'linkedin' | 'naukri' | 'campus_drive' | 'referral' | 'company_website' | 'other'
export type ApplicationType = 'standard' | 'campus_drive' | 'referral'
export type Status = 'applied' | 'oa_test' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
export type SalaryType = 'ctc' | 'stipend'

export interface Application {
  id: string
  company_name: string
  role_title: string
  platform: Platform
  application_type: ApplicationType
  status: Status
  salary_type: SalaryType | null
  salary_fixed_lpa: number | null
  salary_variable_lpa: number | null
  stipend_monthly: number | null
  applied_date: string
  notes: string | null
  jd_text: string | null
  jd_source_url: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationInput {
  company_name: string
  role_title: string
  platform: Platform
  application_type?: ApplicationType
  status?: Status
  salary_type?: SalaryType | null
  salary_fixed_lpa?: number | null
  salary_variable_lpa?: number | null
  stipend_monthly?: number | null
  applied_date?: string | null
  notes?: string | null
  jd_text?: string | null
  jd_source_url?: string | null
}

export interface CurrentUser {
  id: string
  email: string
  name: string
}

const TOKEN_KEY = 'trackmyapply_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, detail)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  loginWithGoogle: (credential: string) =>
    request<{ access_token: string; user: CurrentUser }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
  me: () => request<CurrentUser>('/auth/me'),
  listApplications: (params: { search?: string; sort_by?: string; sort_dir?: string } = {}) => {
    const qs = new URLSearchParams()
    if (params.search) qs.set('search', params.search)
    if (params.sort_by) qs.set('sort_by', params.sort_by)
    if (params.sort_dir) qs.set('sort_dir', params.sort_dir)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request<Application[]>(`/applications${suffix}`)
  },
  getApplication: (id: string) => request<Application>(`/applications/${id}`),
  createApplication: (data: ApplicationInput) =>
    request<Application>('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplication: (id: string, data: Partial<ApplicationInput>) =>
    request<Application>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApplication: (id: string) => request<void>(`/applications/${id}`, { method: 'DELETE' }),
}
