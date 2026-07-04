import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import Calendar from "react-calendar";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { HoneypotField } from "@/components/forms/HoneypotField";
import { useModal } from "@/components/modal/useModal";
import { useCMSServices } from "@/hooks/useCMS";
import { useBusyDays, useFreeSlots } from "@/hooks/useCalendar";
import {
  apiErrorMessage,
  parseApiErrors,
  splitFieldErrors,
} from "@/lib/apiErrors";
import { isPastDate } from "@/lib/utils";
import { useCreateCheckoutMutation } from "@/queries/payments.mutations";
import type { CheckoutRequest } from "@/types/api/checkout";
import {
  createBookingSchema,
  type BookingFormValues,
} from "@/types/forms/booking";

import "react-calendar/dist/Calendar.css";

/**
 * BookingForm — "Réserver une séance" (kind: "booking").
 *
 * Book a massage for yourself: treatment + REQUIRED date & time slot
 * (same availability hooks the gift flow uses) + your details, then
 * straight to Stripe. Fulfillment lands as a Booking row + Google
 * Calendar event + confirmation email (Drop 15 backend).
 */
export function BookingForm() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const { getPayload } = useModal();
  const services = useCMSServices() ?? [];
  const checkout = useCreateCheckoutMutation();

  const preselected = getPayload("booking")?.serviceId;

  const schema = useMemo(() => createBookingSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: preselected },
  });

  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());

  const [serviceId, selectedDate, selectedTime] = useWatch({
    control,
    name: ["serviceId", "selectedDate", "selectedTime"],
  });

  const service = services.find((s) => s.id === serviceId);

  const ym = useMemo(
    () => ({
      year: activeStartDate.getFullYear(),
      month: activeStartDate.getMonth() + 1,
    }),
    [activeStartDate],
  );
  const { data: busyData } = useBusyDays(ym.year, ym.month);
  const busyDates = useMemo(() => new Set(busyData?.busy ?? []), [busyData]);

  const { data: slotsData, isFetching: slotsFetching } = useFreeSlots(
    selectedDate ?? "",
  );
  const availableTimes = slotsData?.times ?? [];

  useEffect(() => {
    if (preselected) setValue("serviceId", preselected);
  }, [preselected, setValue]);

  const onSubmit = async (data: BookingFormValues) => {
    const chosen = services.find((s) => s.id === data.serviceId);
    const start = new Date(`${data.selectedDate}T${data.selectedTime}:00`);
    const end = new Date(
      start.getTime() + (chosen?.duration_minutes ?? 60) * 60_000,
    );

    const payload: CheckoutRequest = {
      kind: "booking",
      sender_name: data.name,
      sender_email: data.email,
      preferred_language: lang,
      amount: Number(
        String(chosen?.price ?? 0).replace(/[^0-9.]/g, ""),
      ),
      message: data.notes?.trim() || "",
      website: data.website ?? "",
      service_id: data.serviceId,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
    };

    try {
      const res = await checkout.mutateAsync(payload);
      window.location.assign(res.url);
    } catch (err) {
      const backendToRhf = {
        sender_name: "name",
        sender_email: "email",
        service_id: "serviceId",
        start_datetime: "selectedDate",
        end_datetime: "selectedTime",
        message: "notes",
      } as const;
      const parsed = parseApiErrors(err).map((entry) => ({
        ...entry,
        field:
          entry.field && entry.field in backendToRhf
            ? backendToRhf[entry.field as keyof typeof backendToRhf]
            : entry.field,
      }));
      const { fieldErrors, rest } = splitFieldErrors(parsed, [
        "name",
        "email",
        "serviceId",
        "selectedDate",
        "selectedTime",
        "notes",
      ] as const);
      for (const entry of fieldErrors) {
        setError(entry.field, {
          type: "server",
          message: apiErrorMessage(t, entry),
        });
      }
      const toastEntry = rest[0];
      if (toastEntry) toast.error(apiErrorMessage(t, toastEntry));
      else if (fieldErrors.length === 0)
        toast.error(t("formErrors.byCode.unknown"));
    }
  };

  const inputBase =
    "w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 transition-colors focus:border-sage-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";
  const labelBase = "mb-2 block text-sm font-medium text-charcoal";
  const errorText = "mt-1 text-xs text-terracotta-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* ── Treatment ── */}
      <div>
        <label htmlFor="bookingService" className={labelBase}>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-sage-500" aria-hidden="true" />
            {t("booking.form.service", "Treatment")}
          </span>
        </label>
        <select
          id="bookingService"
          value={serviceId ?? ""}
          aria-invalid={!!errors.serviceId}
          aria-describedby={errors.serviceId ? "serviceId-error" : undefined}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : undefined;
            setValue("serviceId", id as number, { shouldValidate: true });
            setValue("selectedDate", "");
            setValue("selectedTime", "");
            setSelectedDateObj(null);
          }}
          className={`${inputBase} appearance-none py-4 font-medium text-sage-900`}
        >
          <option value="">
            {t("gift.form.chooseService", "Choose a treatment...")}
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {lang === "fr" ? s.title_fr : s.title_en} — €{s.price}
            </option>
          ))}
        </select>
        {errors.serviceId && (
          <p id="serviceId-error" className={errorText}>
            {errors.serviceId.message}
          </p>
        )}
      </div>

      {/* ── Date & time (required) ── */}
      {serviceId ? (
        <div className="animate-slide-up">
          <div className="mb-4 flex items-center gap-2">
            <CalendarIcon
              className="h-4 w-4 text-sage-500"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-charcoal">
              {t("booking.schedule", "Choose date & time")}
            </span>
          </div>

          <div className="rounded-2xl border border-warm-grey-200 bg-white p-4">
            <Calendar
              value={selectedDateObj}
              onChange={(value) => {
                const date = Array.isArray(value) ? value[0] : value;
                setSelectedDateObj(date);
                if (date) {
                  setValue("selectedDate", format(date, "yyyy-MM-dd"), {
                    shouldValidate: true,
                  });
                  setValue("selectedTime", "");
                }
              }}
              onActiveStartDateChange={({ activeStartDate: d }) =>
                d && setActiveStartDate(d)
              }
              tileDisabled={({ date, view }) => {
                if (view !== "month") return false;
                return (
                  isPastDate(date) ||
                  busyDates.has(format(date, "yyyy-MM-dd"))
                );
              }}
              calendarType="iso8601"
              prev2Label={null}
              next2Label={null}
            />

            {selectedDate && (
              <div className="animate-fade-in mt-6 border-t border-warm-grey-100 pt-4">
                <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-charcoal/40">
                  {t("gift.form.availableTimes", "Available Times")}
                </span>
                {slotsFetching ? (
                  <div className="flex gap-2">
                    <div className="h-8 w-16 animate-pulse rounded bg-sand-100" />
                    <div className="h-8 w-16 animate-pulse rounded bg-sand-100" />
                  </div>
                ) : availableTimes.length === 0 ? (
                  <p className="text-xs italic text-charcoal/50">
                    {t("gift.form.noSlots", "No slots available.")}
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={checkout.isPending}
                        onClick={() =>
                          setValue("selectedTime", time, {
                            shouldValidate: true,
                          })
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          selectedTime === time
                            ? "bg-sage-deep text-white shadow-md ring-2 ring-sage-400/30"
                            : "border border-warm-grey-200/50 bg-sand-50 text-charcoal hover:bg-sage-100"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {(errors.selectedDate || errors.selectedTime) && (
            <p className={errorText}>
              {errors.selectedDate?.message ?? errors.selectedTime?.message}
            </p>
          )}
        </div>
      ) : null}

      {/* ── Your details ── */}
      <div className="h-px w-full bg-warm-grey-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bookingName" className={labelBase}>
            {t("booking.form.name", "Your name")}
          </label>
          <input
            id="bookingName"
            type="text"
            maxLength={100}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputBase}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className={errorText}>
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="bookingEmail" className={labelBase}>
            {t("booking.form.email", "Your email")}
          </label>
          <input
            id="bookingEmail"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputBase}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className={errorText}>
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="bookingNotes" className={labelBase}>
          {t("booking.form.notes", "Special requests")}{" "}
          <span className="text-charcoal/50">
            {t("contact.form.optional", "(optional)")}
          </span>
        </label>
        <textarea
          id="bookingNotes"
          rows={3}
          maxLength={500}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? "notes-error" : undefined}
          className={`${inputBase} resize-none`}
          {...register("notes")}
        />
        {errors.notes && (
          <p id="notes-error" className={errorText}>
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* ── Total + submit ── */}
      {service && (
        <div className="flex items-center justify-between rounded-xl border border-sage-100 bg-sage-50/60 px-4 py-3">
          <span className="text-sm font-medium text-charcoal">
            {t("gift.form.total", "Total")}
          </span>
          <span className="font-heading text-xl text-sage-900">
            €{service.price}
          </span>
        </div>
      )}

      <HoneypotField {...register("website")} />

      <button
        type="submit"
        disabled={checkout.isPending}
        className="btn-accent w-full rounded-full py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {checkout.isPending
          ? t("gift.form.sending", "Processing...")
          : t("booking.form.submit", "Book & pay")}
      </button>
      <p className="text-center text-xs text-charcoal/60">
        {t("gift.form.poweredByStripe", "Secure checkout with Stripe")}
      </p>
    </form>
  );
}
