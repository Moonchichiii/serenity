import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { Button } from '@/components/ui/Button'
import { Mail, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'

// Desired form type
type FormData = {
  name: string
  email: string
  phone?: string
  message: string
}

// Schema typed to the form, with empty-string -> undefined for phone
const schema: yup.ObjectSchema<FormData> = yup
  .object({
    name: yup.string().required('Name is required').min(2, 'Name is too short'),
    email: yup.string().required('Email is required').email('Invalid email'),
    phone: yup
      .string()
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
    message: yup.string().required('Message is required').min(10, 'Message is too short'),
  })
  .required()

export default function ContactModal() {
  const { isOpen, close } = useModal()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: yupResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700))
    toast.success('Message sent ✨')
    reset()
    close('contact')
  }

  return (
    <Modal isOpen={isOpen('contact')} onClose={() => close('contact')} title="Contact">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="name">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              id="name"
              {...register('name')}
              className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
              placeholder="Jane Doe"
              aria-invalid={errors.name ? "true" : "false"}
            />
          </div>
          {errors.name && <p className="text-sm text-terracotta-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              id="email"
              {...register('email')}
              type="email"
              className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
              placeholder="jane@example.com"
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>
          {errors.email && <p className="text-sm text-terracotta-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="phone">
            Phone (optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              id="phone"
              {...register('phone')}
              className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
              placeholder="+33 6 00 00 00 00"
              aria-invalid={errors.phone ? "true" : "false"}
            />
          </div>
          {errors.phone && <p className="text-sm text-terracotta-500 mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={4}
            className="w-full px-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 resize-none"
            placeholder="How can we help?"
            aria-invalid={errors.message ? "true" : "false"}
          />
          {errors.message && <p className="text-sm text-terracotta-500 mt-1">{errors.message.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send message'}
        </Button>
      </form>

      <p className="mt-3 text-xs text-charcoal/60">We typically reply within a few hours during business days.</p>
    </Modal>
  )
}
