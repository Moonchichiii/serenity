import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'

// Import i18n configuration
import '@/i18n/config'

// Import styles
import '@/styles/index.css'

// Import App
import App from './App'

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />

      {/* Toast notifications with warm styling */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#f7f6f4',
            color: '#2e2e2e',
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(46, 46, 46, 0.1)',
            border: '2px solid #dce5df',
          },
          success: {
            iconTheme: {
              primary: '#6d9177',
              secondary: '#f7f6f4',
            },
          },
          error: {
            iconTheme: {
              primary: '#e86a47',
              secondary: '#f7f6f4',
            },
          },
        }}
      />

      {/* Dev tools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
)
