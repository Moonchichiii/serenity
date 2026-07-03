import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { ShutterProvider } from '@/components/motion/ShutterTransition'
import { ensureHydratedCMS } from '@/loaders/cms.loader'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    await ensureHydratedCMS(context.queryClient)
  },
  component: () => (
    <ShutterProvider>
      <Layout>
        <Outlet />
      </Layout>
    </ShutterProvider>
  ),
})
