from __future__ import annotations

from collections.abc import Iterable
from typing import Any, Final

import cloudinary.utils
from wagtail.images.models import Image

# ── Width presets ─────────────────────────────────────────────────────
# Standard responsive widths covering mobile → desktop
_BASE_WIDTHS: Final[tuple[int, ...]] = (360, 480, 640, 768, 1024, 1280, 1536)

# Extended set including large/retina displays — used for hero and
# full-bleed backgrounds where 100vw sizing means the browser may
# request very large candidates on 1440p+ screens.
_EXTENDED_WIDTHS: Final[tuple[int, ...]] = (*_BASE_WIDTHS, 1920, 2560)

# Default export — most call-sites should use this directly
IMG_WIDTHS: Final[tuple[int, ...]] = _BASE_WIDTHS
IMG_WIDTHS_HERO: Final[tuple[int, ...]] = _EXTENDED_WIDTHS

# ── Size descriptors ──────────────────────────────────────────────────
DEFAULT_SIZES: Final[str] = (
    "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
)
HERO_SIZES: Final[str] = "100vw"
SECTION_HERO_SIZES: Final[str] = "(max-width: 1024px) 100vw, 1280px"

# ── Quality presets ───────────────────────────────────────────────────
_QUALITY_MAP: Final[dict[str, str]] = {
    "eco": "auto:eco",
    "good": "auto:good",
}
_DEFAULT_QUALITY: Final[str] = "eco"

# Index into the widths list for the default `src` attribute.
# Picks the 3rd entry (index 2) when available — a reasonable
# middle-ground that works before srcset kicks in.
_DEFAULT_SRC_INDEX: Final[int] = 2


# ── Internal helpers ──────────────────────────────────────────────────
def _file_url(img: Image) -> str | None:
    """Return the direct file URL, or ``None`` if unavailable."""
    try:
        f = getattr(img, "file", None)
        return getattr(f, "url", None) if f else None
    except Exception:
        return None


def _cloudinary_public_id(img: Image) -> str | None:
    """
    Extract the Cloudinary ``public_id`` from the image file name.

    Returns ``None`` when the file appears to be a local/media upload
    rather than a Cloudinary-managed asset.
    """
    try:
        f = getattr(img, "file", None)
        name = getattr(f, "name", None) if f else None
        if not name:
            return None
        # Local uploads start with a media prefix or bare slash
        if name.startswith(("media/", "media\\", "/")):
            return None
        return str(name)
    except Exception:
        return None


def _cloudinary_image_url(
    public_id: str,
    width: int,
    *,
    quality: str = _DEFAULT_QUALITY,
) -> str:
    """Build an optimised Cloudinary delivery URL."""
    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        width=width,
        crop="fill",
        gravity="auto",
        quality=_QUALITY_MAP.get(quality, _QUALITY_MAP[_DEFAULT_QUALITY]),
        fetch_format="auto",
        flags="progressive",
        secure=True,
    )
    return url


def _build_srcset(
    public_id: str,
    widths: list[int],
    quality: str,
) -> str:
    """Generate a comma-separated ``srcset`` string."""
    return ", ".join(
        f"{_cloudinary_image_url(public_id, w, quality=quality)} {w}w"
        for w in widths
    )


def _local_fallback(img: Image) -> dict[str, Any]:
    """Return a minimal payload for non-Cloudinary images."""
    return {
        "title": getattr(img, "title", "") or "",
        "width": getattr(img, "width", None),
        "height": getattr(img, "height", None),
        "src": _file_url(img),
        "srcset": None,
        "sizes": None,
    }


# ── Public API ────────────────────────────────────────────────────────
def serialize_image(
    img: Image | None,
    *,
    sizes: str = DEFAULT_SIZES,
    widths: Iterable[int] = IMG_WIDTHS,
    quality: str = _DEFAULT_QUALITY,
) -> dict[str, Any] | None:
    """
    Serialize a Wagtail ``Image`` into a responsive-ready dictionary.

    The returned shape matches the frontend ``ResponsiveImage`` interface::

        {
            "title":  str,
            "width":  int | None,
            "height": int | None,
            "src":    str | None,
            "srcset": str | None,
            "sizes":  str | None,
        }

    For hero / full-bleed backgrounds, pass the extended width set::

        serialize_image(
            page.hero_image,
            sizes=HERO_SIZES,
            widths=IMG_WIDTHS_HERO,
        )
    """
    if img is None:
        return None

    public_id = _cloudinary_public_id(img)
    if not public_id:
        return _local_fallback(img)

    widths_list = list(widths) or [640]
    default_src_width = widths_list[min(_DEFAULT_SRC_INDEX, len(widths_list) - 1)]

    try:
        src = _cloudinary_image_url(public_id, default_src_width, quality=quality)
        srcset = _build_srcset(public_id, widths_list, quality)
    except Exception:
        return None

    return {
        "title": getattr(img, "title", "") or "",
        "width": getattr(img, "width", None),
        "height": getattr(img, "height", None),
        "src": src,
        "srcset": srcset,
        "sizes": sizes,
    }
