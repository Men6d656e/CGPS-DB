import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ─── Auth interceptor: handle 401 and attempt refresh ───────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept requests to /login or /refresh
      if (originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh')) {
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
)

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
  delete: (id) => api.delete(`/parents/${id}`),
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
  delete: (id) => api.delete(`/invoices/${id}`),
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  list: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  delete: (id) => api.delete(`/payments/${id}`),
}

// ─── Users (Admin only) ─────────────────────────────────────────────────────
export const usersApi = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/auth/register', data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  resetPassword: (id, newPassword) => api.patch(`/users/${id}/password`, { current_password: '', new_password: newPassword }),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  monthlyCollections: (months) => api.get('/dashboard/monthly-collections', { params: { months } }),
}

export default api
