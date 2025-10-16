import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Star } from 'lucide-react'

type Testimonial = {
    id: number
    name: string
    rating: number
    text: string
    date: string
    avatar: string
}

const TESTIMONIALS: Testimonial[] = [
    { id: 1, name: 'Sarah Mitchell',  rating: 5, text: 'Absolutely transformative experience! The holistic approach really helped me find balance in my life. Highly recommend to anyone seeking wellness.', date: '2 weeks ago',  avatar: 'SM' },
    { id: 2, name: 'David Chen',      rating: 5, text: 'Professional, caring, and truly gifted. The sessions have made a remarkable difference in my stress levels and overall wellbeing.', date: '1 month ago', avatar: 'DC' },
    { id: 3, name: 'Emily Rodriguez', rating: 5, text: 'Best decision I ever made! The mindfulness practices changed how I approach daily challenges. Incredible support!', date: '3 weeks ago', avatar: 'ER' },
    { id: 4, name: 'Michael Thompson',rating: 5, text: 'Exceptional service and genuine care. The personalized approach made all the difference. I feel centered and peaceful.', date: '1 week ago',  avatar: 'MT' },
    { id: 5, name: 'Lisa Anderson',   rating: 5, text: 'Life-changing! The combination of traditional and modern techniques is brilliant. Highly recommend.', date: '2 months ago', avatar: 'LA' },
]

/** A pastel gradient that reads on dark AND light backgrounds */
const cardGradient =
    'linear-gradient(135deg, rgba(242,199,107,0.35), rgba(242,141,112,0.35), rgba(201,185,232,0.35))'

export default function TestimonialBanner() {
    const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const controls = useAnimation()
    const [paused, setPaused] = useState(false)

    // duplicate for seamless loop
    const items = useMemo(() => [...TESTIMONIALS, ...TESTIMONIALS], [])
    const containerRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (prefersReduced) return
        if (!trackRef.current) return

        const loopWidth = trackRef.current.scrollWidth / 2 // width of one set
        if (paused) {
            controls.stop()
            return
        }
        controls.start({
            x: [0, -loopWidth],
            transition: {
                duration: Math.max(18, loopWidth / 60), // ~60px/s
                ease: 'linear',
                repeat: Infinity,
            },
        })
    }, [controls, paused, prefersReduced])

    const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, __: PanInfo) => {
        setPaused(false)
    }

    return (
        <section
            aria-label="Client testimonials"
            className="mt-16"
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
            >
                <h3 className="text-3xl md:text-4xl font-heading font-bold text-charcoal">
                    Nos Avis
                </h3>
                <p className="text-charcoal/70 mt-2">
                    Ce que disent nos clients
                </p>
            </motion.div>

            <div
                ref={containerRef}
                className="relative overflow-hidden"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={() => setPaused(true)}
                onTouchEnd={() => setPaused(false)}
            >
                {/* soft top/bottom fade masks so the row feels premium */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />

                <motion.div
                    ref={trackRef}
                    className="flex gap-6 px-6 py-2"
                    animate={controls}
                    drag={!prefersReduced ? 'x' : false}
                    dragConstraints={{ left: -99999, right: 99999 }}
                    dragElastic={0.08}
                    onDragStart={() => setPaused(true)}
                    onDragEnd={onDragEnd}
                    style={{ width: 'max-content' }}
                >
                    {items.map((t, i) => (
                        <motion.article
                            key={`${t.id}-${i}`}
                            whileHover={!prefersReduced ? { y: -4 } : undefined}
                            className="
                                w-[320px] md:w-[360px] lg:w-[380px] flex-shrink-0
                                rounded-2xl p-5 md:p-6
                                bg-white/85 backdrop-blur
                                border-2 border-sage-200/40
                                shadow-soft hover:shadow-warm transition-all
                                relative
                            "
                            style={{
                                // thin gradient halo around card
                                boxShadow: `0 1px 0 0 rgba(255,255,255,.6) inset`,
                                backgroundImage: `linear-gradient(#fff,#fff), ${cardGradient}`,
                                backgroundOrigin: 'border-box',
                                backgroundClip: 'padding-box, border-box',
                            }}
                        >
                            <div className="flex items-center gap-1.5 mb-3">
                                {Array.from({ length: t.rating }).map((_, idx) => (
                                    <Star key={idx} className="w-5 h-5 text-honey-500 fill-honey-500" />
                                ))}
                            </div>

                            <p className="text-charcoal/80 leading-relaxed min-h-[88px]">
                                {t.text}
                            </p>

                            <div className="mt-5 pt-4 border-t border-sage-200/60 flex items-center gap-3">
                                <div
                                    className="
                                        grid place-items-center w-10 h-10 rounded-full
                                        text-sm font-semibold text-charcoal
                                        ring-2 ring-white/80
                                    "
                                    style={{
                                        background:
                                            'conic-gradient(from 180deg, var(--color-terracotta-300), var(--color-honey-300), var(--color-lavender-300))',
                                    }}
                                >
                                    <span className="bg-white/85 w-9 h-9 rounded-full grid place-items-center">
                                        {t.avatar}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-charcoal">{t.name}</p>
                                    <p className="text-sm text-charcoal/60">{t.date}</p>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
