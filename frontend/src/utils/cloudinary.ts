export const CLOUDINARY_CLOUD_NAME =
  import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'] || 'dbzlaawqt'

/**
 * Extracts public ID from both Image and Video URLs
 */
export function extractPublicId(url: string): string | null {
  if (!url) return null
  if (!url.startsWith('http')) return url

  // Match /image/upload or /video/upload
  const m = url.match(
    /\/(?:image|video)\/(?:upload|fetch)\/(?:v\d+\/)?(.+?)(?:\.\w+)?(?:$|\?)/,
  )
  if (m?.[1]) return m[1]

  // Legacy fallback
  const legacy = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?(?:$|\?)/)
  return legacy?.[1] ?? null
}

export function buildCloudinaryUrl(
  publicId: string,
  transformations: string[] = [],
): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`
  const t = transformations.length ? `/${transformations.join(',')}` : ''
  return `${baseUrl}${t}/${publicId}`
}

// ── VIDEO HELPERS (Keep these) ──────────────────────────────────────

export function buildCloudinaryVideoUrl(
  publicId: string,
  transformations: string[] = [],
): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`
  const t = transformations.length ? `/${transformations.join(',')}` : ''
  const cleanId = publicId.replace(/\.mp4$/i, '')
  return `${baseUrl}${t}/${cleanId}.mp4`
}

export function getOptimizedVideoUrl(
  publicIdOrUrl: string,
  width?: number,
  quality: 'eco' | 'good' = 'eco',
): string {
  if (!publicIdOrUrl) return ''
  const publicId = extractPublicId(publicIdOrUrl)
  // If we can't extract an ID, return original (it might be a direct link)
  if (!publicId) return publicIdOrUrl

  const q = quality === 'good' ? 'q_auto:good' : 'q_auto:eco'
  const transforms = ['f_mp4', q]

  if (width) transforms.push(`w_${width}`, 'c_fill')

  return buildCloudinaryVideoUrl(publicId, transforms)
}

// ── IMAGE HELPERS (Legacy / Non-CMS usage only) ─────────────────────
// NOTE: CMS images now use the ResponsiveImage type and do not need these helpers.

export function getOptimizedUrl(
  publicIdOrUrl: string,
  width?: number,
  quality: 'eco' | 'good' = 'eco',
): string {
  if (!publicIdOrUrl) return ''
  const publicId = extractPublicId(publicIdOrUrl)
  if (!publicId) return publicIdOrUrl

  const q = quality === 'good' ? 'q_auto:good' : 'q_auto:eco'
  const transforms = ['f_auto', q, 'c_fill', 'g_auto']
  if (width) transforms.push(`w_${width}`)

  // PERFORMANCE: Cap DPR at 1.5
  transforms.push('dpr_1.5')

  return buildCloudinaryUrl(publicId, transforms)
}

export function getOptimizedBackgroundCover(
  publicIdOrUrl: string,
  targetWidth = 640,
  quality: 'eco' | 'good' = 'eco',
): string {
  const w = Math.round(targetWidth * 1.2)
  return getOptimizedUrl(publicIdOrUrl, w, quality)
}

export function getOptimizedThumbnail(
  publicIdOrUrl: string,
  size = 200,
): string {
  if (!publicIdOrUrl) return ''
  const publicId = extractPublicId(publicIdOrUrl)
  if (!publicId) return ''
  const transforms = [
    'f_auto',
    'q_auto:eco',
    `w_${size}`,
    `h_${size}`,
    'c_fill',
    'g_auto',
    'dpr_auto',
  ]
  return buildCloudinaryUrl(publicId, transforms)
}
