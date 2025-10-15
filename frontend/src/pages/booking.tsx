import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, User, Mail, Phone, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

// Booking form schema
const bookingSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(/^\+?[0-9\s-]{10,}$/, 'Invalid phone number'),
  service: yup.string().required('Please select a service'),
  date: yup.string().required('Please select a date'),
  time: yup.string().required('Please select a time'),
  notes: yup.string(),
})

type BookingFormData = yup.InferType<typeof bookingSchema>

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
]

export function Booking() {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: yupResolver(bookingSchema),
  })

  const selectedTime = watch('time')

  const onSubmit = async (data: BookingFormData) => {
    try {
      // TODO: Call booking API
      console.log('Booking data:', data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success(t('booking.form.submit'), {
        description: 'We will contact you shortly to confirm your appointment.',
      })

      reset()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <section id="booking" className="py-20 lg:py-32 bg-gradient-warm">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-4">{t('booking.title')}</h2>
          <p className="text-xl text-charcoal/70">{t('booking.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-elevated border-2 border-sage-200/30">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal flex items-center gap-2">
                  <User className="w-6 h-6 text-terracotta-400" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal">
                      {t('booking.form.name')} <span className="text-terracotta-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                      placeholder="Jane Doe"
                    />
                    {errors.name && <p className="text-sm text-terracotta-500">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal">
                      {t('booking.form.email')} <span className="text-terracotta-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                        placeholder="jane@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-terracotta-500">{errors.email.message}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-charcoal">
                    {t('booking.form.phone')} <span className="text-terracotta-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-terracotta-500">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-terracotta-400" />
                  Appointment Details
                </h3>

                {/* Service */}
                <div className="space-y-2">
                  <label htmlFor="service" className="block text-sm font-medium text-charcoal">
                    {t('booking.form.service')} <span className="text-terracotta-500">*</span>
                  </label>
                  <select
                    {...register('service')}
                    id="service"
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                  >
                    <option value="">{t('booking.form.service')}</option>
                    <option value="swedish">{t('services.swedish.title')}</option>
                    <option value="deep">{t('services.deep.title')}</option>
                    <option value="therapeutic">{t('services.therapeutic.title')}</option>
                    <option value="prenatal">{t('services.prenatal.title')}</option>
                  </select>
                  {errors.service && <p className="text-sm text-terracotta-500">{errors.service.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-medium text-charcoal">
                      {t('booking.form.date')} <span className="text-terracotta-500">*</span>
                    </label>
                    <input
                      {...register('date')}
                      type="date"
                      id="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                    />
                    {errors.date && <p className="text-sm text-terracotta-500">{errors.date.message}</p>}
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t('booking.form.time')} <span className="text-terracotta-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.slice(0, 6).map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setValue('time', time)}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              selectedTime === time
                                ? 'bg-terracotta-400 text-white shadow-warm'
                                : 'bg-sage-100 text-charcoal hover:bg-terracotta-100 hover:border-terracotta-300'
                            }
                            border-2 ${selectedTime === time ? 'border-terracotta-500' : 'border-transparent'}
                          `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <details className="mt-2">
                      <summary className="text-sm text-charcoal/70 cursor-pointer hover:text-charcoal">
                        More times...
                      </summary>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {timeSlots.slice(6).map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setValue('time', time)}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all
                              ${
                                selectedTime === time
                                  ? 'bg-terracotta-400 text-white shadow-warm'
                                  : 'bg-sage-100 text-charcoal hover:bg-terracotta-100'
                              }
                              border-2 ${selectedTime === time ? 'border-terracotta-500' : 'border-transparent'}
                            `}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </details>
                    {errors.time && <p className="text-sm text-terracotta-500">{errors.time.message}</p>}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-charcoal flex items-center gap-2">
                  <FileText className="w-4 h-4 text-charcoal/40" />
                  {t('booking.form.notes')}
                </label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all resize-none"
                  placeholder="Any special requests or health considerations..."
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner w-5 h-5 border-2" />
                    Processing...
                  </span>
                ) : (
                  t('booking.form.submit')
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}