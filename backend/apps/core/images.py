from __future__ import annotations

from collections.abc import Iterable
from typing import Any

import cloudinary.utils
from wagtail.images.models import Image

IMG_WIDTHS: tuple[int, ...] = (360, 480, 640, 768, 1024, 1280, 1536)

DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
HERO_SIZES = "100vw"
SECTION_HERO_SIZES = "(max-width: 1024px) 100vw, 1280px"


def _file_url(img: Image) -> str | None:
    """Return the direct file URL or None."""
    try:
        f = getattr(img, "file", None)
        return getattr(f, "url", None) if f else None
    except Exception:
        return None


def _cloudinary_public_id(img: Image) -> str | None:
    """Extract the Cloudinary public_id from the image file name."""
    try:
        f = getattr(img, "file", None)
        name = getattr(f, "name", None) if f else None
        if not name:
            return None
        if name.startswith(("media/", "media\\", "/")):
            return None
        return str(name)
    except Exception:
        return None


def _cloudinary_image_url(
    public_id: str, width: int, *, quality: str = "eco"
) -> str:
    """Build an optimised Cloudinary delivery URL."""
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
    """Serialize a Wagtail Image into a responsive-ready dictionary."""
    if not img:
        return None

    title = getattr(img, "title", "") or ""
    width = getattr(img, "width", None)
    height = getattr(img, "height", None)

    public_id = _cloudinary_public_id(img)

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

    default_src_width = widths_list[min(2, len(widths_list) - 1)]

    try:
        src = _cloudinary_image_url(
            public_id, default_src_width, quality=quality
        )
        srcset = ", ".join(
            f"{_cloudinary_image_url(public_id, w, quality=quality)} {w}w"
            for w in widths_list
        )
    except Exception:
        return None

    return {
        "title": title,
        "width": width,
        "height": height,
        "src": src,
        "srcset": srcset,
        "sizes": sizes,
    }
