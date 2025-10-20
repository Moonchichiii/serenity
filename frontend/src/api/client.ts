import axios, { type InternalAxiosRequestConfig } from 'axios'
// Vite env var or default - EXPORT for use in other components
export const API_URL = import.meta.env['VITE_API_URL']

function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  if (!match) return undefined
  const parts = match.split('=')
  return parts[1] ? decodeURIComponent(parts[1]) : undefined
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  // Axios built-ins for CSRF: match Django defaults
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

// Single interceptor: attach CSRF for mutating verbs (belt & suspenders)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? 'get').toLowerCase()
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrftoken = getCookie('csrftoken')
      if (csrftoken) {
        ;(config.headers as Record<string, string>)['X-CSRFToken'] = csrftoken
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
