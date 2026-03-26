import type { ImgHTMLAttributes } from "react";

import type { ResponsiveImage } from "@/types/api";
import { cn } from "@/lib/utils";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";

type Props = {
  image: ResponsiveImage | null | undefined;
  alt?: string;
  priority?: boolean;
  optimizeWidth?: number;
  sizes?: string;
  srcSet?: string;
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes" | "alt" | "loading"
>;

const DEFAULT_WIDTHS = [320, 480, 640, 768, 960, 1280, 1536, 1920];

function buildResponsiveSrcSet(
  src: string,
  originalWidth?: number,
  widths: number[] = DEFAULT_WIDTHS,
): string {
  const cappedWidths = widths.filter((width) =>
    originalWidth ? width <= originalWidth : true,
  );

  const finalWidths =
    cappedWidths.length > 0
      ? cappedWidths
      : originalWidth
        ? [originalWidth]
        : [1280];

  return finalWidths
    .map(
      (width) =>
        `${getOptimizedCloudinaryUrl(src, width)} ${width}w`,
    )
    .join(", ");
}

function getFallbackWidth(
  optimizeWidth: number | undefined,
  originalWidth?: number,
): number {
  const requested = optimizeWidth ?? 1280;
  if (!originalWidth) return requested;
  return Math.min(requested, originalWidth);
}

/**
 * True when the backend already serialized this image with
 * Cloudinary transforms (srcset + optimized src).
 * In that case we must NOT re-transform the src.
 */
function isBackendOptimized(
  image: ResponsiveImage,
): boolean {
  return Boolean(image.srcset && image.src?.includes("/upload/"));
}

export default function ResponsiveImage({
  image,
  alt,
  priority = false,
  optimizeWidth,
  className,
  decoding = "async",
  sizes,
  srcSet,
  ...rest
}: Props) {
  if (!image?.src) return null;

  const resolvedAlt = alt ?? image.title ?? "";
  const resolvedSizes = sizes ?? image.sizes ?? "100vw";

  // Backend provides srcset → use it. Otherwise build client-side.
  const backendOwned = isBackendOptimized(image);

  const resolvedSrcSet =
    srcSet ??
    image.srcset ??
    buildResponsiveSrcSet(image.src, image.width ?? undefined);

  // If backend already optimized the src, use it as-is.
  // Only apply frontend transforms for non-CMS images (local, etc.)
  const resolvedSrc = backendOwned
    ? image.src
    : getOptimizedCloudinaryUrl(
        image.src,
        getFallbackWidth(optimizeWidth, image.width ?? undefined),
      );

  return (
    <img
      src={resolvedSrc}
      srcSet={resolvedSrcSet}
      sizes={resolvedSizes}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      alt={resolvedAlt}
      loading={priority ? "eager" : "lazy"}
      decoding={decoding}
      fetchPriority={priority ? "high" : "auto"}
      className={cn(className)}
      {...rest}
    />
  );
}
