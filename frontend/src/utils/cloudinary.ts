const CLOUDINARY_CLOUD_NAME = "dbzlaawqt";
const WIDTHS = [640, 768, 1024, 1280, 1536, 1920, 2560];

export function extractPublicId(url: string): string | null {
  if (!url) return null;
  if (!url.startsWith("http")) return url;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match?.[1] ?? null;
}

export function buildCloudinaryUrl(publicId: string, transformations: string[] = []): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transforms = transformations.length ? `/${transformations.join(",")}` : "";
  return `${baseUrl}${transforms}/${publicId}`;
}

export function getOptimizedUrl(publicIdOrUrl: string, width?: number): string {
  if (!publicIdOrUrl) return "";
  const publicId = extractPublicId(publicIdOrUrl);
  if (!publicId) return publicIdOrUrl;
  const transforms = ["f_auto", "q_auto:eco", "c_fill", "g_auto"];
  if (width) transforms.push(`w_${width}`, "dpr_auto");
  else transforms.push("w_auto", "dpr_auto");
  return buildCloudinaryUrl(publicId, transforms);
}

export function generateSrcSet(publicIdOrUrl: string): string {
  return WIDTHS.map((w) => `${getOptimizedUrl(publicIdOrUrl, w)} ${w}w`).join(", ");
}

export function getOptimizedBackgroundUrl(publicIdOrUrl: string, width = 1920): string {
  return getOptimizedUrl(publicIdOrUrl, width);
}

export function getOptimizedThumbnail(publicIdOrUrl: string, size = 200): string {
  if (!publicIdOrUrl) return "";
  const publicId = extractPublicId(publicIdOrUrl);
  if (!publicId) return "";
    const transforms = ["f_auto", "q_auto:eco", `w_${size}`, `h_${size}`, "c_fill", "g_auto", "dpr_auto"];
  return buildCloudinaryUrl(publicId, transforms);
}
