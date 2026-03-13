import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (JWT)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Backend responded with an error
      if (error.response.status === 401) {
        localStorage.removeItem('token')
      }

      return Promise.reject(error.response.data)
    }

    // Network error (backend down, CORS, etc.)
    if (error.request) {
      return Promise.reject(new Error('Network Error: backend not reachable'))
    }

    return Promise.reject(error)
  }
)

export default api