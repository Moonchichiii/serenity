import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
};

const bookingSchema: yup.ObjectSchema<BookingFormData> = yup
  .object({
    name: yup.string().required("Name is required").min(2),
    email: yup.string().required("Email is required").email(),
    phone: yup
      .string()
      .required("Phone is required")
      .matches(/^\+?[0-9\s-]{10,}$/, "Invalid phone number"),
    service: yup.string().required("Please select a service"),
    date: yup.string().required("Please select a date"),
    time: yup.string().required("Please select a time"),
    notes: yup
      .string()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .required();

const defaultTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

export function Booking() {
  const { t, i18n } = useTranslation();

  const services = useCMSServices();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: yupResolver(bookingSchema),
  });

  const selectedTime = watch("time");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStartDate, setActiveStartDate] = useState<Date>(
    new Date()
  );
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());
  const [isBusyLoading, setIsBusyLoading] = useState(false);
  const [availableTimes, setAvailableTimes] =
    useState<string[]>(defaultTimeSlots);

  const ym = useMemo(
    () => ({
      year: activeStartDate.getFullYear(),
      month: activeStartDate.getMonth() + 1,
    }),
    [activeStartDate]
  );

  useEffect(() => {
    setIsBusyLoading(true);
    bookingsAPI
      .getBusyDates(ym.year, ym.month)
      .then((data) => setBusyDates(new Set(data?.busy ?? [])))
      .catch(() => setBusyDates(new Set()))
      .finally(() => setIsBusyLoading(false));
  }, [ym.year, ym.month]);

  useEffect(() => {
    if (!selectedDate) return;

    const iso = format(selectedDate, "yyyy-MM-dd");

    bookingsAPI
      .getSlots(iso)
      .then((data) => {
        setAvailableTimes(data?.times?.length ? data.times : []);
      })
      .catch(() => {
        setAvailableTimes([]);
      });
  }, [selectedDate]);

  const onSubmit: SubmitHandler<BookingFormData> = async (data) => {
    try {
      const service = services.find(
        (s) => s.id.toString() === data.service
      );
      if (!service) {
        toast.error("Service not found");
        return;
      }

      const dateTimeStr = `${data.date}T${data.time}:00`;
      const startDate = parse(
        dateTimeStr,
        "yyyy-MM-dd'T'HH:mm:ss",
        new Date()
      );
      const endDate = new Date(
        startDate.getTime() + service.duration_minutes * 60000
      );

      const start_datetime = startDate.toISOString();
      const end_datetime = endDate.toISOString();
      const lang = i18n.language as "en" | "fr";

      const booking = await bookingsAPI.create({
        service_id: service.id,
        start_datetime,
        end_datetime,
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone,
        client_notes: data.notes || "",
        preferred_language: lang,
      });

      toast.success(
        `${t("booking.form.submit")} 🎉\nConfirmation: ${booking.confirmation_code}`,
        { duration: 6000 }
      );

      reset();
      setSelectedDate(null);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const lang = i18n.language as "en" | "fr";

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
          <p className="text-xl text-charcoal/70">
            {t("booking.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-elevated border-2 border-sage-200/30">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {/* Personal Information Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal flex items-center gap-2">
                  <User className="w-6 h-6 text-terracotta-400" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-charcoal"
                    >
                      {t("booking.form.name")}{" "}
                      <span className="text-terracotta-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                      placeholder="Jane Doe"
                    />
                    {errors.name && (
                      <p className="text-sm text-terracotta-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-charcoal"
                    >
                      {t("booking.form.email")}{" "}
                      <span className="text-terracotta-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                      <input
                        {...register("email")}
                        type="email"
                        id="email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                        placeholder="jane@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-terracotta-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-charcoal"
                  >
                    {t("booking.form.phone")}{" "}
                    <span className="text-terracotta-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                    <input
                      {...register("phone")}
                      type="tel"
                      id="phone"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-terracotta-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-terracotta-400" />
                  Appointment Details
                </h3>

                <div className="space-y-2">
                  <label
                    htmlFor="service"
                    className="block text-sm font-medium text-charcoal"
                  >
                    {t("booking.form.service")}{" "}
                    <span className="text-terracotta-500">*</span>
                  </label>
                  <select
                    {...register("service")}
                    id="service"
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all"
                  >
                    <option value="">
                      {t("booking.form.service")}
                    </option>
                    {services && services.length > 0 ? (
                      services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {lang === "fr"
                            ? service.title_fr
                            : service.title_en}{" "}
                          - {service.duration_minutes} min - €
                          {service.price}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading services...</option>
                    )}
                  </select>
                  {errors.service && (
                    <p className="text-sm text-terracotta-500">
                      {errors.service.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {isBusyLoading && (
                          <span className="text-xs text-charcoal/60 animate-pulse">
                            Loading…
                          </span>
                        )}
                      </div>

                      <Calendar
                        value={selectedDate}
                        onChange={(value) => {
                          const date = Array.isArray(value)
                            ? value[0]
                            : value;
                          setSelectedDate(date);
                          if (date) {
                            setValue(
                              "date",
                              format(date, "yyyy-MM-dd"),
                              {
                                shouldValidate: true,
                              }
                            );
                          }
                        }}
                        onActiveStartDateChange={({
                          activeStartDate,
                        }) => {
                          if (activeStartDate)
                            setActiveStartDate(activeStartDate);
                        }}
                        tileDisabled={({ date }) =>
                          isPastDate(date) ||
                          busyDates.has(format(date, "yyyy-MM-dd"))
                        }
                        tileClassName={({ date }) => {
                          const iso = format(date, "yyyy-MM-dd");
                          if (busyDates.has(iso))
                            return "line-through opacity-40";
                          return "";
                        }}
                        minDate={new Date()}
                        className="w-full border-none"
                      />
                    </div>
                    {errors.date && (
                      <p className="text-sm text-terracotta-500">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      {t("booking.form.time")}{" "}
                      <span className="text-terracotta-500">*</span>
                    </label>

                    <input type="hidden" {...register("time")} />

                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() =>
                              setValue("time", time, {
                                shouldValidate: true,
                              })
                            }
                            className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                              selectedTime === time
                                ? "border-terracotta-400 bg-terracotta-50 text-terracotta-700"
                                : "border-sage-200 hover:border-sage-300 text-charcoal/70"
                            }`}
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <p className="col-span-3 text-sm text-charcoal/50 py-4 text-center">
                          {selectedDate
                            ? t("booking.form.noSlots", {
                                defaultValue:
                                  "No available slots for this date",
                              })
                            : t("booking.form.selectDateFirst", {
                                defaultValue:
                                  "Select a date to see available times",
                              })}
                        </p>
                      )}
                    </div>
                    {errors.time && (
                      <p className="text-sm text-terracotta-500">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-charcoal flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-terracotta-400" />
                  {t("booking.form.notes", {
                    defaultValue: "Additional notes",
                  })}
                </label>
                <textarea
                  {...register("notes")}
                  id="notes"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-200 transition-all resize-none"
                  placeholder={t("booking.form.notesPlaceholder", {
                    defaultValue:
                      "Any special requests or information...",
                  })}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full shadow-warm hover:shadow-elevated transition-all"
              >
                {isSubmitting
                  ? t("booking.form.submitting", {
                      defaultValue: "Booking...",
                    })
                  : t("booking.form.submit")}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
