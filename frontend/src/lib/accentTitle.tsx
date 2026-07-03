import type { ReactNode } from "react";

/**
 * Presentation-only accent: italicise the final word of a title
 * ("Trouvez votre équilibre" / "What our clients say" → last word in <em>).
 * Works for any CMS/i18n string in any language; single-word titles pass
 * through untouched. The V2 signature typographic gesture — shared by
 * Hero, TestimonialBanner and upcoming sections.
 */
export function renderAccentTitle(title: string): ReactNode {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return title;
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <em>{last}</em>
    </>
  );
}
