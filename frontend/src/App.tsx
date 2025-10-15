import { Layout } from '@/components/layout/Layout'
import { About } from '@/pages/about'
import { Booking } from '@/pages/booking'
import { Hero } from '@/pages/hero'
import { Services } from '@/pages/services'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactElement } from 'react'

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Main layout route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

// Home page route (all sections in one page)
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
})

// Home page component (single page with all sections)
function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Booking />
    </>
  )
}

// Build route tree
const routeTree = rootRoute.addChildren([layoutRoute.addChildren([indexRoute])])

// Create router
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Type registration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App(): ReactElement {
  return <RouterProvider router={router} />
}

export default App
