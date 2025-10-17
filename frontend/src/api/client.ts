import axios, { type InternalAxiosRequestConfig } from 'axios'

// Vite env var or default
const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:8000'

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift()
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies for Django session/CSRF
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Add CSRF token header when method is not GET
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1]

    const method = (config.method ?? 'get').toLowerCase()
    if (csrfToken && method !== 'get') {
      config.headers['X-CSRFToken'] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Attach CSRF for POST/PUT/PATCH/DELETE using getCookie
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? 'get').toLowerCase()
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrftoken = getCookie('csrftoken')
      if (csrftoken) {
        // headers is guaranteed on InternalAxiosRequestConfig
        config.headers['X-CSRFToken'] = csrftoken
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Log common response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 404) console.error('Resource not found')
    if (status === 500) console.error('Server error')
    return Promise.reject(error)
  }
)
