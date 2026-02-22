import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import {
  Calendar as CalendarIcon,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import { format, parse } from "date-fns";
import { isPastDate } from "@/lib/utils";
import { bookingsAPI } from "@/api/booking";
import { useCMSServices } from "@/lib/cmsSelectors";

import {
  bookingSchema,
  type BookingFormData,
  defaultTimeSlots,
} from "@/types/bookings/bookings";

export function Booking() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const services = useCMSServices();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { date: "", time: "", notes: "" },
  });

  const selectedTime = useWatch({ control, name: "time" });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());

  const ym = useMemo(
    () => ({
      year: activeStartDate.getFullYear(),
      month: activeStartDate.getMonth() + 1,
    }),
    [activeStartDate]
  );

  // --- Busy dates (month view) ---
  const busyQuery = useQuery({
    queryKey: ["calendar", "busy", ym.year, ym.month],
    queryFn: async () => {
      // Adjust to your actual endpoint if bookingsAPI exposes this.
      const res = await fetch(
        `/api/calendar/busy?year=${ym.year}&month=${ym.month}`
      );
      if (!res.ok) throw new Error("Failed to load busy dates");
      const data = (await res.json()) as { busy: string[] };
      return new Set(data?.busy ?? []);
    },
    staleTime: 60_000,
  });

  // --- Available time slots (day view) ---
  const selectedDateIso = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;

  const timesQuery = useQuery({
    queryKey: ["calendar", "slots", selectedDateIso],
    enabled: !!selectedDateIso,
    queryFn: async () => {
      const res = await fetch(`/api/calendar/slots?date=${selectedDateIso}`);
      if (!res.ok) throw new Error("Failed to load slots");
      const data = (await res.json()) as { times: string[] };
      return data?.times?.length ? data.times : [];
    },
    placeholderData: defaultTimeSlots,
  });

  const availableTimes = timesQuery.data ?? defaultTimeSlots;
  const busyDates = busyQuery.data ?? new Set<string>();

  // --- Create booking ---
  const createBooking = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const service = services.find((s) => s.id.toString() === data.service);
      if (!service) throw new Error("Service not found");

      const dateTimeStr = `${data.date}T${data.time}:00`;
      const startDate = parse(
        dateTimeStr,
        "yyyy-MM-dd'T'HH:mm:ss",
        new Date()
      );
      const endDate = new Date(
        startDate.getTime() + service.duration_minutes * 60_000
      );

      const lang = i18n.language as "en" | "fr";

      return bookingsAPI.create({
        service_id: service.id,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone,
        client_notes: data.notes || "",
        preferred_language: lang,
      });
    },
    onSuccess: (booking) => {
      toast.success(
        `${t("booking.form.submit")} 🎉\nConfirmation: ${booking.confirmation_code}`,
        { duration: 6000 }
      );

      reset();
      setSelectedDate(null);

      // Refresh calendar data after creating a booking
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (err) => {
      console.error("Booking error:", err);
      toast.error("Something went wrong. Please try again.");
    },
  });

  const onSubmit: SubmitHandler<BookingFormData> = async (data) => {
    await createBooking.mutateAsync(data);
  };

  const lang = i18n.language as "en" | "fr";
  const timeDisabled = !selectedDate;

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
            {t("booking.title")}
          </h2>
          <p className="text-xl text-charcoal/70">{t("booking.subtitle")}</p>
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t("booking.form.name")}{" "}
                      <span className="text-terracotta-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                      placeholder="Jane Doe"
                    />
                    {errors.name?.message && (
                      <p className="text-sm text-terracotta-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t("booking.form.email")}{" "}
                      <span className="text-terracotta-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                      <input
                        {...register("email")}
                        type="email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                        placeholder="jane@example.com"
                      />
                    </div>
                    {errors.email?.message && (
                      <p className="text-sm text-terracotta-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">
                    {t("booking.form.phone")}{" "}
                    <span className="text-terracotta-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                    <input
                      {...register("phone")}
                      type="tel"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                  {errors.phone?.message && (
                    <p className="text-sm text-terracotta-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-terracotta-400" />
                  Appointment Details
                </h3>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">
                    {t("booking.form.service")}{" "}
                    <span className="text-terracotta-500">*</span>
                  </label>
                  <select
                    {...register("service")}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                  >
                    <option value="">{t("booking.form.service")}</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {lang === "fr" ? service.title_fr : service.title_en} -{" "}
                        {service.duration_minutes} min - €{service.price}
                      </option>
                    ))}
                  </select>
                  {errors.service?.message && (
                    <p className="text-sm text-terracotta-500">
                      {errors.service.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t("booking.form.date")}{" "}
                      <span className="text-terracotta-500">*</span>
                    </label>

                    <input type="hidden" {...register("date")} />

                    <div className="rounded-2xl border-2 border-sage-200 p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-charcoal">
                          <CalendarIcon className="w-5 h-5 text-terracotta-400" />
                          <span className="text-sm font-medium">
                            {selectedDate
                              ? format(selectedDate, "PPP")
                              : t("booking.form.date")}
                          </span>
                        </div>
                        {busyQuery.isFetching && (
                          <span className="text-xs text-charcoal/60 animate-pulse">
                            Loading…
                          </span>
                        )}
                      </div>

                      <Calendar
                        value={selectedDate}
                        onChange={(value) => {
                          const date = Array.isArray(value) ? value[0] : value;
                          setSelectedDate(date);
                          if (date) {
                            setValue("date", format(date, "yyyy-MM-dd"), {
                              shouldValidate: true,
                            });
                            // clear time if user changes date
                            setValue("time", "", { shouldValidate: true });
                          }
                        }}
                        onActiveStartDateChange={({ activeStartDate }) => {
                          if (activeStartDate)
                            setActiveStartDate(activeStartDate);
                        }}
                        tileDisabled={({ date, view }) => {
                          if (view !== "month") return false;
                          const iso = format(date, "yyyy-MM-dd");
                          return isPastDate(date) || busyDates.has(iso);
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

                    {errors.date?.message && (
                      <p className="text-sm text-terracotta-500">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t("booking.form.time")}{" "}
                      <span className="text-terracotta-500">*</span>
                    </label>

                    <input type="hidden" {...register("time")} />

                    <div
                      className={`grid grid-cols-3 gap-2 ${
                        timeDisabled ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {availableTimes.slice(0, 6).map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() =>
                            setValue("time", time, { shouldValidate: true })
                          }
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              selectedTime === time
                                ? "bg-terracotta-400 text-white shadow-warm border-2 border-terracotta-500"
                                : "bg-sage-100 text-charcoal hover:bg-terracotta-100 border-2 border-transparent"
                            }
                          `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <details
                      className={`mt-2 ${
                        timeDisabled ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <summary className="text-sm text-charcoal/70 cursor-pointer hover:text-charcoal">
                        More times...
                      </summary>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableTimes.slice(6).map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() =>
                              setValue("time", time, { shouldValidate: true })
                            }
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all
                              ${
                                selectedTime === time
                                  ? "bg-terracotta-400 text-white shadow-warm border-2 border-terracotta-500"
                                  : "bg-sage-100 text-charcoal hover:bg-terracotta-100 border-2 border-transparent"
                              }
                            `}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </details>

                    {timesQuery.isFetching && !timeDisabled && (
                      <p className="text-xs text-charcoal/60">
                        Loading available times…
                      </p>
                    )}

                    {errors.time?.message && (
                      <p className="text-sm text-terracotta-500">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-charcoal flex items-center gap-2">
                  <FileText className="w-4 h-4 text-charcoal/40" />
                  {t("booking.form.notes")}
                </label>
                <textarea
                  {...register("notes")}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all resize-none"
                  placeholder="Any special requests or health considerations..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || createBooking.isPending}
                className="w-full"
              >
                {isSubmitting || createBooking.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  t("booking.form.submit")
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
