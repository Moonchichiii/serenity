import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { Button } from '@/components/ui/Button'
import { Mail, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'

type FormData = {
    name: string
    email: string
    phone: string
    message: string
}

const schema = yup.object({
    name: yup.string().required().min(2),
    email: yup.string().required().email(),
    phone: yup.string().optional(),
    message: yup.string().required().min(10),
})

export default function ContactModal() {
    const { isOpen, close } = useModal()
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
        useForm<FormData>({ resolver: yupResolver(schema) })

    const onSubmit = async () => {
        await new Promise(r => setTimeout(r, 700))
        toast.success('Message sent ✨')
        reset()
        close('contact')
    }

    return (
        <Modal isOpen={isOpen('contact')} onClose={() => close('contact')} title="Contact">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                        <input
                            {...register('name')}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
                            placeholder="Jane Doe"
                        />
                    </div>
                    {errors.name && <p className="text-sm text-terracotta-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
                            placeholder="jane@example.com"
                        />
                    </div>
                    {errors.email && <p className="text-sm text-terracotta-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Phone (optional)</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                        <input
                            {...register('phone')}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200"
                            placeholder="+33 6 00 00 00 00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Message</label>
                    <textarea
                        {...register('message')}
                        rows={4}
                        className="w-full px-3 py-2 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 resize-none"
                        placeholder="How can we help?"
                    />
                    {errors.message && <p className="text-sm text-terracotta-500 mt-1">{errors.message.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : 'Send message'}
                </Button>
            </form>

            <p className="mt-3 text-xs text-charcoal/60">
                We typically reply within a few hours during business days.
            </p>
        </Modal>
    )
}
