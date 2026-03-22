import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Send, Star } from "lucide-react";
import { useReplyToTestimonial } from "@/hooks/useTestimonials";
import type { WagtailTestimonial } from "@/types/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  testimonial: WagtailTestimonial | null;
}

export function TestimonialModal({
  isOpen,
  onClose,
  testimonial,
}: Props) {
  const { t } = useTranslation();
  const [replyText, setReplyText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const replyMutation = useReplyToTestimonial();

  if (!testimonial) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await replyMutation.mutateAsync({
        id: testimonial.id,
        data: { name, email, text: replyText },
      });
      setReplyText("");
      setName("");
      setEmail("");
    } catch {
      alert(
        t("testimonials.modal.error", "Error submitting reply"),
      );
    }
  };

  const status = replyMutation.isPending
    ? "submitting"
    : replyMutation.isSuccess
      ? "success"
      : "idle";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card rounded-3xl shadow-elevated overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header / Main Testimonial */}
            <div className="p-6 sm:p-8 border-b border-sage-100 bg-sand-50 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      alt={`${testimonial.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center font-heading text-charcoal"
                      style={{
                        fontSize: "var(--typo-body)",
                        lineHeight: "var(--leading-body)",
                      }}
                    >
                      {testimonial.name[0]}
                    </div>
                  )}
                  <div>
                    <h2
                      className="font-heading text-charcoal"
                      style={{
                        fontSize: "var(--typo-h4)",
                        lineHeight: "var(--leading-h4)",
                      }}
                    >
                      {testimonial.name}
                    </h2>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < testimonial.rating
                              ? "fill-honey-400 text-honey-400"
                              : "text-charcoal/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  aria-label={t(
                    "testimonials.modal.close",
                    "Close modal",
                  )}
                  className="p-2 hover:bg-warm-grey-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-charcoal/60" />
                </button>
              </div>

              <p
                className="text-pull-quote"
              >
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p
                className="mt-4 uppercase tracking-wider font-medium text-charcoal/50"
                style={{
                  fontSize: "var(--typo-caption)",
                  lineHeight: "var(--leading-caption)",
                }}
              >
                {testimonial.date}
              </p>
            </div>

            {/* Discussion Area */}
            <div className="flex-1 overflow-y-auto modal-scroll bg-card p-6 sm:p-8">
              <h3
                className="flex items-center gap-2 font-sans font-bold uppercase tracking-wider text-charcoal/50"
                style={{
                  fontSize: "var(--typo-overline)",
                  lineHeight: "var(--leading-overline)",
                  marginBottom: "var(--space-heading-to-paragraph)",
                }}
              >
                <MessageCircle className="w-4 h-4" />
                {t(
                  "testimonials.modal.discussion",
                  "Discussion",
                )}
              </h3>

              <div className="space-y-6 mb-8">
                {testimonial.replies &&
                testimonial.replies.length > 0 ? (
                  testimonial.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="pl-4 border-l-2 border-sage-200"
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <span
                          className="font-semibold text-charcoal"
                          style={{
                            fontSize: "var(--typo-small)",
                            lineHeight: "var(--leading-small)",
                          }}
                        >
                          {reply.name}
                        </span>
                        <span
                          className="text-charcoal/40"
                          style={{
                            fontSize: "var(--typo-caption)",
                            lineHeight:
                              "var(--leading-caption)",
                          }}
                        >
                          {reply.date ||
                            t(
                              "testimonials.modal.earlier",
                              "Earlier",
                            )}
                        </span>
                      </div>
                      <p
                        className="text-charcoal/70"
                        style={{
                          fontSize: "var(--typo-small)",
                          lineHeight: "var(--leading-small)",
                        }}
                      >
                        {reply.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p
                    className="text-charcoal/40 italic text-center py-4"
                    style={{
                      fontSize: "var(--typo-small)",
                      lineHeight: "var(--leading-small)",
                    }}
                  >
                    {t(
                      "testimonials.modal.empty",
                      "No replies yet. Be the first to respond!",
                    )}
                  </p>
                )}
              </div>

              {/* Reply Form */}
              <div className="bg-sand-50/50 rounded-2xl p-5 border border-sage-100">
                {status === "success" ? (
                  <div className="text-center py-4 text-sage-600">
                    <p
                      className="font-medium"
                      style={{
                        fontSize: "var(--typo-body)",
                        lineHeight: "var(--leading-body)",
                      }}
                    >
                      {t(
                        "testimonials.modal.successTitle",
                        "Thank you for your reply!",
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: "var(--typo-small)",
                        lineHeight: "var(--leading-small)",
                      }}
                    >
                      {t(
                        "testimonials.modal.successMessage",
                        "It has been sent for moderation.",
                      )}
                    </p>
                    <button
                      onClick={() => replyMutation.reset()}
                      className="mt-3 underline"
                      style={{
                        fontSize: "var(--typo-caption)",
                        lineHeight: "var(--leading-caption)",
                      }}
                    >
                      {t(
                        "testimonials.modal.writeAnother",
                        "Write another",
                      )}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3"
                  >
                    <p
                      className="font-semibold text-charcoal/80 mb-2"
                      style={{
                        fontSize: "var(--typo-small)",
                        lineHeight: "var(--leading-small)",
                      }}
                    >
                      {t(
                        "testimonials.modal.form.title",
                        "Join the conversation",
                      )}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="author_name"
                        id="reply_name"
                        autoComplete="name"
                        required
                        placeholder={t(
                          "testimonials.modal.form.namePlaceholder",
                          "Your Name",
                        )}
                        className="bg-card px-4 py-2 rounded-xl border border-sage-200
                                   focus:outline-none focus:border-sage-400
                                   focus:shadow-[0_0_0_3px_rgba(58,92,69,0.12)]
                                   transition-all duration-200"
                        style={{
                          fontSize: "var(--typo-small)",
                          lineHeight: "var(--leading-small)",
                        }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <input
                        type="email"
                        name="author_email"
                        id="reply_email"
                        autoComplete="email"
                        required
                        placeholder={t(
                          "testimonials.modal.form.emailPlaceholder",
                          "Email (Private)",
                        )}
                        className="bg-card px-4 py-2 rounded-xl border border-sage-200
                                   focus:outline-none focus:border-sage-400
                                   focus:shadow-[0_0_0_3px_rgba(58,92,69,0.12)]
                                   transition-all duration-200"
                        style={{
                          fontSize: "var(--typo-small)",
                          lineHeight: "var(--leading-small)",
                        }}
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />
                    </div>
                    <textarea
                      name="reply_text"
                      id="reply_text"
                      required
                      placeholder={t(
                        "testimonials.modal.form.textPlaceholder",
                        "Write your response...",
                      )}
                      rows={3}
                      className="w-full bg-card px-4 py-2 rounded-xl border border-sage-200
                                 focus:outline-none focus:border-sage-400
                                 focus:shadow-[0_0_0_3px_rgba(58,92,69,0.12)]
                                 transition-all duration-200 resize-none"
                      style={{
                        fontSize: "var(--typo-small)",
                        lineHeight: "var(--leading-small)",
                      }}
                      value={replyText}
                      onChange={(e) =>
                        setReplyText(e.target.value)
                      }
                    />
                    <div className="flex justify-end">
                      <button
                        disabled={status === "submitting"}
                        type="submit"
                        className="flex items-center gap-2 bg-sage-700 text-porcelain
                                   px-5 py-2 rounded-full font-medium
                                   hover:bg-sage-800 transition-colors
                                   disabled:opacity-50"
                        style={{
                          fontSize: "var(--typo-small)",
                          lineHeight: "var(--leading-small)",
                        }}
                      >
                        {status === "submitting"
                          ? t(
                              "testimonials.modal.form.submitting",
                              "Sending...",
                            )
                          : t(
                              "testimonials.modal.form.submit",
                              "Post Reply",
                            )}
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
