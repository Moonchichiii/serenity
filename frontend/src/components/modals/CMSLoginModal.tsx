// src/components/modals/CMSLoginModal.tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal } from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { Button } from '@/components/ui/Button'
import { Mail, Lock } from 'lucide-react'
import { apiClient } from '@/api/client'
import toast from 'react-hot-toast'

type FormData = { email: string; password: string }

const schema = yup.object({
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
})

function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift()
}

export default function CMSLoginModal() {
  const { isOpen, close } = useModal()
  const open = isOpen('cmsLogin')

  const [me, setMe] = useState<{
    isAuthenticated: boolean
    isStaff?: boolean
    username?: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: yupResolver(schema) })

  // Fetch CSRF + session state when opened
  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        await apiClient.get('/api/auth/csrf/')
        const r = await apiClient.get('/api/auth/me/')
        setMe(r.data)
      } catch {
        setMe({ isAuthenticated: false })
      }
    })()
  }, [open])

  const onSubmit = async (data: FormData) => {
    try {
      const csrftoken = getCookie('csrftoken') || ''
      await apiClient.post(
        '/api/auth/login/',
        { username: data.email, password: data.password }, // backend accepts username or email
        { headers: { 'X-CSRFToken': csrftoken } }
      )
      const r = await apiClient.get('/api/auth/me/')
      setMe(r.data)
      toast.success('Connected')
      reset({ email: data.email, password: '' })
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed'
      toast.error(msg)
    }
  }

  const onLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout/')
      setMe({ isAuthenticated: false })
      toast.success('Logged out')
    } catch {
      /* no-op */
    }
  }

  return (
    <Modal isOpen={open} onClose={() => close('cmsLogin')} title="CMS Login">
      {me?.isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-charcoal/80">
            Signed in as <strong>{me.username}</strong>
            {me.isStaff ? ' (staff)' : null}
          </p>
          <div className="flex items-center gap-3">
            <a href="/cms-admin/" className="inline-block">
              <Button>Open CMS</Button>
            </a>
            <Button variant="outline" onClick={onLogout}>
              Log out
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                {...register('email')}
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
              />
            </div>
            {errors.email && <p className="text-sm text-terracotta-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-terracotta-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="text-xs text-charcoal/60">Staff only. Uses your Wagtail/Django credentials.</p>
        </form>
      )}
    </Modal>
  )
}
