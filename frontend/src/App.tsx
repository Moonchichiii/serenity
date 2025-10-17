import { Layout } from '@/components/layout/Layout'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

// Lazy sections
const Hero = lazy(() => import('@/pages/hero').then(m => ({ default: m.Hero })))
const About = lazy(() => import('@/pages/about').then(m => ({ default: m.About })))
const Services = lazy(() => import('@/pages/services').then(m => ({ default: m.Services })))
const Booking = lazy(() => import('@/pages/booking').then(m => ({ default: m.Booking })))
const CmsPage = lazy(() => import('@/pages/cms').then(m => ({ default: m.default })))

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<div className="p-6 text-center text-charcoal/70">Loading…</div>}>
      <Outlet />
    </Suspense>
  ),
})

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

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

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
})

const cmsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/cms',
  component: () => (
    <Suspense fallback={<div className="p-8 text-center">Loading CMS…</div>}>
      <CmsPage />
    </Suspense>
  ),
})

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([indexRoute, cmsRoute]),
])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
