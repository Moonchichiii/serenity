import { useState, type ImgHTMLAttributes } from "react";
import { getOptimizedUrl, generateSrcSet, extractPublicId } from "@/utils/cloudinary";

interface WagtailImage {
  id?: number;
  url: string;
  title?: string;
  width?: number;
  height?: number;
}

interface CloudImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  image: WagtailImage | null | undefined;
  alt: string;
  priority?: boolean;
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  sizes?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const CloudImage = ({
  image,
  alt,
  priority = false,
  fit = "cover",
  // Heuristic default for grids/cards to avoid 100vw over-fetch
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
  onError,
  ...props
}: CloudImageProps) => {
  const [hasError, setHasError] = useState(false);

  if (!image?.url) {
    return (
      <div
        className={`bg-sage-100 flex items-center justify-center text-charcoal/40 ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">{alt || "Image"}</span>
      </div>
    );
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
    );
  }

  const objectFitClass = `object-${fit}`;
  const urlOrPublicId = image.url;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("[CloudImage] Failed to load:", {
      originalUrl: urlOrPublicId,
      extractedPublicId: extractPublicId(urlOrPublicId),
      alt,
      generatedUrl: getOptimizedUrl(urlOrPublicId),
    });
    setHasError(true);
    onError?.(e);
  };

  // Always use eco quality for optimal mobile performance
  const quality: "eco" | "good" = "eco";


  const vw = typeof window !== "undefined" ? Math.max(window.innerWidth || 0, 360) : 768;
  const dprCap = 2;
  const maxCandidate = priority
    ? Math.max(768, Math.min(vw * dprCap, 1280))
    : Math.max(480, Math.min(vw * dprCap, 1024));

  const fallbackWidth = priority ? Math.min(896, Math.floor(vw * dprCap)) : 640;

  return (
    <img
      src={getOptimizedUrl(urlOrPublicId, fallbackWidth, quality)}
      srcSet={generateSrcSet(urlOrPublicId, quality, undefined, maxCandidate)}
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
  );
};

export default CloudImage;
