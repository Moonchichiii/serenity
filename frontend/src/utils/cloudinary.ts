export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dbzlaawqt";


const WIDTHS = [360, 480, 640, 768, 1024, 1280, 1536];

export function extractPublicId(url: string): string | null {
  if (!url) return null;
  if (!url.startsWith("http")) return url;
  const uploadMatch = url.match(/\/image\/(?:upload|fetch)\/(?:v\d+\/)?(.+?)(?:\.\w+)?(?:$|\?)/);
  if (uploadMatch?.[1]) return uploadMatch[1];
  const legacy = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return legacy?.[1] ?? null;
}

export function buildCloudinaryUrl(publicId: string, transformations: string[] = []): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const t = transformations.length ? `/${transformations.join(",")}` : "";
  return `${baseUrl}${t}/${publicId}`;
}

export function getOptimizedUrl(
  publicIdOrUrl: string,
  width?: number,
  quality: "eco" | "good" = "eco",
  capDpr2 = false
): string {
  if (!publicIdOrUrl) return "";
  const publicId = extractPublicId(publicIdOrUrl);
  if (!publicId) return publicIdOrUrl;
  const q = quality === "good" ? "q_auto:good" : "q_auto:eco";
  const transforms = ["f_auto", q, "c_fill", "g_auto"];
  if (width) transforms.push(`w_${width}`);
  transforms.push(capDpr2 ? "dpr_2.0" : "dpr_auto");
  return buildCloudinaryUrl(publicId, transforms);
}

export function generateSrcSet(
  publicIdOrUrl: string,
  quality: "eco" | "good" = "eco",
  capDpr2 = false,
  maxWidth?: number
): string {
  const widths = maxWidth ? WIDTHS.filter((w) => w <= maxWidth) : WIDTHS;
  return widths
    .map((w) => {
      const q = w < 640 && quality === "good" ? "eco" : quality;
      return `${getOptimizedUrl(publicIdOrUrl, w, q as "eco" | "good", capDpr2)} ${w}w`;
    })
    .join(", ");
}

export function getOptimizedBackgroundCover(
  publicIdOrUrl: string,
  targetWidth = 640,
  quality: "eco" | "good" = "eco"
): string {
  const w = Math.round(targetWidth * 1.2);
  return getOptimizedUrl(publicIdOrUrl, w, quality, false);
}

export function getOptimizedThumbnail(publicIdOrUrl: string, size = 200): string {
  if (!publicIdOrUrl) return "";
  const publicId = extractPublicId(publicIdOrUrl);
  if (!publicId) return "";
  const transforms = ["f_auto", "q_auto:eco", `w_${size}`, `h_${size}`, "c_fill", "g_auto", "dpr_auto"];
  return buildCloudinaryUrl(publicId, transforms);
}

export function getResponsivePosterUrl(
  publicIdOrUrl: string,
  viewportWidth: number,
  opts: { quality?: "eco" | "good"; min?: number; max?: number } = {}
): string {
  const { quality = "eco", min = 480, max = 1440 } = opts;
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const target = Math.round(Math.min(Math.max(viewportWidth * dpr, min), max) * 1.1);
  return getOptimizedUrl(publicIdOrUrl, target, quality, false);
}
