import type { ReactNode } from 'react'
import { Header } from './Header'
import Footer from './Footer'
import { FloatingGiftButton } from '@/components/ui/FloatingGiftButton'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground antialiased selection:bg-terracotta-200 selection:text-charcoal">
      <Header />

      <main id="content" role="main" className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      {/* Floating Actions */}
      <FloatingGiftButton />
    </div>
  )
}
