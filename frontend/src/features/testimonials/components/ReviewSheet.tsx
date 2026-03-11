import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubmitTestimonial } from "@/hooks/useTestimonials";
import { normalizeHttpError } from "@/utils/normalizeHttpError";

interface ReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewSheet({
  open,
  onOpenChange,
}: ReviewSheetProps) {
  const { t } = useTranslation();
  const submitMutation = useSubmitTestimonial();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setName("");
    setEmail("");
    setText("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleClose = () => {
    setErrorMessage("");
    setSuccessMessage("");
    onOpenChange(false);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (rating === 0 || !name.trim() || !text.trim()) {
      setErrorMessage(t("review.validation.required"));
      return;
    }

    if (text.trim().length < 10) {
      setErrorMessage(t("review.validation.tooShort"));
      return;
    }

    try {
      const response = await submitMutation.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        rating,
        text: text.trim(),
      });

      setSuccessMessage(response.message || t("review.success"));

      window.setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 2000);
    } catch (error: unknown) {
      setErrorMessage(
        normalizeHttpError(error).message || t("review.error")
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-2xl sm:max-w-md"
          >
            <div className="bg-sage-deep px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                    {t("review.eyebrow", "Customer Feedback")}
                  </p>
                  <h2 className="mt-2 text-3xl font-heading font-bold text-white">
                    {t("review.title")}
                  </h2>
                  <p className="mt-2 text-sm text-white/80">
                    {t("review.subtitle")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={t("review.close")}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-lg border border-sage-300 bg-sage-100 p-4"
                >
                  <p className="text-sm text-sage-800">
                    {successMessage}
                  </p>
                </motion.div>
              )}

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4"
                >
                  <p className="text-sm text-red-800">
                    {errorMessage}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    {t("review.rating.label")}{" "}
                    <span className="text-red-500">
                      {t("review.rating.required")}
                    </span>
                  </label>

                  <div
                    className="flex gap-1"
                    role="radiogroup"
                    aria-label={t("review.rating.label")}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={star === rating}
                        aria-label={`${star} ${
                          star > 1
                            ? t("review.rating.stars")
                            : t("review.rating.star")
                        }`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="rounded transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sage-500"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? "fill-honey-500 text-honey-500"
                              : "text-gray-300"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-charcoal"
                  >
                    {t("review.form.name")}{" "}
                    <span className="text-red-500">
                      {t("review.rating.required")}
                    </span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("review.form.namePlaceholder")}
                    maxLength={100}
                    required
                    disabled={submitMutation.isPending}
                    className="w-full rounded-xl border-2 border-sage-200 px-4 py-3 transition-colors focus:border-sage-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-charcoal"
                  >
                    {t("review.form.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("review.form.emailPlaceholder")}
                    disabled={submitMutation.isPending}
                    className="w-full rounded-xl border-2 border-sage-200 px-4 py-3 transition-colors focus:border-sage-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-charcoal/60">
                    {t("review.form.emailHelp")}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="review"
                    className="mb-2 block text-sm font-medium text-charcoal"
                  >
                    {t("review.form.text")}{" "}
                    <span className="text-red-500">
                      {t("review.rating.required")}
                    </span>
                  </label>
                  <textarea
                    id="review"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("review.form.textPlaceholder")}
                    rows={5}
                    maxLength={500}
                    required
                    disabled={submitMutation.isPending}
                    className="w-full resize-none rounded-xl border-2 border-sage-200 px-4 py-3 transition-colors focus:border-sage-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-charcoal/60">
                    {text.length}/500 {t("review.form.characters")}
                  </p>
                </div>

                <div className="rounded-lg border border-sage-200 bg-sage-50 p-4">
                  <p className="text-xs leading-relaxed text-charcoal/80">
                    <span className="font-semibold text-charcoal">
                      {t("review.form.gdpr.title", "Privacy Notice")}:
                    </span>{" "}
                    {t(
                      "review.form.gdpr.text",
                      "Your review will be stored in our system for moderation. We only collect the information you provide (name, optional email, and review text) to display your testimonial. Your email will not be published or shared."
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full rounded-xl bg-sage-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitMutation.isPending
                    ? t("review.form.submitting")
                    : t("review.form.submit")}
                </button>

                <p className="text-center text-xs text-charcoal/60">
                  {t("review.form.notice")}
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
