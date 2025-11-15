import type { ReactNode } from 'react'
import { Header } from './Header'
import Footer from './Footer'
import { Toaster } from 'react-hot-toast'
import ContactModal from '@/components/modals/ContactModal'
import CMSLoginModal from '@/components/modals/CMSLoginModal'
import CorporateModal from '@/components/modals/CorporateModal'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-center" toastOptions={{ className: 'rounded-xl shadow-warm' }} />
      <Header />
      <main id="content" role="main" className="flex-1">{children}</main>
      <Footer />
      <ContactModal />
        <CorporateModal />
       <CMSLoginModal />
    </div>
  )
}
