/* API client for the MyAutoSpace gateway.
   All calls go through `/api/*` (Vite proxies to the YARP gateway in dev,
   nginx can do the same in production). JSON casing is ASP.NET camelCase;
   enums travel as strings ("Petrol", "ForSale", …).

   Auth: the session (access + refresh token) is persisted in localStorage.
   On a 401 the client performs a single-flight refresh-token exchange and
   retries the original request once; if that fails the session is cleared
   and `onSessionExpired` fires so the UI can route back to login. */

const SESSION_KEY = 'mas-session'

let session = readSession()
let refreshPromise = null
let onSessionExpired = null

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getSession() {
  return session
}

export function setSession(next) {
  session = next
  if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
  else localStorage.removeItem(SESSION_KEY)
}

export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn
}

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function parseBody(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function rawRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await parseBody(res)
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.title)) ||
      (typeof data === 'string' && data) ||
      `Request failed (${res.status})`
    throw new ApiError(res.status, message, data)
  }
  return data
}

async function refreshSession() {
  // Single-flight: concurrent 401s share one refresh exchange.
  refreshPromise ??= (async () => {
    try {
      const data = await rawRequest('/auth/refresh-token', {
        method: 'POST',
        body: { refreshToken: session.refreshToken },
      })
      setSession(data)
      return data
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

export async function api(path, options = {}) {
  try {
    return await rawRequest(path, { ...options, token: session?.accessToken })
  } catch (err) {
    const canRetry = err instanceof ApiError && err.status === 401 && session?.refreshToken
    if (!canRetry) throw err
    try {
      const fresh = await refreshSession()
      return await rawRequest(path, { ...options, token: fresh.accessToken })
    } catch (refreshErr) {
      setSession(null)
      onSessionExpired?.()
      throw refreshErr
    }
  }
}

function qs(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

/* ---- AuthService -------------------------------------------------- */
export const authApi = {
  register: (body) => rawRequest('/auth/register', { method: 'POST', body }),
  login: (body) => rawRequest('/auth/login', { method: 'POST', body }),
  logout: (refreshToken) => api('/auth/logout', { method: 'POST', body: { refreshToken } }),
  me: () => api('/auth/me'),
}

/* ---- UserService --------------------------------------------------- */
export const userApi = {
  getProfile: () => api('/users/profile'),
  createProfile: (body) => api('/users/profile', { method: 'POST', body }),
  updateProfile: (body) => api('/users/profile', { method: 'PUT', body }),
  getPreferences: () => api('/users/preferences'),
  updatePreferences: (body) => api('/users/preferences', { method: 'PUT', body }),
  getTrustScore: () => api('/users/trust-score'),
  recalculateTrustScore: () => api('/users/trust-score/recalculate', { method: 'POST' }),
  getActivity: () => api('/users/activity'),
}

/* ---- VehicleService ------------------------------------------------ */
export const vehicleApi = {
  listActive: () => api('/vehicles'),
  listMine: () => api('/vehicles/my'),
  get: (id) => api(`/vehicles/${id}`),
  create: (body) => api('/vehicles', { method: 'POST', body }),
  update: (id, body) => api(`/vehicles/${id}`, { method: 'PUT', body }),
  setStatus: (id, status) => api(`/vehicles/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id) => api(`/vehicles/${id}`, { method: 'DELETE' }),
}

/* ---- SearchService ------------------------------------------------- */
export const searchApi = {
  search: (params) => api(`/search${qs(params)}`),
  autocomplete: (prefix, limit = 8) => api(`/search/autocomplete${qs({ prefix, limit })}`),
  suggestions: (term, limit = 8) => api(`/search/suggestions${qs({ term, limit })}`),
}

/* ---- NotificationService ------------------------------------------- */
export const notificationApi = {
  list: (status) => api(`/notifications${qs({ status })}`),
  attempts: (id) => api(`/notifications/${id}/attempts`),
}
