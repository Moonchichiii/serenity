import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Layout } from '@/components/layout/Layout'
import { ensureHydratedCMS } from '@/lib/cmsQuery'

export const Route = createRootRoute({
  loader: async ({ context }) => {
    await ensureHydratedCMS(context.queryClient)
  },
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})
