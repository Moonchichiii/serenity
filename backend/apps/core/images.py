from __future__ import annotations

from collections.abc import Iterable
from typing import Any

import cloudinary.utils
from wagtail.images.models import Image

# Responsive widths (tune if you want fewer variants)
IMG_WIDTHS: tuple[int, ...] = (360, 480, 640, 768, 1024, 1280, 1536)

DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

# Requested contracts
HERO_SIZES = "100vw"
SECTION_HERO_SIZES = "(max-width: 1024px) 100vw, 1280px"


def _file_url(img: Image) -> str | None:
    try:
        f = getattr(img, "file", None)
        return getattr(f, "url", None) if f else None
    except Exception:
        return None


def _cloudinary_public_id(img: Image) -> str | None:
    """
    django-cloudinary-storage stores the Cloudinary public_id in file.name.
    In local dev (FileSystemStorage) this will be a path-like name; we treat that
    as 'no cloudinary' and fall back to file.url.
    """
    try:
        f = getattr(img, "file", None)
        name = getattr(f, "name", None) if f else None
        if not name:
            return None

        # Heuristic: local storage paths typically look like "media/..."
        if name.startswith(("media/", "media\\", "/")):
            return None

        return str(name)
    except Exception:
        return None


def _cloudinary_image_url(public_id: str, width: int, *, quality: str = "eco") -> str:
    """
    Performance defaults:
    - fetch_format="auto" -> AVIF/WebP when supported, else best fallback
    - quality="auto:eco"/"auto:good" -> Cloudinary chooses best tradeoff
    - crop="fill", gravity="auto" -> stable layout + smart cropping
    - flags="progressive" -> helps JPEGs (no harm to webp/avif)
    """
    q = "auto:eco" if quality == "eco" else "auto:good"

    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        width=width,
        crop="fill",
        gravity="auto",
        quality=q,
        fetch_format="auto",
        flags="progressive",
        secure=True,
    )
    return url


def serialize_image(
    img: Image | None,
    *,
    sizes: str = DEFAULT_SIZES,
    widths: Iterable[int] = IMG_WIDTHS,
    quality: str = "eco",
) -> dict[str, Any] | None:
    if not img:
        return None

    title = getattr(img, "title", "") or ""
    width = getattr(img, "width", None)
    height = getattr(img, "height", None)

    public_id = _cloudinary_public_id(img)

    # Local-dev fallback: serve direct file url (still includes width/height).
    if not public_id:
        return {
            "title": title,
            "width": width,
            "height": height,
            "src": _file_url(img),
            "srcset": None,
            "sizes": None,
        }

    widths_list = list(widths)
    if not widths_list:
        widths_list = [640]

    # Choose a sensible default "src" width (mid-ish), not the smallest.
    default_src_width = widths_list[min(2, len(widths_list) - 1)]

    src = _cloudinary_image_url(public_id, default_src_width, quality=quality)

    srcset = ", ".join(
        f"{_cloudinary_image_url(public_id, w, quality=quality)} {w}w"
        for w in widths_list
    )

    return {
        "title": title,
        "width": width,
        "height": height,
        "src": src,
        "srcset": srcset,
        "sizes": sizes,
    }
