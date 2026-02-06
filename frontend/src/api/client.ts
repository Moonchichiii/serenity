import axios, { type InternalAxiosRequestConfig } from 'axios'

export const API_URL = import.meta.env.PROD
  ? 'https://serenity.fly.dev'
  : 'http://localhost:8000'

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
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

// Cache GET requests for 5 minutes with 1-minute stale revalidation
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (method === 'get') {
    ;(config.headers as Record<string, string>)['Cache-Control'] =
      'public, max-age=300, stale-while-revalidate=60'
  }
  return config
})

// Attach CSRF token for state-changing operations
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 404) console.error('Resource not found')
    if (status === 500) console.error('Server error')
    return Promise.reject(error)
  }
)
