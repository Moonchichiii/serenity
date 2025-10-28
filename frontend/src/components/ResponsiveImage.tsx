import { useState, type ImgHTMLAttributes } from "react";
import {
  getOptimizedUrl,
  generateSrcSet,
  extractPublicId,
} from "@/utils/cloudinary";
interface WagtailImage { id?: number; url: string; title?: string; width?: number; height?: number; }

interface CloudImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  image: WagtailImage | null | undefined;
  alt: string;
  priority?: boolean;
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  sizes?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const CloudImage = ({
  image, alt, priority = false, fit = "cover", sizes, className = "", onError, ...props
}: CloudImageProps) => {
  const [hasError, setHasError] = useState(false);

  if (!image?.url) {
    return (
      <div className={`bg-sage-100 flex items-center justify-center text-charcoal/40 ${className}`} role="img" aria-label={alt}>
        <span className="text-sm">{alt || "Image"}</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-sage-100 flex items-center justify-center text-charcoal/40 ${className}`} role="img" aria-label={alt}>
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

  return (
    <img
      src={getOptimizedUrl(urlOrPublicId)}
      srcSet={generateSrcSet(urlOrPublicId)}
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
