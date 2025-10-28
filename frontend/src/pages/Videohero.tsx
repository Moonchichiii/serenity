import { motion } from 'framer-motion'

interface VideoHeroProps {
    cloudinaryVideoId: string // e.g., 'samples/sea-turtle'
}

export function VideoHero({ cloudinaryVideoId }: VideoHeroProps) {
    const cloudName = 'dbzlaawqt'

    // Use the provided direct video URL for all sources while keeping the rest of the code unchanged
    const directVideoUrl =
        'https://res.cloudinary.com/dbzlaawqt/video/upload/v1761680449/6629947-hd_1366_720_25fps_s6hrx4.mp4'

    const getVideoUrl = (quality: string, width: number) => directVideoUrl

    return (
        <section
            id="video-hero"
            className="relative min-h-[70vh] flex items-center justify-center overflow-hidden scroll-mt-28"
            aria-label="Video hero"
        >
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden="true"
                    poster={`https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_1920,f_jpg/${cloudinaryVideoId}.jpg`}
                >
                    <source src={getVideoUrl('50', 640)} type="video/mp4" media="(max-width: 640px)" />
                    <source src={getVideoUrl('70', 1024)} type="video/mp4" media="(max-width: 1024px)" />
                    <source src={getVideoUrl('80', 1920)} type="video/mp4" media="(min-width: 1025px)" />
                    <source src={getVideoUrl('70', 1280)} type="video/mp4" />
                </video>

                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Keep animations but no visible text or controls */}
            <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                />
            </div>
        </section>
    )
}
