/**
 * Brand glyphs (Instagram, Facebook) as inline SVG.
 *
 * lucide-react removed all brand icons in v1.x — importing { Instagram }
 * or { Facebook } from "lucide-react" now resolves to `undefined` and
 * crashes React at render time. These components reproduce the same
 * outline style (24×24 viewBox, stroke: currentColor) so they are
 * drop-in replacements with the same size/strokeWidth/className API.
 */

type GlyphProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function InstagramGlyph({
  size = 24,
  strokeWidth = 2,
  className,
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function FacebookGlyph({
  size = 24,
  strokeWidth = 2,
  className,
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
