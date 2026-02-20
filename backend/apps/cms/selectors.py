from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from django.db.models import Prefetch
from wagtail.models import Site

from apps.cms.serializers import GiftSettingsSerializer, HomePageSerializer

if TYPE_CHECKING:
    from django.http import HttpRequest

logger = logging.getLogger(__name__)


def get_site_for_request(request: HttpRequest) -> Site | None:
    try:
        return Site.find_for_request(request)
    except Exception:
        logger.exception("Failed to resolve Wagtail Site for request")
        return None


def get_homepage_for_site(site: Site | None) -> Any | None:
    """
    Resolve the HomePage for a given site, falling back to first live HomePage.

    Returns:
        HomePage instance or None.
    """
    # Lazy imports to avoid Wagtail app-registry quirks / circulars.
    from apps.cms.pages import HeroSlide, HomePage, Specialty

    if not site:
        page = HomePage.objects.live().first()
    elif isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    if not page:
        return None

    # Re-fetch with proper prefetch/select_related for a fully-hydrated page.
    homepage_qs = (
        page.__class__.objects.select_related(
            "hero_image", "services_hero_poster_image"
        )
        .prefetch_related(
            Prefetch(
                "hero_slides",
                queryset=HeroSlide.objects.select_related("image").order_by(
                    "sort_order"
                ),
            ),
            Prefetch(
                "specialties",
                queryset=Specialty.objects.select_related("image").order_by(
                    "sort_order"
                ),
            ),
        )
    )
    return homepage_qs.get(pk=page.pk)


def get_homepage_payload(
    *, request: HttpRequest, site: Site | None
) -> dict[str, Any] | None:
    page = get_homepage_for_site(site)
    if not page:
        return None
    return HomePageSerializer(page, context={"request": request}).data


def get_services_payload(*, request: HttpRequest) -> list[dict[str, Any]]:
    """
    Services list payload. Single source of truth for reads comes from
    apps.services.selectors.
    """
    from apps.services.selectors import get_available_services
    from apps.services.serializers import ServiceSerializer

    qs = get_available_services()
    return ServiceSerializer(qs, many=True, context={"request": request}).data


def get_globals_payload(*, site: Site | None) -> dict[str, Any]:
    """
    Global settings payload (currently only GiftSettings).
    """
    from apps.cms.settings import GiftSettings

    if site:
        try:
            gift_settings = GiftSettings.for_site(site)
        except Exception:
            logger.exception(
                "GiftSettings.for_site failed; falling back to first()"
            )
            gift_settings = GiftSettings.objects.first()
    else:
        gift_settings = GiftSettings.objects.first()

    return {
        "gift": (
            GiftSettingsSerializer(gift_settings).data
            if gift_settings
            else None
        )
    }


def get_testimonials_payload(*, limit: int = 8) -> list[dict[str, Any]]:
    """
    Top testimonials payload based on approval and rating.
    """
    from apps.testimonials.selectors import get_approved_testimonials
    from apps.testimonials.serializers import TestimonialSerializer

    qs = get_approved_testimonials(min_rating=4, limit=limit)
    return TestimonialSerializer(qs, many=True).data


def get_hydrated_homepage_payload(
    *, request: HttpRequest
) -> dict[str, Any] | None:
    """
    Master endpoint payload:
      - page (homepage)
      - services
      - globals
      - testimonials
    """
    site = get_site_for_request(request)

    homepage = get_homepage_payload(request=request, site=site)
    if not homepage:
        return None

    return {
        "page": homepage,
        "services": get_services_payload(request=request),
        "globals": get_globals_payload(site=site),
        "testimonials": get_testimonials_payload(limit=8),
    }
