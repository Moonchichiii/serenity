import { Layout } from '@/components/layout/Layout'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

const Hero = lazy(() => import('@/pages/hero').then(m => ({ default: m.Hero })))
const About = lazy(() => import('@/pages/about').then(m => ({ default: m.About })))
const Services = lazy(() => import('@/pages/services').then(m => ({ default: m.Services })))
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })))


const ReviewTrigger = lazy(() => import('@/components/ReviewTrigger').then(m => ({ default: m.ReviewTrigger })))

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
      <Contact />
      <ReviewTrigger targetSectionId="testimonials" />
    </>
  )
}

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
})

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([indexRoute]),
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
