import type { ImgHTMLAttributes } from 'react'
import type { ResponsiveImage } from '@/types/api'
import { cn } from '@/lib/utils'
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinary'

type Props = {
  image: ResponsiveImage | null | undefined
  alt?: string
  priority?: boolean
  optimizeWidth?: number

  /** Optional overrides (rare, but useful) */
  sizes?: string
  srcSet?: string
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'sizes' | 'alt' | 'loading'
>

export default function ResponsiveImage({
  image,
  alt,
  priority = false,
  optimizeWidth,
  className,
  decoding = 'async',
  sizes,
  srcSet,
  ...rest
}: Props) {
  if (!image?.src) return null

  const a = alt ?? image.title ?? ''
  const computedSizes = sizes ?? image.sizes ?? undefined
  const computedSrcSet = srcSet ?? image.srcset ?? undefined

  return (
    <img
      src={getOptimizedCloudinaryUrl(image.src, optimizeWidth)}
      srcSet={computedSrcSet}
      sizes={computedSizes}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      alt={a}
      loading={priority ? 'eager' : 'lazy'}
      decoding={decoding}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn(className)}
      {...rest}
    />
  )
}
