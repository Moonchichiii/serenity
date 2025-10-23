import { useState, type ImgHTMLAttributes } from "react"

const WIDTHS = [640, 768, 1024, 1280, 1536, 1920, 2560]
const CLOUDINARY_CLOUD_NAME = "dbzlaawqt"

interface WagtailImage {
  id?: number
  url: string  // Now this is the public_id
  title?: string
  width?: number
  height?: number
}

interface CloudImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  image: WagtailImage | null | undefined
  alt: string
  priority?: boolean
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  sizes?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

function buildCloudinaryUrl(publicId: string, transformations: string[] = []): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`
  const transforms = transformations.length > 0 ? `/${transformations.join(",")}` : ""
  return `${baseUrl}${transforms}/${publicId}`
}

function getOptimizedUrl(publicId: string, width?: number): string {
  if (!publicId) return ""

  const transforms = ["f_auto", "q_auto", "c_fill", "g_auto"]
  if (width) {
    transforms.push(`w_${width}`, "dpr_auto")
  } else {
    transforms.push("w_auto", "dpr_auto")
  }

  return buildCloudinaryUrl(publicId, transforms)
}

function generateSrcSet(publicId: string): string {
  return WIDTHS.map((w) => `${getOptimizedUrl(publicId, w)} ${w}w`).join(", ")
}

export const CloudImage = ({
  image,
  alt,
  priority = false,
  fit = "cover",
  sizes,
  className = "",
  onError,
  ...props
}: CloudImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (!image?.url) {
    return (
      <div
        className={`bg-sage-100 flex items-center justify-center text-charcoal/40 ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">{alt || "Image"}</span>
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={`bg-sage-100 flex items-center justify-center text-charcoal/40 ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-xs">⚠️ Image failed to load</span>
      </div>
    )
  }

  const objectFitClass = `object-${fit}`
  const publicId = image.url

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("[CloudImage] Failed to load:", {
      publicId,
      alt,
      generatedUrl: getOptimizedUrl(publicId),
    })
    setHasError(true)
    onError?.(e)
  }

  return (
    <img
      src={getOptimizedUrl(publicId)}
      srcSet={generateSrcSet(publicId)}
      sizes={sizes}
      alt={alt || image.title || ""}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? ("high" as const) : ("auto" as const)}
      className={`${objectFitClass} ${className}`.trim()}
      onError={handleError}
      width={image.width}
      height={image.height}
      {...props}
    />
  )
}

export default CloudImage

export function getOptimizedBackgroundUrl(publicId: string, width = 1920): string {
  return getOptimizedUrl(publicId, width)
}

export function getOptimizedThumbnail(publicId: string, size = 200): string {
  if (!publicId) return ""
  const transforms = ["f_auto", "q_auto", `w_${size}`, `h_${size}`, "c_fill", "g_auto", "dpr_auto"]
  return buildCloudinaryUrl(publicId, transforms)
}
