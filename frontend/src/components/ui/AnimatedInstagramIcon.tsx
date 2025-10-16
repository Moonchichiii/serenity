import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Instagram } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
    size?: number
    href?: string
    magnetic?: boolean
    className?: string
    ariaLabel?: string
}

const AnimatedInstagramIcon = ({
    size = 44,
    href = 'https://instagram.com/yourprofile',
    magnetic = true,
    className = '',
    ariaLabel = 'Follow us on Instagram',
}: Props) => {
    const ref = useRef<HTMLAnchorElement>(null)
    const [hovered, setHovered] = useState(false)

    // Respect reduced-motion preference
    const prefersReduced = typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // magnetic effect (subtle)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { damping: 20, stiffness: 300 })
    const springY = useSpring(y, { damping: 20, stiffness: 300 })

    useEffect(() => {
        if (!magnetic || prefersReduced) return
        const onMove = (e: MouseEvent) => {
            if (!ref.current) return
            const r = ref.current.getBoundingClientRect()
            const cx = r.left + r.width / 2
            const cy = r.top + r.height / 2
            const dx = e.clientX - cx
            const dy = e.clientY - cy
            const dist = Math.hypot(dx, dy)

            // pull within ~120px, capped
            if (dist < 120) {
                const pull = 0.25
                x.set(Math.max(-12, Math.min(12, dx * pull)))
                y.set(Math.max(-12, Math.min(12, dy * pull)))
            } else {
                x.set(0); y.set(0)
            }
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
    }, [magnetic, prefersReduced, x, y])

    const reset = () => {
        setHovered(false)
        x.set(0); y.set(0)
    }

    return (
        <motion.a
            ref={ref}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className={`group relative inline-flex items-center justify-center rounded-full ${className}`}
            style={{ width: size, height: size, x: springX, y: springY }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={reset}
            whileHover={!prefersReduced ? { scale: 1.06 } : undefined}
            whileTap={{ scale: 0.96 }}
        >
            {/* warm gradient + glow */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background:
                        'linear-gradient(135deg, #FEDA77 0%, #F58529 20%, #DD2A7B 45%, #8134AF 70%, #515BD4 100%)',
                    filter: 'saturate(0.9) brightness(1.08)',
                }}
                animate={!prefersReduced ? { opacity: hovered ? 1 : 0.96 } : undefined}
                transition={{ duration: 0.2 }}
            />
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background:
                        'radial-gradient(60% 60% at 50% 50%, rgba(221, 42, 123, 0.35), transparent 70%)',
                    filter: 'blur(8px)',
                }}
                animate={!prefersReduced ? { opacity: hovered ? 0.9 : 0.6 } : undefined}
                transition={{ duration: 0.3 }}
            />

            {/* glassy chip */}
            <div
                className="relative z-10 flex h-full w-full items-center justify-center rounded-full"
                style={{
                    background: 'rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    boxShadow:
                        hovered
                            ? '0 14px 28px -12px rgba(221,42,123,0.35)'
                            : '0 8px 20px -12px rgba(81,91,212,0.28)',
                }}
            >
                <Instagram
                    size={Math.round(size * 0.5)}
                    className="text-white"
                    strokeWidth={1.6}
                />
            </div>
        </motion.a>
    )
}

export default AnimatedInstagramIcon
