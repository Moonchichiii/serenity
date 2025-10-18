import { useState } from 'react'

interface ResponsiveImageProps {
  src: string
  alt: string
  responsiveUrls?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  className?: string
  priority?: boolean
}

export function ResponsiveImage({
  src,
  alt,
  responsiveUrls,
  className = '',
  priority = false
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // If we have responsive URLs from Cloudinary, use them
  const srcSet = responsiveUrls
    ? `${responsiveUrls.mobile} 640w, ${responsiveUrls.tablet} 1024w, ${responsiveUrls.desktop} 1920w`
    : undefined

  const sizes = responsiveUrls
    ? '(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px'
    : undefined

  const handleLoad = () => setIsLoading(false)
  const handleError = () => {
    setIsLoading(false)
    setError(true)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !error && (
        <div className="absolute inset-0 bg-sage-100 animate-pulse" />
      )}

      {error ? (
        <div className="absolute inset-0 bg-sand-100 flex items-center justify-center">
          <p className="text-sm text-charcoal/60">Failed to load image</p>
        </div>
      ) : (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  )
}
