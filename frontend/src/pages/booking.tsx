import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from '@/components/ui/Button'
import { Calendar as CalendarIcon, User, Mail, Phone, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Calendar from 'react-calendar'
import { format } from 'date-fns'
import { isPastDate } from '@/lib/utils'
import { cmsAPI, type WagtailService } from '@/api/cms'

// --- Validation schema ---
const bookingSchema = yup.object({
  name: yup.string().required('Name is required').min(2),
  email: yup.string().required('Email is required').email(),
  phone: yup.string().required('Phone is required').matches(/^\+?[0-9\s-]{10,}$/, 'Invalid phone number'),
  service: yup.string().required('Please select a service'),
  date: yup.string().required('Please select a date'),
  time: yup.string().required('Please select a time'),
  notes: yup.string().optional(),
})

type BookingFormData = yup.InferType<typeof bookingSchema>

// Fallback times until backend returns real ones
const defaultTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00',
]

export function Booking() {
  const { t, i18n } = useTranslation()

  // CMS Services state
  const [services, setServices] = useState<WagtailService[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: yupResolver(bookingSchema),
    defaultValues: { date: '', time: '', notes: '' },
  })

  const selectedTime = watch('time')

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date())
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set())
  const [isBusyLoading, setIsBusyLoading] = useState(false)

  const ym = useMemo(
    () => ({
      year: activeStartDate.getFullYear(),
      month: activeStartDate.getMonth() + 1,
    }),
    [activeStartDate]
  )

  // Fetch CMS services
  useEffect(() => {
    cmsAPI
      .getServices()
      .then(setServices)
      .catch(() => {
        console.log('CMS services not ready, using fallback')
        setServices([])
      })
  }, [])

  useEffect(() => {
    setIsBusyLoading(true)
    // Backend returns: { busy: ["YYYY-MM-DD", ...] }
    fetch(`/api/calendar/busy?year=${ym.year}&month=${ym.month}`)
      .then((r) => r.json())
      .then((data: { busy: string[] }) => setBusyDates(new Set(data?.busy ?? [])))
      .catch(() => setBusyDates(new Set()))
      .finally(() => setIsBusyLoading(false))
  }, [ym.year, ym.month])

  const [availableTimes, setAvailableTimes] = useState<string[]>(defaultTimeSlots)

  useEffect(() => {
    if (!selectedDate) return
    const iso = format(selectedDate, 'yyyy-MM-dd')
    // Backend returns: { times: ["HH:mm", ...] }
    fetch(`/api/calendar/slots?date=${iso}`)
      .then((r) => r.json())
      .then((data: { times: string[] }) => {
        setAvailableTimes(data?.times?.length ? data.times : [])
      })
      .catch(() => setAvailableTimes([]))
  }, [selectedDate])

  const onSubmit: SubmitHandler<BookingFormData> = async (data) => {
    try {
      // TODO: when bookings API is ready, post to /api/bookings/
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(t('booking.form.submit'), { icon: '✨' })
      reset()
      setSelectedDate(null)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const lang = i18n.language as 'en' | 'fr'

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
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-4">
            {t('booking.title')}
          </h2>
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
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal flex items-center gap-2">
                  <User className="w-6 h-6 text-terracotta-400" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-terracotta-400" />
                  Appointment Details
                </h3>

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
                    {services.length > 0 ? (
                      // CMS Services
                      services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {lang === 'fr' ? service.title_fr : service.title_en} - {service.duration_minutes} min - €
                          {service.price}
                        </option>
                      ))
                    ) : (
                      // Fallback to i18n
                      <>
                        <option value="swedish">{t('services.swedish.title')}</option>
                        <option value="deep">{t('services.deep.title')}</option>
                        <option value="therapeutic">{t('services.therapeutic.title')}</option>
                        <option value="prenatal">{t('services.prenatal.title')}</option>
                      </>
                    )}
                  </select>
                  {errors.service && <p className="text-sm text-terracotta-500">{errors.service.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t('booking.form.date')} <span className="text-terracotta-500">*</span>
                    </label>

                    <input type="hidden" {...register('date')} />

                    <div className="rounded-2xl border-2 border-sage-200 p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-charcoal">
                          <CalendarIcon className="w-5 h-5 text-terracotta-400" />
                          <span className="text-sm font-medium">
                            {selectedDate ? format(selectedDate, 'PPP') : t('booking.form.date')}
                          </span>
                        </div>
                        {isBusyLoading && (
                          <span className="text-xs text-charcoal/60 animate-pulse">Loading…</span>
                        )}
                      </div>

                      <Calendar
                        value={selectedDate}
                        onChange={(value) => {
                          const date = Array.isArray(value) ? value[0] : value
                          setSelectedDate(date)
                          if (date) {
                            setValue('date', format(date, 'yyyy-MM-dd'), { shouldValidate: true })
                          }
                        }}
                        onActiveStartDateChange={({ activeStartDate }) => {
                          if (activeStartDate) setActiveStartDate(activeStartDate)
                        }}
                        tileDisabled={({ date, view }) => {
                          if (view !== 'month') return false
                          const iso = format(date, 'yyyy-MM-dd')
                          return isPastDate(date) || busyDates.has(iso)
                        }}
                        calendarType="iso8601"
                        className="!w-full
                          [&_.react-calendar__tile]:rounded-lg
                          [&_.react-calendar__tile]:!text-charcoal
                          [&_.react-calendar__tile]:hover:!bg-terracotta-100
                          [&_.react-calendar__tile--active]:!bg-terracotta-400
                          [&_.react-calendar__tile--active]:!text-white
                          [&_.react-calendar__tile--now]:!bg-terracotta-100
                          [&_.react-calendar__navigation__label]:!text-charcoal
                          [&_.react-calendar__month-view__weekdays]:!text-charcoal/60
                          [&_.react-calendar__tile--disabled]:!text-charcoal/30
                          [&_.react-calendar__tile--disabled]:!bg-sand-100"
                      />
                    </div>

                    {errors.date && <p className="text-sm text-terracotta-500">{errors.date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t('booking.form.time')} <span className="text-terracotta-500">*</span>
                    </label>
                    <input type="hidden" {...register('time')} />
                    <div className={`grid grid-cols-3 gap-2 ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
                      {availableTimes.slice(0, 6).map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setValue('time', time, { shouldValidate: true })}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              selectedTime === time
                                ? 'bg-terracotta-400 text-white shadow-warm border-2 border-terracotta-500'
                                : 'bg-sage-100 text-charcoal hover:bg-terracotta-100 border-2 border-transparent'
                            }
                          `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <details className={`mt-2 ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
                      <summary className="text-sm text-charcoal/70 cursor-pointer hover:text-charcoal">
                        More times...
                      </summary>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableTimes.slice(6).map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setValue('time', time, { shouldValidate: true })}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all
                              ${
                                selectedTime === time
                                  ? 'bg-terracotta-400 text-white shadow-warm border-2 border-terracotta-500'
                                  : 'bg-sage-100 text-charcoal hover:bg-terracotta-100 border-2 border-transparent'
                              }
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
