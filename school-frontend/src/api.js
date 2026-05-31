import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentsApi = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.patch(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getSiblings: (id) => api.get(`/students/${id}/siblings`),
  linkParent: (studentId, data) => api.post(`/students/${studentId}/parents`, data),
  unlinkParent: (studentId, parentId) => api.delete(`/students/${studentId}/parents/${parentId}`),
}

// ─── Parents ──────────────────────────────────────────────────────────────────
export const parentsApi = {
  list: (params) => api.get('/parents', { params }),
  get: (id) => api.get(`/parents/${id}`),
  create: (data) => api.post('/parents', data),
  update: (id, data) => api.patch(`/parents/${id}`, data),
}

// ─── Fee Types ────────────────────────────────────────────────────────────────
export const feesApi = {
  list: () => api.get('/fees'),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.patch(`/fees/${id}`, data),
  addOverride: (id, data) => api.post(`/fees/${id}/overrides`, data),
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoicesApi = {
  list: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  list: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
}

export default api
