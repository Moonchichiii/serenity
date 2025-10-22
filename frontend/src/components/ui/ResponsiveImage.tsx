import { useState, type ImgHTMLAttributes } from "react"

const WIDTHS = [640, 768, 1024, 1280, 1536, 1920, 2560]

interface WagtailImage {
  id?: number
  url: string
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

const isCloudinary = (url: string) =>
  url.includes("cloudinary.com") && url.includes("/image/upload/")

function getOptimizedUrl(url: string, width?: number): string {
  if (!url) return ""
  if (!isCloudinary(url)) return url

  const parts = url.split("/image/upload/")
  const base = parts[0]
  let publicId = parts[1] || ""

  publicId = publicId.replace(/^s--[A-Za-z0-9_-]{10,}--\//, "")
  publicId = publicId.replace(/(^\/|\/$)/g, "")

  const transforms = ["f_auto", "q_auto", "c_fill", "g_auto"]
  if (width) {
    transforms.push(`w_${width}`, "dpr_auto")
  } else {
    transforms.push("w_auto", "dpr_auto")
  }

  const transformStr = transforms.join(",")

  return `${base}/image/upload/${transformStr}/${publicId}`
}

function generateSrcSet(url: string): string {
  return WIDTHS.map((w) => `${getOptimizedUrl(url, w)} ${w}w`).join(", ")
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

  const publicId = isCloudinary(image.url)
    ? image.url.split("/image/upload/")[1] || image.url
    : image.url

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // eslint-disable-next-line no-console
    console.error("[CloudImage] Failed to load:", {
      publicId,
      alt,
      originalUrl: image.url,
    })
    setHasError(true)
    onError?.(e)
  }

  return (
    <img
      src={getOptimizedUrl(image.url)}
      srcSet={generateSrcSet(image.url)}
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

export function getOptimizedBackgroundUrl(url: string, width = 1920): string {
  return getOptimizedUrl(url, width)
}

export function getOptimizedThumbnail(url: string, size = 200): string {
  if (!url) return ""
  if (!isCloudinary(url)) return url

  const parts = url.split("/image/upload/")
  const base = parts[0]
  let publicId = parts[1] || ""
  publicId = publicId.replace(/^\/|\/$/g, "")

  const transforms = [
    "f_auto",
    "q_auto",
    `w_${size}`,
    `h_${size}`,
    "c_fill",
    "g_auto",
    "dpr_auto",
  ].join(",")

  return `${base}/image/upload/${transforms}/${publicId}`
}
