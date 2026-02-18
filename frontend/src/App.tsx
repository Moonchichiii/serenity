import { Layout } from '@/components/layout/Layout'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

// ✅ CRITICAL PERFORMANCE FIX:
// Hero is imported statically so it renders immediately (Better LCP).
import { Hero } from '@/features/home/hero'

// ⚡️ LAZY LOAD:
// These are below the fold, so we load them only when needed to save bandwidth.
const About = lazy(() => import('@/features/about/about').then(m => ({ default: m.About })))
const Services = lazy(() => import('@/features/services/services').then(m => ({ default: m.Services })))
const ReviewTrigger = lazy(() => import('@/features/testimonials/components/ReviewTrigger').then(m => ({ default: m.ReviewTrigger })))

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

function HomePage() {
  return (
    <>
      {/* Render Hero immediately */}
      <Hero />

      {/* Suspend the rest of the page until loaded */}
      <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
        <About />
        <Services />
        <ReviewTrigger targetSectionId="testimonials" />
      </Suspense>
    </>
  )
}

// Create the Index Route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const routeTree = rootRoute.addChildren([indexRoute])

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
