// src/api/client.ts
import axios, { type InternalAxiosRequestConfig } from 'axios'

// Use bracket access to satisfy TS index signature rule
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

// Request interceptor — attach CSRF on unsafe methods
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

// Response interceptor — simple logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 404) console.error('Resource not found')
    if (status === 500) console.error('Server error')
    return Promise.reject(error)
  }
)
