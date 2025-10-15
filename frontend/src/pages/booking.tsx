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
    <section id="booking" className="bg-gradient-warm py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-charcoal mb-4 text-4xl font-bold md:text-5xl">
            {t('booking.title')}
          </h2>
          <p className="text-charcoal/70 text-xl">{t('booking.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-4xl"
        >
          <div className="shadow-elevated border-sage-200/30 rounded-3xl border-2 bg-white p-8 lg:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="font-heading text-charcoal flex items-center gap-2 text-2xl font-semibold">
                  <User className="text-terracotta-400 h-6 w-6" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-charcoal block text-sm font-medium">
                      {t('booking.form.name')} <span className="text-terracotta-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      className="border-sage-200 focus:border-terracotta-300 focus:ring-terracotta-200 w-full rounded-xl border-2 px-4 py-3 transition-all focus:ring-2"
                      placeholder="Jane Doe"
                    />
                    {errors.name && (
                      <p className="text-terracotta-500 text-sm">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-charcoal block text-sm font-medium">
                      {t('booking.form.email')} <span className="text-terracotta-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="text-charcoal/40 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className="border-sage-200 focus:border-terracotta-300 focus:ring-terracotta-200 w-full rounded-xl border-2 py-3 pr-4 pl-11 transition-all focus:ring-2"
                        placeholder="jane@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-terracotta-500 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-charcoal block text-sm font-medium">
                    {t('booking.form.phone')} <span className="text-terracotta-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="text-charcoal/40 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      className="border-sage-200 focus:border-terracotta-300 focus:ring-terracotta-200 w-full rounded-xl border-2 py-3 pr-4 pl-11 transition-all focus:ring-2"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-terracotta-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-6">
                <h3 className="font-heading text-charcoal flex items-center gap-2 text-2xl font-semibold">
                  <Calendar className="text-terracotta-400 h-6 w-6" />
                  Appointment Details
                </h3>

                {/* Service */}
                <div className="space-y-2">
                  <label htmlFor="service" className="text-charcoal block text-sm font-medium">
                    {t('booking.form.service')} <span className="text-terracotta-500">*</span>
                  </label>
                  <select
                    {...register('service')}
                    id="service"
                    className="border-sage-200 focus:border-terracotta-300 focus:ring-terracotta-200 w-full rounded-xl border-2 px-4 py-3 transition-all focus:ring-2"
                  >
                    <option value="">{t('booking.form.service')}</option>
                    <option value="swedish">{t('services.swedish.title')}</option>
                    <option value="deep">{t('services.deep.title')}</option>
                    <option value="therapeutic">{t('services.therapeutic.title')}</option>
                    <option value="prenatal">{t('services.prenatal.title')}</option>
                  </select>
                  {errors.service && (
                    <p className="text-terracotta-500 text-sm">{errors.service.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Date */}
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-charcoal block text-sm font-medium">
                      {t('booking.form.date')} <span className="text-terracotta-500">*</span>
                    </label>
                    <input
                      {...register('date')}
                      type="date"
                      id="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="border-sage-200 focus:border-terracotta-300 focus:ring-terracotta-200 w-full rounded-xl border-2 px-4 py-3 transition-all focus:ring-2"
                    />
                    {errors.date && (
                      <p className="text-terracotta-500 text-sm">{errors.date.message}</p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className="text-charcoal block text-sm font-medium">
                      {t('booking.form.time')} <span className="text-terracotta-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.slice(0, 6).map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setValue('time', time)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-terracotta-400 shadow-warm text-white'
                              : 'bg-sage-100 text-charcoal hover:bg-terracotta-100 hover:border-terracotta-300'
                          } border-2 ${selectedTime === time ? 'border-terracotta-500' : 'border-transparent'} `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <details className="mt-2">
                      <summary className="text-charcoal/70 hover:text-charcoal cursor-pointer text-sm">
                        More times...
                      </summary>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {timeSlots.slice(6).map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setValue('time', time)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                              selectedTime === time
                                ? 'bg-terracotta-400 shadow-warm text-white'
                                : 'bg-sage-100 text-charcoal hover:bg-terracotta-100'
                            } border-2 ${selectedTime === time ? 'border-terracotta-500' : 'border-transparent'} `}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </details>
                    {errors.time && (
                      <p className="text-terracotta-500 text-sm">{errors.time.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label
                  htmlFor="notes"
                  className="text-charcoal block flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="text-charcoal/40 h-4 w-4" />
                  {t('booking.form.notes')}
                </label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={4}
                  className="border-sage-200 focus:border-terracotta-300 focus:ring-terracotta-200 w-full resize-none rounded-xl border-2 px-4 py-3 transition-all focus:ring-2"
                  placeholder="Any special requests or health considerations..."
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner h-5 w-5 border-2" />
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
