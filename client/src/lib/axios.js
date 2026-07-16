import axios from 'axios'

// Dynamic baseURL:
// - Development: uses Vite proxy (/api -> localhost)
// - Production: uses the full backend URL from environment variable
const baseURL = import.meta.env.DEV
  ? '/api'
  : `${import.meta.env.VITE_API_URL}/api`

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('orbit_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 Unauthorized globally
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