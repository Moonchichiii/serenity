import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  createContactSchema,
  type ContactFormValues,
} from "@/types/forms/contact";
import { useSubmitContact } from "@/hooks/useContact";
import {
  formInputTypo,
  formLabelTypo,
  formErrorTypo,
  formCaptionTypo,
} from "./formFieldStyles";

interface ContactFormProps {
  onSuccess?: () => void;
  defaultSubject?: string;
}

export function ContactForm({
  onSuccess,
  defaultSubject,
}: ContactFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(() => createContactSchema(t), [t]);

  const submit = useSubmitContact();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: defaultSubject || "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await submit.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        subject: data.subject,
        message: data.message,
      });

      toast.success(
        t("contact.form.success", "Message sent successfully! ✨"),
      );
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast.error(
        t(
          "contact.form.error",
          "Error sending message. Please try again.",
        ),
      );
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl" +
    " border-2 border-sage-200 bg-card text-charcoal appearance-none" +
    " placeholder:text-warm-grey-400" +
    " focus:outline-none focus:border-sage-400" +
    " focus:shadow-[0_0_0_3px_rgba(58,92,69,0.12)]" +
    " transition-all duration-200";

  const subjectClass =
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            className="block font-medium text-charcoal mb-1.5"
            htmlFor="name"
            style={formLabelTypo}
          >
            {t("contact.form.name", "Full Name")}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className={inputClass}
              style={formInputTypo}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p
              className="text-terracotta-600 mt-1"
              style={formErrorTypo}
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block font-medium text-charcoal mb-1.5"
            htmlFor="email"
            style={formLabelTypo}
          >
            {t("contact.form.email", "Email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jean@example.com"
              aria-invalid={!!errors.email}
              className={inputClass}
              style={formInputTypo}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p
              className="text-terracotta-600 mt-1"
              style={formErrorTypo}
            >
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          className="block font-medium text-charcoal mb-1.5"
          htmlFor="phone"
          style={formLabelTypo}
        >
          {t("contact.form.phone", "Phone")}{" "}
          <span
            className="text-charcoal/80"
            style={formCaptionTypo}
          >
            {t("contact.form.optional", "(optional)")}
          </span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+33 6 00 00 00 00"
            aria-invalid={!!errors.phone}
            className={inputClass}
            style={formInputTypo}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p
            className="text-terracotta-600 mt-1"
            style={formErrorTypo}
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="block font-medium text-charcoal mb-1.5"
          htmlFor="subject"
          style={formLabelTypo}
        >
          {t("contact.form.subject", "Subject")}
        </label>
        <input
          id="subject"
          type="text"
          placeholder={t(
            "contact.form.subject.placeholder",
            "Appointment request",
          )}
          aria-invalid={!!errors.subject}
          className={subjectClass}
          style={formInputTypo}
          {...register("subject")}
        />
        {errors.subject && (
          <p
            className="text-terracotta-600 mt-1"
            style={formErrorTypo}
          >
            {errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="block font-medium text-charcoal mb-1.5"
          htmlFor="message"
          style={formLabelTypo}
        >
          {t("contact.form.message", "Message")}
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder={t(
            "contact.form.message.placeholder",
            "Describe your needs...",
          )}
          aria-invalid={!!errors.message}
          className={textareaClass}
          style={formInputTypo}
          {...register("message")}
        />
        {errors.message && (
          <p
            className="text-terracotta-600 mt-1"
            style={formErrorTypo}
          >
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="bg-sage-50 rounded-lg p-3 border border-sage-200">
        <p className="text-charcoal/80" style={formCaptionTypo}>
          <span className="font-semibold text-charcoal">
            {t("contact.form.gdpr.title", "Privacy Notice")}:
          </span>{" "}
          {t(
            "contact.form.gdpr.text",
            "We do not store your data; it is used only to respond to your inquiry.",
          )}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || submit.isPending}
      >
        {isSubmitting || submit.isPending
          ? t("contact.form.sending", "Sending...")
          : t("contact.form.send", "Send Message")}
      </Button>
    </form>
  );
}
