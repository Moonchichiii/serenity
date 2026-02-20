from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from django.db.models import Prefetch
from wagtail.models import Site

if TYPE_CHECKING:
    from django.http import HttpRequest

logger = logging.getLogger(__name__)

def get_site_for_request(request: HttpRequest) -> Site | None:
    try:
        return Site.find_for_request(request)
    except Exception:
        logger.exception("Wagtail Site resolution failed.")
        return None

def _hydrate_homepage(page: Any) -> Any:
    from apps.cms.pages import HeroSlide, Specialty
    return (
        page.__class__.objects.select_related("hero_image", "services_hero_poster_image")
        .prefetch_related(
            Prefetch("hero_slides", queryset=HeroSlide.objects.select_related("image").order_by("sort_order")),
            Prefetch("specialties", queryset=Specialty.objects.select_related("image").order_by("sort_order")),
        )
        .get(pk=page.pk)
    )

def get_homepage_for_site(site: Site | None) -> Any | None:
    from apps.cms.pages import HomePage
    if not site:
        page = HomePage.objects.live().first()
    elif isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        page = HomePage.objects.live().descendant_of(site.root_page).first()
        if page is None:
            page = HomePage.objects.live().first()
    return _hydrate_homepage(page) if page else None

def get_homepage_payload(*, request: HttpRequest, site: Site | None) -> dict[str, Any] | None:
    from apps.cms.serializers import HomePageSerializer
    page = get_homepage_for_site(site)
    return HomePageSerializer(page, context={"request": request}).data if page else None

def get_services_payload(*, request: HttpRequest) -> list[dict[str, Any]]:
    try:
        from apps.services.selectors import get_available_services
        from apps.services.serializers import ServiceSerializer
        return ServiceSerializer(get_available_services(), many=True, context={"request": request}).data
    except (ImportError, AttributeError):
        return []

def get_globals_payload(*, site: Site | None) -> dict[str, Any]:
    from apps.cms.serializers import GiftSettingsSerializer
    from apps.cms.settings import GiftSettings
    try:
        gift_settings = GiftSettings.for_site(site) if site else GiftSettings.objects.first()
    except Exception:
        gift_settings = GiftSettings.objects.first()
    return {"gift": GiftSettingsSerializer(gift_settings).data if gift_settings else None}

def get_testimonials_payload(*, limit: int = 8) -> list[dict[str, Any]]:
    try:
        from apps.testimonials.selectors import get_approved_testimonials
        from apps.testimonials.serializers import TestimonialSerializer
        return TestimonialSerializer(get_approved_testimonials(min_rating=4, limit=limit), many=True).data
    except (ImportError, AttributeError):
        return []

def get_hydrated_homepage_payload(*, request: HttpRequest) -> dict[str, Any] | None:
    site = get_site_for_request(request)
    page_data = get_homepage_payload(request=request, site=site)
    if not page_data:
        return None
    return {
        "page": page_data,
        "services": get_services_payload(request=request),
        "globals": get_globals_payload(site=site),
        "testimonials": get_testimonials_payload(limit=8),
    }
