import axios from 'axios'

// Same-origin `/api` when SPA is served by Express (Render single service).
// Or set VITE_API_URL=https://your-api.onrender.com for a split frontend host.
const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

const api = axios.create({
  baseURL: apiBase,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('orbit_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('orbit_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
