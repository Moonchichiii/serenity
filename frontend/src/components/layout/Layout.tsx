import type { ReactNode } from 'react'
import { Header } from './Header'
import Footer from './Footer'
import { Toaster } from 'react-hot-toast'
import ContactModal from '@/components/modals/ContactModal'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-center" toastOptions={{ className: 'rounded-xl shadow-warm' }} />
      <Header />
      <main id="content" role="main" className="flex-1">{children}</main>
      <Footer />
      <ContactModal /> {/* mounted once here */}
    </div>
  )
}
