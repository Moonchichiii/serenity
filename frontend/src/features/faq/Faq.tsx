import { useState, useCallback, useMemo, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
  type Transition,
} from 'framer-motion'
import { ChevronDown, Mail, ArrowRight } from 'lucide-react'

import { useCMSPage } from '@/hooks/useCMS'
import { useModal } from '@/components/modal'
import { getLocalizedText } from '@/lib/localize'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────────────
const FADE_IN_TRANSITION: Transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] }

const SECTION_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: FADE_IN_TRANSITION },
}

const ITEM_STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const ITEM_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 22 },
  },
}

const ANSWER_VARIANTS: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.3 }, opacity: { duration: 0.2 } },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.25, delay: 0.08 },
    },
  },
}

const CHEVRON_VARIANTS: Variants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
}

type SupportedLang = 'fr' | 'en'

// ── Types ────────────────────────────────────────────────────────────
interface CmsFaqItem {
  id: number
  question_en?: string
  question_fr?: string
  answer_en?: string
  answer_fr?: string
}

interface ResolvedFaq {
  id: number
  question: string
  answer: string
}

// ── Fallback FAQ data (used when CMS has no FAQ items) ───────────────
const FALLBACK_KEYS = [
  'faq.items.booking',
  'faq.items.whatToExpect',
  'faq.items.cancellation',
  'faq.items.corporate',
  'faq.items.duration',
  'faq.items.contraindications',
] as const

function buildFallbackFaqs(
  t: (key: string) => string,
): ResolvedFaq[] {
  return FALLBACK_KEYS.map((key, i) => ({
    id: i + 1,
    question: t(`${key}.question`),
    answer: t(`${key}.answer`),
  })).filter((f) => f.question && f.answer)
}

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith('fr') ? 'fr' : 'en'
}

function resolveFaqItems(
  raw: CmsFaqItem[],
  lang: SupportedLang,
): ResolvedFaq[] {
  return raw
    .map((item) => ({
      id: item.id,
      question: getLocalizedText(item, 'question', lang),
      answer: getLocalizedText(item, 'answer', lang),
    }))
    .filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0)
}

// ── Hooks ────────────────────────────────────────────────────────────
function useResolvedFaqs(): {
  title: string
  subtitle: string
  items: ResolvedFaq[]
} | null {
  const { t, i18n } = useTranslation()
  const page = useCMSPage()
  const lang = resolveLang(i18n.language)

  return useMemo(() => {
    const title = t('faq.title', { defaultValue: 'Questions & Answers' })
    const subtitle = t('faq.subtitle', {
      defaultValue:
        'Everything you need to know before your session.',
    })

    // Prefer CMS-driven FAQ items when available
    const cmsFaqs: CmsFaqItem[] = (page as any)?.faq_items ?? []
    const items =
      cmsFaqs.length > 0
        ? resolveFaqItems(cmsFaqs, lang)
        : buildFallbackFaqs(t)

    if (items.length === 0) return null

    return { title, subtitle, items }
  }, [page, lang, t])
}

function useAccordion() {
  const [openId, setOpenId] = useState<number | null>(null)

  const toggle = useCallback(
    (id: number) => setOpenId((prev) => (prev === id ? null : id)),
    [],
  )

  return { openId, toggle } as const
}

// ── Sub-components ───────────────────────────────────────────────────

const FaqItem: FC<{
  item: ResolvedFaq
  isOpen: boolean
  onToggle: () => void
  variants: Variants | undefined
  reduceMotion: boolean | null
}> = ({ item, isOpen, onToggle, variants, reduceMotion }) => (
  <motion.div
    variants={variants}
    className={cn(
      'rounded-2xl border transition-all duration-300',
      isOpen
        ? 'border-terracotta-200 bg-card shadow-soft'
        : 'border-warm-grey-200 bg-card/60 hover:border-warm-grey-300 hover:bg-card/80',
    )}
  >
    <button
      type="button"
      id={`faq-trigger-${item.id}`}
      aria-expanded={isOpen}
      aria-controls={`faq-panel-${item.id}`}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 rounded-2xl"
    >
      <span
        className={cn(
          'font-serif text-lg font-medium transition-colors duration-200 sm:text-xl',
          isOpen ? 'text-charcoal' : 'text-charcoal-light',
        )}
      >
        {item.question}
      </span>

      <motion.span
        variants={reduceMotion ? undefined : CHEVRON_VARIANTS}
        animate={isOpen ? 'expanded' : 'collapsed'}
        transition={{ duration: 0.25 }}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
          isOpen
            ? 'bg-terracotta-50 text-terracotta-500'
            : 'bg-warm-grey-100 text-warm-grey-400',
        )}
      >
        <ChevronDown className="h-4 w-4" />
      </motion.span>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key={`panel-${item.id}`}
          id={`faq-panel-${item.id}`}
          role="region"
          aria-labelledby={`faq-trigger-${item.id}`}
          variants={reduceMotion ? undefined : ANSWER_VARIANTS}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 pt-0">
            <div className="mb-3 h-px bg-gradient-to-r from-terracotta-200/50 via-honey-200/40 to-transparent" />
            <p className="max-w-2xl text-base leading-relaxed text-warm-grey-600">
              {item.answer}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

const ContactCta: FC<{
  onContact: () => void
  reduceMotion: boolean | null
}> = ({ onContact, reduceMotion }) => {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 md:mt-24"
    >
      <div className="card-warm mx-auto max-w-xl px-8 py-10 text-center">
        {/* Decorative quote mark */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-terracotta-50 to-honey-50 shadow-soft"
          aria-hidden="true"
        >
          <Mail className="h-6 w-6 text-terracotta-500" />
        </div>

        <div className="mb-6 space-y-2">
          <p className="font-serif text-xl font-medium text-charcoal sm:text-2xl">
            {t('faq.cta.title', {
              defaultValue: "Can't find your answer?",
            })}
          </p>
          <p className="text-sm text-warm-grey-500">
            {t('faq.cta.subtitle', {
              defaultValue:
                "We're here to help — reach out any time.",
            })}
          </p>
        </div>

        <Button
          size="lg"
          className="shadow-warm transition-all hover:shadow-elevated"
          aria-label={t('contact.open', {
            defaultValue: 'Open contact form',
          })}
          onClick={onContact}
        >
          {t('faq.cta.button', { defaultValue: 'Get in touch' })}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// ── Main component ───────────────────────────────────────────────────
export const Faq: FC = () => {
  const { t } = useTranslation()
  const { open } = useModal()
  const reduceMotion = useReducedMotion()
  const content = useResolvedFaqs()
  const { openId, toggle } = useAccordion()

  const listVariants = reduceMotion ? undefined : ITEM_STAGGER
  const itemVariants = reduceMotion ? undefined : ITEM_ENTRANCE

  const openContact = useCallback(
    () => open('contact', { defaultSubject: t('faq.cta.subject', { defaultValue: 'Question' }) }),
    [open, t],
  )

  if (!content) return null

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section-spacious relative overflow-hidden bg-tint-cream"
    >
      {/* Noise texture */}
      <div className="noise-texture-subtle" aria-hidden="true" />

      {/* Decorative blobs */}
      <div
        className="organic-blob organic-blob-sage absolute -top-32 -left-40 h-80 w-80"
        aria-hidden="true"
      />
      <div
        className="organic-blob organic-blob-honey absolute -bottom-24 -right-32 h-64 w-64"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          variants={reduceMotion ? undefined : SECTION_ENTRANCE}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-12 text-center md:mb-16"
        >
          <h2
            id="faq-heading"
            className="text-editorial-lg mb-4 text-charcoal heading-accent-center"
          >
            {content.title}
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-warm-grey-500">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mx-auto max-w-3xl space-y-3"
        >
          {content.items.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
              variants={itemVariants}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {/* Contact CTA */}
        <ContactCta onContact={openContact} reduceMotion={reduceMotion} />
      </div>
    </section>
  )
}
