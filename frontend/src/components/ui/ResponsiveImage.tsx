import type { ImgHTMLAttributes } from 'react'
import type { ResponsiveImage } from '@/types/api'
import { cn } from '@/lib/utils'

type Props = {
  image: ResponsiveImage | null | undefined
  alt?: string
  priority?: boolean

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
      src={image.src}
      srcSet={computedSrcSet}
      sizes={computedSizes}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      alt={a}
      loading={priority ? 'eager' : 'lazy'}
      decoding={decoding}
      className={cn(className)}
      {...rest}
      {...({
        fetchPriority: priority ? 'high' : 'auto',
      } as unknown)}
    />
  )
}
