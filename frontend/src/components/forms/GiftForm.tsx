import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Gift,
  Mail,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import Calendar from "react-calendar";
import { format } from "date-fns";

import { Button } from "@/components/ui/Button";
import type { GlobalSettings, GiftVoucherSubmission } from "@/types/api";
import { createGiftSchema, type GiftFormValues } from "@/types/forms/gift";
import { useCreateVoucher } from "@/hooks/useVouchers";
import { useBusyDays, useFreeSlots } from "@/hooks/useCalendar";
import { useCMSServices } from "@/hooks/useCMS";
import { normalizeHttpError } from "@/api/httpError";
import { isPastDate } from "@/lib/utils";

interface GiftFormProps {
  onSuccess?: () => void;
  settings?: GlobalSettings["gift"] | null;
}

export function GiftForm({ onSuccess, settings }: GiftFormProps) {
  const { t, i18n } = useTranslation();
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [calendarMeta, setCalendarMeta] = useState<{
    id: string;
    link: string;
    status: string;
  } | null>(null);
  const [wantsBooking, setWantsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const lang: "en" | "fr" = i18n.language.startsWith("fr") ? "fr" : "en";
  const schema = useMemo(() => createGiftSchema(t), [t]);
  const services = useCMSServices();
  const submit = useCreateVoucher();

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

  const selectedTime = useWatch({ control, name: "selectedTime" });
  const selectedServiceId = useWatch({ control, name: "serviceId" });

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
  const successTitleText = fromCms(
    settings?.form_success_title_en,
    settings?.form_success_title_fr,
    "gift.form.successTitle",
  );
  const successMessageText = fromCms(
    settings?.form_success_message_en,
    settings?.form_success_message_fr,
    "gift.form.successMessage",
  );
  const codeLabelText = fromCms(
    settings?.form_code_label_en,
    settings?.form_code_label_fr,
    "gift.form.codeLabel",
  );
  const messagePlaceholder = fromCms(
    settings?.form_message_placeholder_en,
    settings?.form_message_placeholder_fr,
    "gift.form.messagePlaceholder",
  );

  const onSubmit = async (data: GiftFormValues) => {
    let startDatetime: string | undefined;
    let endDatetime: string | undefined;

    if (
      wantsBooking &&
      data.serviceId &&
      data.selectedDate &&
      data.selectedTime
    ) {
      const service = services.find((s) => s.id === data.serviceId);
      const start = new Date(
        `${data.selectedDate}T${data.selectedTime}:00`,
      );
      const end = new Date(
        start.getTime() + (service?.duration_minutes ?? 60) * 60_000,
      );
      startDatetime = start.toISOString();
      endDatetime = end.toISOString();
    }

    const payload: GiftVoucherSubmission = {
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      message: data.message || "",
      ...(startDatetime && endDatetime && typeof data.serviceId === "number"
        ? { serviceId: data.serviceId, startDatetime, endDatetime }
        : {}),
    };

    try {
      const res = await submit.mutateAsync(payload);
      setSuccessCode(res.code);
      setCalendarMeta(
        res.calendar_event_id
          ? {
          id: res.calendar_event_id,
          link: res.calendar_event_link,
          status: res.calendar_event_status,
        }
          : null,
      );
      toast.success(successTitleText);
      reset();
      setSelectedDate(null);
      setWantsBooking(false);
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
  const labelClass = "block text-sm font-medium text-charcoal mb-1.5";

  // ── Success screen ──
  if (successCode) {
    return (
      <div className="text-center py-8 px-4 space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-heading font-bold text-charcoal">
          {successTitleText}
        </h3>
        <p className="text-charcoal/70 max-w-sm mx-auto">
          {successMessageText}
        </p>

        <div className="bg-sand-50 border border-sage-200 rounded-xl p-6 max-w-xs mx-auto mt-6">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold mb-2">
            {codeLabelText}
          </p>
          <p className="text-3xl font-mono font-bold text-terracotta-500 tracking-wider">
            {successCode}
          </p>
        </div>

        {calendarMeta?.id && (
          <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 max-w-xs mx-auto">
            <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold mb-1">
              {t("gift.form.calendarRef", "Calendar ref.")}
            </p>
            <p className="text-lg font-mono font-bold text-charcoal">
              {calendarMeta.id}
            </p>

            {calendarMeta.link && (
              <a
                href={calendarMeta.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-terracotta-600 underline"
              >
                {t(
                  "gift.form.openCalendar",
                  "Open calendar event",
                )}
              </a>
            )}
          </div>
        )}

        <Button onClick={onSuccess} className="w-full mt-6">
          {t("gift.form.close")}
        </Button>
      </div>
    );
  }

  // ── Form ──
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
                placeholder={t("gift.form.purchaserNamePlaceholder")}
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
                placeholder={t("gift.form.purchaserEmailPlaceholder")}
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
                placeholder={t("gift.form.recipientNamePlaceholder")}
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
                placeholder={t("gift.form.recipientEmailPlaceholder")}
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

      {/* ── Optional booking section ── */}
      <div className="border border-sage-200 rounded-2xl p-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wantsBooking}
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
              <label className={labelClass}>
                {t("gift.form.service", "Service")}
              </label>
              <select
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
                      : t("gift.form.pickDate", "Pick a date")}
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
        disabled={submit.isPending}
      >
        {submit.isPending ? sendingLabel : submitLabel}
      </Button>
    </form>
  );
}
