import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import '@/i18n/config'
import '@/styles/index.css'

import { router } from './router'
import { queryClient } from './query-client'
import { ModalProvider } from '@/hooks/useModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function AppProviders() {
  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ModalProvider>
            <RouterProvider router={router} />
          </ModalProvider>

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
                iconTheme: { primary: '#6d9177', secondary: '#f7f6f4' },
              },
              error: {
                iconTheme: { primary: '#e86a47', secondary: '#f7f6f4' },
              },
            }}
          />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}
