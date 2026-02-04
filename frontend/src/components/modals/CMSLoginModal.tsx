import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal } from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { Button } from '@/components/ui/Button'
import { User, Lock } from 'lucide-react'
import { apiClient, API_URL } from '@/api/client'
import toast from 'react-hot-toast'

type FormData = { username: string; password: string }

const schema = yup.object({
  username: yup.string().required('Username is required').min(2, 'Minimum 2 characters'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
})

export default function CMSLoginModal() {
  const { isOpen, close } = useModal()
  const open = isOpen('cmsLogin')

  const [csrfToken, setCsrfToken] = useState<string | null>(null)
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

  useEffect(() => {
    if (!open) return

    const fetchSessionData = async () => {
      try {
        const csrfRes = await apiClient.get('/api/auth/csrf/')
        setCsrfToken(csrfRes.data?.csrfToken || null)

        const meRes = await apiClient.get('/api/auth/me/')
        setMe(meRes.data)
      } catch {
        setMe({ isAuthenticated: false })
      }
    }

    fetchSessionData()
  }, [open])

  const onSubmit = async (data: FormData) => {
    try {
      if (!csrfToken) {
        const csrfRes = await apiClient.get('/api/auth/csrf/')
        setCsrfToken(csrfRes.data?.csrfToken || null)
      }

      await apiClient.post(
        '/api/auth/login/',
        { username: data.username, password: data.password },
        { headers: { 'X-CSRFToken': csrfToken || '' } }
      )

      const r = await apiClient.get('/api/auth/me/')
      setMe(r.data)
      toast.success('Connected successfully')
      reset({ username: data.username, password: '' })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      const msg = error?.response?.data?.detail || 'Login failed'
      toast.error(msg)
    }
  }

  const onLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout/')
      setMe({ isAuthenticated: false })
      toast.success('Logged out')
    } catch {
      // Silent fail
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
            <a
              href={`${API_URL}/cms-admin/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
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
            <label className="block text-sm font-medium text-charcoal mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                {...register('username')}
                type="text"
                autoComplete="username"
                placeholder="your-username"
                className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
              />
            </div>
            {errors.username && <p className="text-sm text-terracotta-500 mt-1">{errors.username.message}</p>}
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

          <p className="text-xs text-charcoal/60">Staff only. Use your Wagtail admin username.</p>
        </form>
      )}
    </Modal>
  )
}
