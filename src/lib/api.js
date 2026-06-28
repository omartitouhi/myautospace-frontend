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

  // Identity verification (KYC)
  requestVerification: () => api('/users/verification/request', { method: 'POST' }),
  getVerificationStatus: () => api('/users/verification/status'),

  // Identity documents — fileUrl since MediaService isn't implemented yet
  listDocuments: () => api('/users/documents'),
  addDocument: (body) => api('/users/documents', { method: 'POST', body }),
  deleteDocument: (id) => api(`/users/documents/${id}`, { method: 'DELETE' }),

  // Subscription packs
  listPacks: () => api('/users/packs'),
  currentPack: () => api('/users/packs/current'),
  subscribePack: (body) => api('/users/packs/subscribe', { method: 'POST', body }),
  cancelPack: () => api('/users/packs/cancel', { method: 'POST' }),

  // GDPR
  exportData: () => api('/users/gdpr/export'),
  deleteAccount: () => api('/users/gdpr/delete-account', { method: 'DELETE' }),

  // Company / dealer accounts
  listCompanies: () => api('/users/company'),
  createCompany: (body) => api('/users/company', { method: 'POST', body }),
  addCompanyMember: (body) => api('/users/company/members', { method: 'POST', body }),
  removeCompanyMember: (memberId) => api(`/users/company/members/${memberId}`, { method: 'DELETE' }),
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

/* ---- BookingService ------------------------------------------------ */
export const bookingApi = {
  create: (body) => api('/bookings', { method: 'POST', body }),
  listMine: () => api('/bookings/my'),
  listIncoming: () => api('/bookings/incoming'),
  get: (id) => api(`/bookings/${id}`),
  setStatus: (id, status, reason = null) =>
    api(`/bookings/${id}/status`, { method: 'PATCH', body: { status, reason } }),
}

export const reminderApi = {
  list: () => api('/notifications/reminders'),
  create: (body) => api('/notifications/reminders', { method: 'POST', body }),
  update: (id, body) => api(`/notifications/reminders/${id}`, { method: 'PUT', body }),
  remove: (id) => api(`/notifications/reminders/${id}`, { method: 'DELETE' }),
}

/* ---- ProviderService (service providers / garages) ----------------- */
export const providerApi = {
  listActive: () => api('/providers'),
  get: (id) => api(`/providers/${id}`),
  getMine: () => api('/providers/my'),
  create: (body) => api('/providers', { method: 'POST', body }),
  update: (id, body) => api(`/providers/${id}`, { method: 'PUT', body }),
  remove: (id) => api(`/providers/${id}`, { method: 'DELETE' }),

  addService: (profileId, body) => api(`/providers/${profileId}/services`, { method: 'POST', body }),
  updateService: (profileId, serviceId, body) =>
    api(`/providers/${profileId}/services/${serviceId}`, { method: 'PUT', body }),
  deleteService: (profileId, serviceId) =>
    api(`/providers/${profileId}/services/${serviceId}`, { method: 'DELETE' }),

  getAvailability: (profileId) => api(`/providers/${profileId}/availability`),
  setAvailability: (profileId, body) => api(`/providers/${profileId}/availability`, { method: 'PUT', body }),
  deleteAvailability: (profileId, availabilityId) =>
    api(`/providers/${profileId}/availability/${availabilityId}`, { method: 'DELETE' }),

  addGalleryImage: (profileId, body) => api(`/providers/${profileId}/gallery`, { method: 'POST', body }),
  deleteGalleryImage: (profileId, imageId) =>
    api(`/providers/${profileId}/gallery/${imageId}`, { method: 'DELETE' }),
}

/* ---- MessagingService (chat) --------------------------------------- */
export const messageApi = {
  conversations: () => api('/messages/conversations'),
  startConversation: (body) => api('/messages/conversations', { method: 'POST', body }),
  messages: (conversationId) => api(`/messages/conversations/${conversationId}/messages`),
  send: (conversationId, body) => api(`/messages/conversations/${conversationId}/messages`, { method: 'POST', body }),
  markRead: (conversationId) => api(`/messages/conversations/${conversationId}/read`, { method: 'POST' }),
  report: (messageId, reason) => api(`/messages/${messageId}/report`, { method: 'POST', body: { reason } }),
}

/* ---- ContractService ----------------------------------------------- */
export const contractApi = {
  listMine: () => api('/contracts/my'),
  get: (id) => api(`/contracts/${id}`),
  create: (body) => api('/contracts', { method: 'POST', body }),
  sign: (id, signerName) => api(`/contracts/${id}/sign`, { method: 'POST', body: { signerName } }),
  archive: (id) => api(`/contracts/${id}/archive`, { method: 'POST' }),
}

/* ---- ReviewService ------------------------------------------------- */
export const reviewApi = {
  forTarget: (targetType, targetId) => api(`/reviews${qs({ targetType, targetId })}`),
  summary: (targetType, targetId) => api(`/reviews/summary${qs({ targetType, targetId })}`),
  mine: () => api('/reviews/my'),
  create: (body) => api('/reviews', { method: 'POST', body }),
  respond: (id, text) => api(`/reviews/${id}/response`, { method: 'POST', body: { text } }),
  approve: (id) => api(`/reviews/${id}/approve`, { method: 'POST' }),
  reject: (id) => api(`/reviews/${id}/reject`, { method: 'POST' }),
}

/* ---- PaymentService (wallet & payments) ---------------------------- */
export const paymentApi = {
  checkout: (body) => api('/payments/checkout', { method: 'POST', body }),
  listMine: () => api('/payments/my'),
  get: (id) => api(`/payments/${id}`),
  refund: (id, reason = null) => api(`/payments/${id}/refund`, { method: 'POST', body: { reason } }),
  wallet: () => api('/payments/wallet'),
  topUp: (body) => api('/payments/wallet/topup', { method: 'POST', body }),
  transactions: () => api('/payments/wallet/transactions'),
  invoice: (id) => api(`/payments/${id}/invoice`),
}

/* ---- MediaService (uploads) ---------------------------------------- */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}

export const mediaApi = {
  // Reads a File in the browser, base64-encodes it and uploads it.
  upload: async (file, { relatedEntityType = null, relatedEntityId = null } = {}) => {
    const dataBase64 = await fileToDataUrl(file)
    const kind = file.type?.startsWith('image/') ? 'Image' : 'Document'
    return api('/media/upload', {
      method: 'POST',
      body: {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        dataBase64,
        kind,
        relatedEntityType,
        relatedEntityId,
      },
    })
  },
  byEntity: (entityId, type) => api(`/media/entity/${entityId}${qs({ type })}`),
  my: () => api('/media/my'),
  remove: (id) => api(`/media/${id}`, { method: 'DELETE' }),
}

/* ---- AdminService (back-office) ------------------------------------ */
export const adminApi = {
  users: {
    list: () => api('/admin/users'),
    suspend: (id) => api(`/admin/users/${id}/suspend`, { method: 'POST' }),
    activate: (id) => api(`/admin/users/${id}/activate`, { method: 'POST' }),
    block: (id) => api(`/admin/users/${id}/block`, { method: 'POST' }),
  },
  content: {
    list: () => api('/admin/content'),
    approve: (id) => api(`/admin/content/${id}/approve`, { method: 'POST' }),
    reject: (id) => api(`/admin/content/${id}/reject`, { method: 'POST' }),
    remove: (id) => api(`/admin/content/${id}/remove`, { method: 'POST' }),
  },
  moderation: {
    list: () => api('/admin/moderation/cases'),
    create: (body) => api('/admin/moderation/cases', { method: 'POST', body }),
    assign: (id, body) => api(`/admin/moderation/cases/${id}/assign`, { method: 'POST', body }),
    approve: (id, body) => api(`/admin/moderation/cases/${id}/approve`, { method: 'POST', body }),
    reject: (id, body) => api(`/admin/moderation/cases/${id}/reject`, { method: 'POST', body }),
    resolve: (id, body) => api(`/admin/moderation/cases/${id}/resolve`, { method: 'POST', body }),
  },
  payments: {
    list: () => api('/admin/payments'),
    stats: () => api('/admin/payments/stats'),
    requestRefund: (id) => api(`/admin/payments/${id}/refund-request`, { method: 'POST' }),
  },
  audit: {
    list: (params = {}) => api(`/admin/audit${qs(params)}`),
  },
  config: {
    list: () => api('/admin/config'),
    upsert: (key, body) => api(`/admin/config/${encodeURIComponent(key)}`, { method: 'PUT', body }),
    remove: (key) => api(`/admin/config/${encodeURIComponent(key)}`, { method: 'DELETE' }),
  },
  reports: {
    list: () => api('/admin/reports'),
    generate: (body) => api('/admin/reports/generate', { method: 'POST', body }),
  },
}

/* ---- MapService (geo locations) ------------------------------------ */
export const mapApi = {
  create: (body) => api('/maps/locations', { method: 'POST', body }),
  get: (id) => api(`/maps/locations/${id}`),
  getByEntity: (entityId, entityType) =>
    api(`/maps/locations/entity/${entityId}${qs({ entityType })}`),
  myLocations: () => api('/maps/locations/my'),
  nearby: ({ latitude, longitude, radiusKm, entityType, limit }) =>
    api(`/maps/locations/nearby${qs({ latitude, longitude, radiusKm, entityType, limit })}`),
  update: (id, body) => api(`/maps/locations/${id}`, { method: 'PUT', body }),
  remove: (id) => api(`/maps/locations/${id}`, { method: 'DELETE' }),

  // Create-or-update the single location for an entity (vehicle/provider).
  upsertForEntity: async (entityId, entityType, body) => {
    try {
      const existing = await api(`/maps/locations/entity/${entityId}${qs({ entityType })}`)
      return await api(`/maps/locations/${existing.id}`, { method: 'PUT', body })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return api('/maps/locations', { method: 'POST', body: { entityId, entityType, ...body } })
      }
      throw err
    }
  },
}
