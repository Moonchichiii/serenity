import type { ReactNode } from 'react'
import { Header } from './Header'
import Footer from './Footer'
import { Toaster } from 'react-hot-toast'

// Modals
import ContactModal from '@/components/modals/ContactModal'
import CMSLoginModal from '@/components/modals/CMSLoginModal'
import CorporateModal from '@/components/modals/CorporateModal'
import GiftVoucherModal from '@/components/modals/GiftVoucherModal'

// Components
import { FloatingGiftButton } from '@/components/ui/FloatingGiftButton'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground antialiased selection:bg-terracotta-200 selection:text-charcoal">
      <Toaster position="bottom-center" toastOptions={{ className: 'rounded-xl shadow-warm bg-charcoal text-white' }} />

      <Header />

      <main id="content" role="main" className="flex-1 w-full">
        {children}
      </main>

      <Footer />

      {/* Global Modals */}
      <ContactModal />
      <CorporateModal />
      <CMSLoginModal />
      <GiftVoucherModal />

      {/* Floating Actions */}
      <FloatingGiftButton />
    </div>
  )
}
