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
const FADE_IN_TRANSITION: Transition = { duration: 0.6 }

const SECTION_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: FADE_IN_TRANSITION },
}

const ITEM_STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const ITEM_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
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
      'rounded-2xl border transition-colors duration-300',
      isOpen
        ? 'border-sage-200/60 bg-white shadow-sm'
        : 'border-stone-100 bg-white/60 hover:border-stone-200',
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
          isOpen ? 'text-stone-900' : 'text-stone-700',
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
            ? 'bg-sage-100 text-sage-700'
            : 'bg-stone-100 text-stone-400',
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
            <div className="mb-3 h-px bg-gradient-to-r from-sage-200/40 via-stone-200/60 to-transparent" />
            <p className="max-w-2xl text-base leading-relaxed text-stone-600">
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
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
      className="mt-14 flex flex-col items-center gap-5 text-center md:mt-20"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 shadow-sm">
        <Mail className="h-6 w-6 text-sage-600" />
      </div>

      <div className="space-y-1.5">
        <p className="font-serif text-xl font-medium text-stone-900 sm:text-2xl">
          {t('faq.cta.title', {
            defaultValue: "Can't find your answer?",
          })}
        </p>
        <p className="text-sm text-stone-500">
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
      className="section-padding relative overflow-hidden bg-stone-50/40"
    >
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(163,177,138,0.08),transparent)]"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
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
            className="mb-4 font-serif text-4xl font-medium text-stone-900 sm:text-5xl"
          >
            {content.title}
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-stone-600">
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
