import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSubmitContact } from "@/hooks/useContact";
import {
  createCorporateInquirySchema,
  corporateEventTypes,
  type CorporateEventType,
  type CorporateInquiryFormValues,
} from "@/types/forms/corporateInquiry";
import {
  formInputTypo,
  formLabelTypo,
  formErrorTypo,
  formCaptionTypo,
} from "./formFieldStyles";

interface CorporateInquiryFormProps {
  onSuccess?: () => void;
  defaultEventType?: CorporateEventType;
}

export function CorporateInquiryForm({
  onSuccess,
  defaultEventType = "corporate",
}: CorporateInquiryFormProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  const schema = useMemo(
    () => createCorporateInquirySchema(t),
    [t],
  );
  const submit = useSubmitContact();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CorporateInquiryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventType: defaultEventType,
    },
  });

  const inputIcon =
    "w-full pl-10 pr-4 py-2.5 rounded-xl" +
    " border-2 border-sage-200 bg-card text-charcoal" +
    " placeholder:text-warm-grey-400" +
    " focus:outline-none focus:border-sage-400" +
    " focus:shadow-[0_0_0_3px_rgba(58,92,69,0.12)]" +
    " transition-all duration-200";

  const inputPlain =
    "w-full px-4 py-2.5 rounded-xl" +
    " border-2 border-sage-200 bg-card text-charcoal" +
    " placeholder:text-warm-grey-400" +
    " focus:outline-none focus:border-sage-400" +
    " focus:shadow-[0_0_0_3px_rgba(58,92,69,0.12)]" +
    " transition-all duration-200";

  const textareaClass =
    "w-full px-4 py-2.5 rounded-xl" +
    " border-2 border-sage-200 bg-card text-charcoal resize-none" +
    " placeholder:text-warm-grey-400" +
    " focus:outline-none focus:border-sage-400" +
    " focus:shadow-[0_0_0_3px_rgba(58,92,69,0.12)]" +
    " transition-all duration-200";

  const onSubmit: SubmitHandler<CorporateInquiryFormValues> =
    async (data) => {
      const phone = data.phone?.trim() || undefined;
      const notes = data.notes?.trim() || undefined;

      const subject = `[CORPORATE] ${t(
        "corp.subjectPrefix",
        "Corporate/Event Booking",
      )} • ${data.company} • ${data.eventType}`;

      const lines = [
        `Contact: ${data.name} (${data.email}${phone ? `, ${phone}` : ""})`,
        `Company: ${data.company}`,
        `Event type: ${data.eventType}`,
        data.attendees ? `Attendees: ${data.attendees}` : null,
        data.date
          ? `Date: ${data.date}${data.endDate ? ` → ${data.endDate}` : ""}`
          : null,
        data.duration
          ? `Duration/Hours: ${data.duration}`
          : null,
        data.onSiteAddress
          ? `Location: ${data.onSiteAddress}`
          : null,
        data.services
          ? `Requested services: ${data.services}`
          : null,
        data.budget ? `Budget: ${data.budget}` : null,
        "",
        "Notes:",
        notes || "-",
      ]
        .filter(Boolean)
        .join("\n");

      try {
        await submit.mutateAsync({
          name: data.name,
          email: data.email,
          phone: phone || "",
          subject,
          message: lines,
        });

        toast.success(
          t(
            "corp.form.success",
            "Request sent! I will get back to you shortly. ✨",
          ),
        );
        reset();
        onSuccess?.();
      } catch (err) {
        console.error("Corporate inquiry error:", err);
        toast.error(
          t(
            "corp.form.error",
            "Could not send your request. Please try again.",
          ),
        );
      }
    };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 sm:space-y-5"
      noValidate
    >
      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label
            className="block font-medium text-charcoal mb-2"
            htmlFor="name"
            style={formLabelTypo}
          >
            {t("corp.form.name", "Full name")}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input
              id="name"
              type="text"
              className={inputIcon}
              style={formInputTypo}
              placeholder="Jane Doe"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p
              className="text-terracotta-600 mt-1.5"
              style={formErrorTypo}
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block font-medium text-charcoal mb-2"
            htmlFor="email"
            style={formLabelTypo}
          >
            {t("corp.form.email", "Email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input
              id="email"
              type="email"
              className={inputIcon}
              style={formInputTypo}
              placeholder="jane@company.com"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p
              className="text-terracotta-600 mt-1.5"
              style={formErrorTypo}
            >
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          className="block font-medium text-charcoal mb-2"
          htmlFor="phone"
          style={formLabelTypo}
        >
          {t("corp.form.phone", "Phone")}{" "}
          <span
            className="text-charcoal/80"
            style={formCaptionTypo}
          >
            {t("corp.form.optional", "(optional)")}
          </span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
          <input
            id="phone"
            type="tel"
            className={inputIcon}
            style={formInputTypo}
            placeholder="+33 6 00 00 00 00"
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p
            className="text-terracotta-600 mt-1.5"
            style={formErrorTypo}
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="block font-medium text-charcoal mb-2"
          htmlFor="company"
          style={formLabelTypo}
        >
          {t("corp.form.company", "Company/Organization")}
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
          <input
            id="company"
            type="text"
            className={inputIcon}
            style={formInputTypo}
            placeholder="Acme SAS"
            {...register("company")}
          />
        </div>
        {errors.company && (
          <p
            className="text-terracotta-600 mt-1.5"
            style={formErrorTypo}
          >
            {errors.company.message}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label
            className="block font-medium text-charcoal mb-2"
            htmlFor="eventType"
            style={formLabelTypo}
          >
            {t("corp.form.eventType", "Event type")}
          </label>
          <select
            id="eventType"
            className={inputPlain}
            style={formInputTypo}
            {...register("eventType")}
          >
            {corporateEventTypes.map((v) => (
              <option key={v} value={v}>
                {v === "corporate" &&
                  t(
                    "corp.form.eventTypes.corporate",
                    "Corporate wellness",
                  )}
                {v === "team" &&
                  t(
                    "corp.form.eventTypes.team",
                    "Team day / offsite",
                  )}
                {v === "expo" &&
                  t(
                    "corp.form.eventTypes.expo",
                    "Fair / expo / booth",
                  )}
                {v === "private" &&
                  t(
                    "corp.form.eventTypes.private",
                    "Private event",
                  )}
                {v === "other" &&
                  t("corp.form.eventTypes.other", "Other")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block font-medium text-charcoal mb-2"
            htmlFor="attendees"
            style={formLabelTypo}
          >
            {t("corp.form.attendees", "Estimated attendees")}
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input
              id="attendees"
              type="number"
              className={inputIcon}
              style={formInputTypo}
              placeholder="25"
              inputMode="numeric"
              {...register("attendees", {
                setValueAs: (v) => {
                  if (
                    v === "" ||
                    v === null ||
                    v === undefined
                  )
                    return undefined;
                  const n =
                    typeof v === "number" ? v : Number(v);
                  return Number.isNaN(n) ? undefined : n;
                },
              })}
            />
          </div>
          {errors.attendees && (
            <p
              className="text-terracotta-600 mt-1.5"
              style={formErrorTypo}
            >
              {errors.attendees.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label
            className="block font-medium text-charcoal mb-2"
            htmlFor="date"
            style={formLabelTypo}
          >
            {t("corp.form.date", "Date")}
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input
              id="date"
              type="date"
              className={inputIcon}
              style={formInputTypo}
              {...register("date")}
            />
          </div>
        </div>

        <div>
          <label
            className="block font-medium text-charcoal mb-2"
            htmlFor="endDate"
            style={formLabelTypo}
          >
            {t("corp.form.endDate", "End date (optional)")}
          </label>
          <input
            id="endDate"
            type="date"
            className={inputPlain}
            style={formInputTypo}
            {...register("endDate")}
          />
        </div>
      </div>

      <div>
        <label
          className="block font-medium text-charcoal mb-2"
          htmlFor="onSiteAddress"
          style={formLabelTypo}
        >
          {t("corp.form.location", "Location / address")}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
          <input
            id="onSiteAddress"
            type="text"
            className={inputIcon}
            style={formInputTypo}
            placeholder={t(
              "corp.form.location.placeholder",
              "Company address or venue",
            )}
            {...register("onSiteAddress")}
          />
        </div>
      </div>

      <div className="border border-sage-200 rounded-xl bg-sage-50/40">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 font-medium text-charcoal"
          style={{
            fontSize: "var(--typo-small)",
            lineHeight: "var(--leading-small)",
          }}
        >
          <span>
            {t(
              "corp.form.moreDetailsLabel",
              "Additional details (optional)",
            )}
          </span>
          {showMore ? (
            <ChevronUp className="w-4 h-4 text-charcoal/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-charcoal/60" />
          )}
        </button>

        {showMore && (
          <div className="px-4 pb-4 pt-1 space-y-4">
            <div>
              <label
                className="block font-medium text-charcoal mb-2"
                htmlFor="duration"
                style={formLabelTypo}
              >
                {t("corp.form.duration", "Hours / duration")}
              </label>
              <input
                id="duration"
                type="text"
                className={inputPlain}
                style={formInputTypo}
                placeholder="09:00–17:00 or 3h"
                {...register("duration")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label
                  className="block font-medium text-charcoal mb-2"
                  htmlFor="services"
                  style={formLabelTypo}
                >
                  {t(
                    "corp.form.services",
                    "Requested services",
                  )}
                </label>
                <input
                  id="services"
                  type="text"
                  className={inputPlain}
                  style={formInputTypo}
                  placeholder={t(
                    "corp.form.services.placeholder",
                    "Chair massage, 10-min rotations, 2 practitioners…",
                  )}
                  {...register("services")}
                />
              </div>

              <div>
                <label
                  className="block font-medium text-charcoal mb-2"
                  htmlFor="budget"
                  style={formLabelTypo}
                >
                  {t("corp.form.budget", "Budget (optional)")}
                </label>
                <input
                  id="budget"
                  type="text"
                  className={inputPlain}
                  style={formInputTypo}
                  placeholder="€500–€1500"
                  {...register("budget")}
                />
              </div>
            </div>

            <div>
              <label
                className="block font-medium text-charcoal mb-2"
                htmlFor="notes"
                style={formLabelTypo}
              >
                {t("corp.form.notes", "Additional notes")}
              </label>
              <textarea
                id="notes"
                rows={4}
                className={textareaClass}
                style={formInputTypo}
                placeholder={t(
                  "corp.form.notes.placeholder",
                  "Ambiance / space available, parking, access badges, etc.",
                )}
                {...register("notes")}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
        <p className="text-charcoal/80" style={formCaptionTypo}>
          <span className="font-semibold text-charcoal">
            {t("corp.form.gdpr.title", "Privacy notice")}:
          </span>{" "}
          {t(
            "corp.form.gdpr.text",
            "This form emails your request directly. We do not store your data; it is used only to reply to you.",
          )}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || submit.isPending}
      >
        {isSubmitting || submit.isPending
          ? t("corp.form.sending", "Sending...")
          : t("corp.form.send", "Request quote")}
      </Button>

      <p
        className="text-charcoal/80 text-center"
        style={{
          fontSize: "var(--typo-small)",
          lineHeight: "var(--leading-small)",
        }}
      >
        {t(
          "corp.form.notice",
          "We reply within one business day for corporate requests.",
        )}
      </p>
    </form>
  );
}
