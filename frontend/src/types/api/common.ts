export interface ResponsiveImage {
  title: string
  width?: number | null
  height?: number | null
  src: string | null
  srcset?: string | null
  sizes?: string | null
}

/** A ResponsiveImage whose `src` is guaranteed non-null. */
export type RenderableImage = Omit<ResponsiveImage, 'src'> & { src: string }

export interface WagtailHeroSlide {
  /** Present when backend serializer includes `id` (recommended). */
  id?: number
  title_en?: string
  title_fr?: string
  subtitle_en?: string
  subtitle_fr?: string
  image: ResponsiveImage | null
}

export interface WagtailSpecialty {
  title_en?: string
  title_fr?: string
  image: ResponsiveImage | null
}
