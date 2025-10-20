import { useState } from 'react'

type ResponsiveUrls = { mobile?: string; tablet?: string; desktop?: string }

interface Props {
  src: string
  alt: string
  className?: string
  priority?: boolean
  width?: number
  height?: number
  // Keep for later, but unused while Cloudinary blocks unsigned transforms
  responsiveUrls?: ResponsiveUrls
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
}: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !error && <div className="absolute inset-0 bg-sage-100 animate-pulse" />}

      {error ? (
        <div className="absolute inset-0 bg-sand-100 flex items-center justify-center">
          <p className="text-sm text-charcoal/60">Failed to load image</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          // Reserve space → better CLS/LCP
          width={width}
          height={height}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError(true)
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          draggable={false}
        />
      )}
    </div>
  )
}
