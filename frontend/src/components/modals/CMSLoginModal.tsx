import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'
import { Button } from '@/components/ui/Button'
import { User, Lock } from 'lucide-react'
import { apiClient, API_URL } from '@/api/client'
import toast from 'react-hot-toast'

const schema = z.object({
  username: z
    .string()
    .min(2, { message: 'Minimum 2 characters' })
    .min(1, { message: 'Username is required' }),
  password: z
    .string()
    .min(6, { message: 'Minimum 6 characters' })
    .min(1, { message: 'Password is required' }),
})

type FormData = z.infer<typeof schema>

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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

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
      let token = csrfToken
      if (!token) {
        const csrfRes = await apiClient.get('/api/auth/csrf/')
        token = csrfRes.data?.csrfToken || null
        setCsrfToken(token)
      }

      await apiClient.post(
        '/api/auth/login/',
        { username: data.username, password: data.password },
        { headers: { 'X-CSRFToken': token || '' } }
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
            {errors.username?.message && (
              <p className="text-sm text-terracotta-500 mt-1">{errors.username.message}</p>
            )}
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
            {errors.password?.message && (
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
