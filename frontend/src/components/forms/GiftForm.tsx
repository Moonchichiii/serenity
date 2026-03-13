import { useMemo, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Calendar as CalendarIcon,
  User,
  CreditCard,
  Sparkles,
} from "lucide-react";
import Calendar from "react-calendar";
import { format } from "date-fns";

import { Button } from "@/components/ui/Button";
import type { GlobalSettings } from "@/types/api";
import { createGiftSchema, type GiftFormValues } from "@/types/forms/gift";
import { useCreateCheckoutMutation } from "@/queries/payments.mutations";
import { useBusyDays, useFreeSlots } from "@/hooks/useCalendar";
import { useCMSServices } from "@/hooks/useCMS";
import { isPastDate } from "@/lib/utils";
import { normalizeHttpError } from "@/api/httpError";
import type { CheckoutRequest } from "@/types/api/payments";

interface GiftFormProps {
  settings?: GlobalSettings["gift"] | null;
  onSuccess?: () => void;
}

export function GiftForm({ settings, onSuccess }: GiftFormProps) {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const lang: "en" | "fr" = i18n.language.startsWith("fr") ? "fr" : "en";
  const schema = useMemo(() => createGiftSchema(t), [t]);
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
      amount: 0, // Initial amount
    },
  });

  // Watch fields to react to changes
  const [selectedTime, selectedServiceId, , currentAmount] =
    useWatch({
      control,
      name: ["selectedTime", "serviceId", "selectedDate", "amount"],
    });

  // ⚡️ MAGIC: Automatically set amount when service changes
  useEffect(() => {
    if (selectedServiceId) {
      const service = services.find((s) => s.id === selectedServiceId);
      if (service) {
        // Strip non-numeric chars just in case price is string formatted
        const price = Number(service.price.toString().replace(/[^0-9.]/g, ""));
        setValue("amount", price, { shouldValidate: true });
      }
    }
  }, [selectedServiceId, services, setValue]);

  // Calendar logic
  const ym = useMemo(
    () => ({
      year: activeStartDate.getFullYear(),
      month: activeStartDate.getMonth() + 1,
    }),
    [activeStartDate],
  );

  const { data: busyData } = useBusyDays(ym.year, ym.month);
  const busyDates = useMemo(() => new Set(busyData?.busy ?? []), [busyData]);

  const selectedDateIso = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";
  const { data: slotsData, isFetching: slotsFetching } =
    useFreeSlots(selectedDateIso);
  const availableTimes = slotsData?.times ?? [];

  // CMS Helpers
  const fromCms = (en?: string, fr?: string, key?: string, def?: string) => {
    const val = lang === "fr" ? fr : en;

    if (val?.trim()) {
      return val;
    }

    if (!key) {
      return "";
    }

    return def ? t(key, def) : t(key);
  };

  const submitLabel = fromCms(
    settings?.form_submit_label_en,
    settings?.form_submit_label_fr,
    "gift.form.submit",
    "Proceed to Payment",
  );
  const sendingLabel = t("gift.form.sending", "Processing...");

  const onSubmit = async (data: GiftFormValues) => {
    // Basic validation: Service must be selected
    if (!data.serviceId || data.amount <= 0) {
      toast.error(
        t("gift.error.noService", "Please select an experience to gift."),
      );
      return;
    }

    // Prepare Booking Data (if they picked a date)
    let start_datetime: string | undefined;
    let end_datetime: string | undefined;

    // It is optional to pick a date, but if they picked part of it, they must finish it
    if (data.selectedDate && !data.selectedTime) {
      toast.error(t("gift.error.incompleteTime", "Please select a time slot."));
      return;
    }

    if (data.selectedDate && data.selectedTime) {
      const service = services.find((s) => s.id === data.serviceId);
      const start = new Date(`${data.selectedDate}T${data.selectedTime}:00`);
      const end = new Date(
        start.getTime() + (service?.duration_minutes ?? 60) * 60_000,
      );
      start_datetime = start.toISOString();
      end_datetime = end.toISOString();
    }

    const payload: CheckoutRequest = {
      sender_name: data.senderName,
      sender_email: data.senderEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message?.trim() || "",
      amount: data.amount,
      preferred_language: lang,
      // Only attach booking info if fully complete
      ...(start_datetime && end_datetime
        ? {
            service_id: data.serviceId,
            start_datetime,
            end_datetime,
          }
        : {
            // Still send service_id even if no date picked, so backend knows what was bought
            service_id: data.serviceId,
          }),
    };

    try {
      const res = await checkout.mutateAsync(payload);
      reset();
      onSuccess?.();
      window.location.assign(res.url);
    } catch (err) {
      const apiErr = normalizeHttpError(err);
      toast.error(apiErr.message || "Something went wrong.");
    }
  };

  /* ─── STYLES ─── */
  const sectionTitleClass =
    "text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-3 flex items-center gap-2";
  const inputBase =
    "w-full px-4 py-3 rounded-lg bg-sand-50 border border-warm-grey-200/50 " +
    "text-charcoal placeholder:text-warm-grey-400 " +
    "focus:outline-none focus:ring-2 focus:ring-sage-400/20 focus:border-sage-400 " +
    "transition-all duration-200";
  const labelBase = "block text-sm font-medium text-charcoal/80 mb-1.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-4">
      {/* 1. SENDER & RECIPIENT */}
      <div className="space-y-6">
        <div>
          <h3 className={sectionTitleClass}>
            <User className="w-3.5 h-3.5" />
            {t("gift.form.details", "Details")}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>
                  {t("gift.form.purchaserName")}
                </label>
                <input
                  type="text"
                  {...register("senderName")}
                  className={inputBase}
                  placeholder={t("gift.form.purchaserNamePlaceholder")}
                />
                {errors.senderName && (
                  <p className="text-terracotta-500 text-xs mt-1">
                    {errors.senderName.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelBase}>
                  {t("gift.form.purchaserEmail")}
                </label>
                <input
                  type="email"
                  {...register("senderEmail")}
                  className={inputBase}
                  placeholder={t("gift.form.purchaserEmailPlaceholder")}
                />
                {errors.senderEmail && (
                  <p className="text-terracotta-500 text-xs mt-1">
                    {errors.senderEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>
                  {t("gift.form.recipientName")}
                </label>
                <input
                  type="text"
                  {...register("recipientName")}
                  className={inputBase}
                  placeholder={t("gift.form.recipientNamePlaceholder")}
                />
                {errors.recipientName && (
                  <p className="text-terracotta-500 text-xs mt-1">
                    {errors.recipientName.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelBase}>
                  {t("gift.form.recipientEmail")}
                </label>
                <input
                  type="email"
                  {...register("recipientEmail")}
                  className={inputBase}
                  placeholder={t("gift.form.recipientEmailPlaceholder")}
                />
                {errors.recipientEmail && (
                  <p className="text-terracotta-500 text-xs mt-1">
                    {errors.recipientEmail.message}
                  </p>
                )}
              </div>
            </div>

            <textarea
              {...register("message")}
              rows={2}
              className={`${inputBase} resize-none`}
              placeholder={t("gift.form.messagePlaceholder")}
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-warm-grey-100" />

      {/* 2. EXPERIENCE SELECTION (Central Hub) */}
      <div>
        <h3 className={sectionTitleClass}>
          <Sparkles className="w-3.5 h-3.5" />
          {t("gift.form.experience", "Select Experience")}
        </h3>

        <div className="relative">
          <select
            value={selectedServiceId ?? ""}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : undefined;
              setValue("serviceId", id);
              // Reset date if service changes to force re-evaluation if needed
              setValue("selectedDate", undefined);
              setValue("selectedTime", undefined);
              setSelectedDate(null);
            }}
            className={`${inputBase} appearance-none font-medium text-sage-900 bg-white border-sage-200 py-4`}
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
          {/* Custom Chevron */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sage-500">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        {errors.amount && (
          <p className="text-terracotta-500 text-xs mt-2">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* 3. CALENDAR (Auto-appears when service is selected) */}
      {selectedServiceId && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-4 mt-6">
            <CalendarIcon className="w-4 h-4 text-sage-500" />
            <span className="text-sm font-medium text-charcoal">
              {t("gift.form.scheduleNow", "Schedule Date (Optional)")}
            </span>
          </div>

          <div className="bg-white border border-warm-grey-200 rounded-2xl p-4">
            <Calendar
              value={selectedDate}
              onChange={(value) => {
                const date = Array.isArray(value) ? value[0] : value;
                setSelectedDate(date);
                if (date) {
                  setValue("selectedDate", format(date, "yyyy-MM-dd"));
                  setValue("selectedTime", undefined);
                }
              }}
              onActiveStartDateChange={({ activeStartDate: d }) =>
                d && setActiveStartDate(d)
              }
              tileDisabled={({ date, view }) => {
                if (view !== "month") return false;
                return (
                  isPastDate(date) || busyDates.has(format(date, "yyyy-MM-dd"))
                );
              }}
              calendarType="iso8601"
              prev2Label={null}
              next2Label={null}
              className="!w-full !font-sans !border-none !bg-transparent
                  [&_.react-calendar__tile]:rounded-full
                  [&_.react-calendar__tile]:!h-9 [&_.react-calendar__tile]:!w-9
                  [&_.react-calendar__tile]:!flex [&_.react-calendar__tile]:!items-center [&_.react-calendar__tile]:!justify-center
                  [&_.react-calendar__tile]:!text-sm [&_.react-calendar__tile]:!text-charcoal
                  [&_.react-calendar__tile:enabled:hover]:!bg-terracotta-50
                  [&_.react-calendar__tile--active]:!bg-terracotta-400 [&_.react-calendar__tile--active]:!text-white
                  [&_.react-calendar__tile--now]:!bg-sand-100
                  [&_.react-calendar__navigation__label]:!text-charcoal/80 [&_.react-calendar__navigation__label]:!font-bold
                  [&_.react-calendar__month-view__weekdays]:!text-[10px] [&_.react-calendar__month-view__weekdays]:!text-charcoal/40 [&_.react-calendar__month-view__weekdays]:!uppercase"
            />

            {/* Time Slots */}
            {selectedDate && (
              <div className="mt-6 animate-fade-in border-t border-warm-grey-100 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/40 mb-3">
                  {t("gift.form.availableTimes", "Available Times")}
                </label>
                {slotsFetching ? (
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-sand-100 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-sand-100 rounded animate-pulse" />
                  </div>
                ) : availableTimes.length === 0 ? (
                  <p className="text-xs text-charcoal/50 italic">
                    {t("gift.form.noSlots", "No slots available.")}
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={checkout.isPending}
                        onClick={() => setValue("selectedTime", time)}
                        className={`px-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? "bg-terracotta-400 text-white shadow-md"
                            : "bg-sage-50 text-charcoal hover:bg-terracotta-50 border border-transparent hover:border-terracotta-200"
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
        </div>
      )}

      {/* 4. FOOTER (Total & Submit) */}
      <div className="sticky bottom-0 -mx-6 -mb-6 z-10 border-t border-warm-grey-200 bg-white/95 p-6 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="mb-4 flex justify-between items-end">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-charcoal/50">
              {t("gift.form.total", "Total")}
            </p>
            <p className="text-3xl font-heading text-sage-900">
              {currentAmount ? `€${currentAmount}` : "€0"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-sand-50 px-2 py-1 text-[10px] text-charcoal/40">
            <CreditCard className="h-3 w-3" />
            {t("gift.form.poweredByStripe", "Secure checkout with Stripe")}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-xl bg-sage-deep text-lg text-white shadow-warm transition-all active:scale-[0.98] hover:bg-sage-800"
          disabled={checkout.isPending || !selectedServiceId}
        >
          {checkout.isPending ? sendingLabel : submitLabel}
        </Button>

        <p className="mt-3 text-center text-xs leading-relaxed text-charcoal/50">
          {t(
            "gift.form.paymentMethodsNote",
            "Card, Klarna, and other available payment methods are shown at checkout.",
          )}
        </p>
      </div>
    </form>
  );
}
