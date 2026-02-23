export interface ResponsiveImage {
  title: string
  width?: number | null
  height?: number | null
  src: string | null
  srcset?: string | null
  sizes?: string | null
}

export interface WagtailHeroSlide {
  title_en?: string
  title_fr?: string
  subtitle_en?: string
  subtitle_fr?: string
  image: ResponsiveImage | null
}

export interface WagtailSpecialty {
  title_en?: string
  title_fr?: string
  image?: ResponsiveImage | null
}
