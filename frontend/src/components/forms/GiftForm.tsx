import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Calendar as CalendarIcon,
  Gift,
  Mail,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import Calendar from "react-calendar";
import { format } from "date-fns";

import { Button } from "@/components/ui/Button";
import type { GlobalSettings } from "@/types/api";
import {
  createGiftSchema,
  type GiftFormValues,
} from "@/types/forms/gift";
import { useCreateCheckoutMutation } from "@/queries/payments.mutations";
import { useBusyDays, useFreeSlots } from "@/hooks/useCalendar";
import { useCMSServices } from "@/hooks/useCMS";
import { isPastDate } from "@/lib/utils";
import { normalizeHttpError } from "@/api/httpError";
import type { CheckoutRequest } from "@/types/api/payments";

interface GiftFormProps {
  settings?: GlobalSettings["gift"] | null;
}

export function GiftForm({ settings }: GiftFormProps) {
  const { t, i18n } = useTranslation();
  const [wantsBooking, setWantsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    null,
  );
  const [activeStartDate, setActiveStartDate] = useState(
    new Date(),
  );

  const lang: "en" | "fr" = i18n.language.startsWith("fr")
    ? "fr"
    : "en";
  const schema = useMemo<ReturnType<typeof createGiftSchema>>(
    () => createGiftSchema(t),
    [t],
  );
  const services = useCMSServices();
  const checkout = useCreateCheckoutMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<GiftFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: "",
    },
  });

  // Single useWatch — RHF is the source of truth for validation
  const [selectedTime, selectedServiceId, selectedDateField] =
    useWatch({
      control,
      name: ["selectedTime", "serviceId", "selectedDate"],
    });

  const bookingComplete =
    !wantsBooking ||
    (selectedServiceId != null &&
      Boolean(selectedDateField) &&
      Boolean(selectedTime));

  // Calendar data
  const ym = useMemo(
    () => ({
      year: activeStartDate.getFullYear(),
      month: activeStartDate.getMonth() + 1,
    }),
    [activeStartDate],
  );

  const { data: busyData, isFetching: busyFetching } = useBusyDays(
    ym.year,
    ym.month,
  );
  const busyDates = useMemo(
    () => new Set(busyData?.busy ?? []),
    [busyData],
  );

  const selectedDateIso = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";
  const { data: slotsData, isFetching: slotsFetching } =
    useFreeSlots(selectedDateIso);
  const availableTimes = slotsData?.times ?? [];

  // CMS helpers
  const fromCms = (
    enValue: string | undefined,
    frValue: string | undefined,
    i18nKey: string,
    defaultValue?: string,
  ) => {
    const cmsValue = lang === "fr" ? frValue : enValue;
    if (cmsValue && cmsValue.trim().length > 0) return cmsValue;
    return defaultValue !== undefined
      ? t(i18nKey, defaultValue)
      : t(i18nKey);
  };

  const submitLabel = fromCms(
    settings?.form_submit_label_en,
    settings?.form_submit_label_fr,
    "gift.form.submit",
  );
  const sendingLabel = fromCms(
    settings?.form_sending_label_en,
    settings?.form_sending_label_fr,
    "gift.form.sending",
  );
  const messagePlaceholder = fromCms(
    settings?.form_message_placeholder_en,
    settings?.form_message_placeholder_fr,
    "gift.form.messagePlaceholder",
  );

  const onSubmit = async (data: GiftFormValues) => {
    if (!bookingComplete) {
      toast.error(
        t(
          "gift.form.incompleteBooking",
          "Please complete the booking or uncheck the option.",
        ),
      );
      return;
    }

    let start_datetime: string | undefined;
    let end_datetime: string | undefined;
    let service_id: number | undefined;

    if (
      wantsBooking &&
      data.serviceId != null &&
      data.selectedDate &&
      data.selectedTime
    ) {
      const service = services.find(
        (s) => s.id === data.serviceId,
      );
      const start = new Date(
        `${data.selectedDate}T${data.selectedTime}:00`,
      );
      const end = new Date(
        start.getTime() +
          (service?.duration_minutes ?? 60) * 60_000,
      );
      start_datetime = start.toISOString();
      end_datetime = end.toISOString();
      service_id = data.serviceId;
    }

    const hasSlot =
      typeof service_id === "number" &&
      typeof start_datetime === "string" &&
      typeof end_datetime === "string";

    const payload: CheckoutRequest = {
      sender_name: data.senderName,
      sender_email: data.senderEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message || "",
      amount: data.amount,
      preferred_language: lang,
      ...(hasSlot
        ? { service_id, start_datetime, end_datetime }
        : {}),
    };

    try {
      const res = await checkout.mutateAsync(payload);

      reset();
      setSelectedDate(null);
      setWantsBooking(false);

      window.location.assign(res.url);
    } catch (err) {
      const apiErr = normalizeHttpError(err);

      if (apiErr.status === 429) {
        toast.error(
          t(
            "gift.form.rateLimited",
            "Too many attempts. Please try later.",
          ),
        );
        return;
      }

      toast.error(
        apiErr.message ||
          t("gift.form.error", "Something went wrong."),
      );
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 rounded-xl border-2 border-sage-200 " +
    "focus:border-sage-400 focus:ring-2 focus:ring-sage-200 " +
    "transition-colors text-base text-charcoal bg-white";
  const labelClass =
    "block text-sm font-medium text-charcoal mb-1.5";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 sm:space-y-5"
    >
      {/* ── Sender section ── */}
      <div className="bg-sage-50/50 p-4 rounded-2xl space-y-3 border border-sage-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 flex items-center gap-2">
          <User className="w-3.5 h-3.5" />
          {t("gift.form.purchaserSection")}
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelClass}>
              {t("gift.form.purchaserName")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="text"
                {...register("senderName")}
                className={inputClass}
                placeholder={t(
                  "gift.form.purchaserNamePlaceholder",
                )}
              />
            </div>
            {errors.senderName && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.senderName.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              {t("gift.form.purchaserEmail")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="email"
                {...register("senderEmail")}
                className={inputClass}
                placeholder={t(
                  "gift.form.purchaserEmailPlaceholder",
                )}
              />
            </div>
            {errors.senderEmail && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.senderEmail.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Recipient section ── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 flex items-center gap-2 px-1">
          <Gift className="w-3.5 h-3.5" />
          {t("gift.form.recipientSection")}
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelClass}>
              {t("gift.form.recipientName")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="text"
                {...register("recipientName")}
                className={inputClass}
                placeholder={t(
                  "gift.form.recipientNamePlaceholder",
                )}
              />
            </div>
            {errors.recipientName && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.recipientName.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              {t("gift.form.recipientEmail")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="email"
                {...register("recipientEmail")}
                className={inputClass}
                placeholder={t(
                  "gift.form.recipientEmailPlaceholder",
                )}
              />
            </div>
            {errors.recipientEmail && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.recipientEmail.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            {t("gift.form.message")}
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-charcoal/40" />
            <textarea
              {...register("message")}
              rows={3}
              className={`${inputClass} resize-none py-3`}
              placeholder={messagePlaceholder}
            />
          </div>
        </div>
      </div>

      {/* ── Amount ── */}
      <div>
        <label className={labelClass} htmlFor="gift-amount">
          {t("gift.form.amount", "Amount")}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50 text-base font-medium">
            €
          </span>
          <input
            id="gift-amount"
            type="number"
            inputMode="decimal"
            step="1"
            min={1}
            {...register("amount", { valueAsNumber: true })}
            className={
              "w-full pl-10 pr-4 py-3 rounded-xl border-2 " +
              "border-sage-200 focus:border-sage-400 " +
              "focus:ring-2 focus:ring-sage-200 " +
              "transition-colors text-base text-charcoal bg-white"
            }
            placeholder={t(
              "gift.form.amountPlaceholder",
              "e.g. 50",
            )}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-terracotta-500 mt-1">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* ── Optional booking section ── */}
      <div className="border border-sage-200 rounded-2xl p-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wantsBooking}
            disabled={checkout.isPending}
            onChange={(e) => {
              setWantsBooking(e.target.checked);
              if (!e.target.checked) {
                setValue("serviceId", undefined);
                setValue("selectedDate", undefined);
                setValue("selectedTime", undefined);
                setSelectedDate(null);
              }
            }}
            className="w-4 h-4 rounded border-sage-300 text-terracotta-400 focus:ring-terracotta-300"
          />
          <span className="text-sm font-medium text-charcoal flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-terracotta-400" />
            {t(
              "gift.form.bookSlot",
              "Book an appointment slot now",
            )}
          </span>
        </label>

        {wantsBooking && (
          <div className="space-y-4 animate-fade-in">
            {/* Service picker */}
            <div>
              <label
                className={labelClass}
                htmlFor="gift-service"
              >
                {t("gift.form.service", "Service")}
              </label>
              <select
                id="gift-service"
                disabled={checkout.isPending}
                value={selectedServiceId ?? ""}
                onChange={(e) => {
                  const id = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  setValue("serviceId", id);
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors text-base text-charcoal bg-white"
              >
                <option value="">
                  {t(
                    "gift.form.selectService",
                    "Select a service",
                  )}
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === "fr" ? s.title_fr : s.title_en} -{" "}
                    {s.duration_minutes} min - €{s.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Calendar */}
            <div className="rounded-2xl border-2 border-sage-200 p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-charcoal">
                  <CalendarIcon className="w-5 h-5 text-terracotta-400" />
                  <span className="text-sm font-medium">
                    {selectedDate
                      ? format(selectedDate, "PPP")
                      : t(
                          "gift.form.pickDate",
                          "Pick a date",
                        )}
                  </span>
                </div>
                {busyFetching && (
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
                      "selectedDate",
                      format(date, "yyyy-MM-dd"),
                    );
                    setValue("selectedTime", undefined);
                  }
                }}
                onActiveStartDateChange={({
                  activeStartDate: d,
                }) => {
                  if (d) setActiveStartDate(d);
                }}
                tileDisabled={({ date, view }) => {
                  if (view !== "month") return false;
                  const iso = format(date, "yyyy-MM-dd");
                  return (
                    isPastDate(date) || busyDates.has(iso)
                  );
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

            {/* Time slots */}
            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                  <Clock className="w-4 h-4 text-terracotta-400" />
                  {t("gift.form.pickTime", "Pick a time")}
                </label>

                {slotsFetching ? (
                  <p className="text-xs text-charcoal/60 animate-pulse">
                    Loading slots…
                  </p>
                ) : availableTimes.length === 0 ? (
                  <p className="text-sm text-charcoal/50">
                    {t(
                      "gift.form.noSlots",
                      "No slots available on this date.",
                    )}
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={checkout.isPending}
                        onClick={() =>
                          setValue("selectedTime", time)
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? "bg-terracotta-400 text-white shadow-warm border-2 border-terracotta-500"
                            : "bg-sage-100 text-charcoal hover:bg-terracotta-100 border-2 border-transparent"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-charcoal/70">
        {t("gift.paymentNotice")}
      </p>

      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={checkout.isPending || !bookingComplete}
      >
        {checkout.isPending ? sendingLabel : submitLabel}
      </Button>
    </form>
  );
}
