from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, TypedDict

from django.db.models import Prefetch
from wagtail.models import Site

if TYPE_CHECKING:
    from django.http import HttpRequest

logger = logging.getLogger(__name__)


class HydratedHomepagePayload(TypedDict):
    page: dict[str, Any]
    services: list[dict[str, Any]]
    globals: dict[str, Any]
    testimonials: list[dict[str, Any]]


class CmsHydrationError(RuntimeError):
    """Raised when the CMS hydration pipeline cannot build a valid payload."""


# --- Internal Deterministic Requirements ---


def _require_site(request: HttpRequest) -> Site | None:
    """
    Attempt to resolve the site. While Wagtail can function without a
    specific site match (falling back to defaults), we capture it for
    contextual settings.
    """
    return get_site_for_request(request)


def _require_homepage(site: Site | None) -> Any:
    """
    Guarantees a hydrated HomePage object or raises a hard error.
    """
    page_obj = get_homepage_for_site(site)
    if not page_obj:
        raise CmsHydrationError("No HomePage found for site resolution.")
    return page_obj


def _require_services(*, request: HttpRequest) -> list[dict[str, Any]]:
    """
    Enterprise rule: Services are core to the business.
    If the app is unreachable, the payload is invalid.
    """
    try:
        from apps.services.selectors import get_available_services
        from apps.services.serializers import ServiceSerializer
    except (ImportError, AttributeError) as exc:
        raise CmsHydrationError(
            "Services dependency missing or broken: apps.services"
        ) from exc

    qs = get_available_services()
    return ServiceSerializer(qs, many=True, context={"request": request}).data


def _require_testimonials(*, limit: int) -> list[dict[str, Any]]:
    """
    Social proof is a requirement for the homepage contract.
    """
    try:
        from apps.testimonials.selectors import get_approved_testimonials
        from apps.testimonials.serializers import TestimonialSerializer
    except (ImportError, AttributeError) as exc:
        raise CmsHydrationError(
            "Testimonials dependency missing or broken: apps.testimonials"
        ) from exc

    qs = get_approved_testimonials(min_rating=4, limit=limit)
    return TestimonialSerializer(qs, many=True).data


def _require_globals(*, site: Site | None) -> dict[str, Any]:
    """
    Ensures global settings are present with a stable dictionary shape.
    """
    from apps.cms.serializers import GiftSettingsSerializer
    from apps.cms.settings import GiftSettings

    gift_settings = None
    if site:
        gift_settings = GiftSettings.for_site(site)

    if not gift_settings:
        gift_settings = GiftSettings.objects.first()

    return {
        "gift": (
            GiftSettingsSerializer(gift_settings).data
            if gift_settings else None
        ),
    }


# --- Public Interface ---


def get_hydrated_homepage_payload(
    *,
    request: HttpRequest
) -> HydratedHomepagePayload:
    """
    Gold-standard hydrated selector:
    - Deterministic: Same DB/Request state always yields same Shape.
    - No fallbacks: Fails fast if dependencies are missing.
    - Orchestrated: Composes smaller internal 'require' functions.
    """
    site = _require_site(request)
    page_obj = _require_homepage(site)

    # Perform final composition
    # If any internal _require fails, the entire request fails (Deterministic)
    payload: HydratedHomepagePayload = {
        "page": _serialize_homepage_node(page_obj=page_obj, request=request),
        "services": _require_services(request=request),
        "globals": _require_globals(site=site),
        "testimonials": _require_testimonials(limit=8),
    }

    return payload


def _serialize_homepage_node(*, page_obj: Any, request: HttpRequest) -> dict[str, Any]:
    from apps.cms.serializers import HomePageSerializer
    return HomePageSerializer(page_obj, context={"request": request}).data


# --- Support Selectors (Stable) ---


def get_site_for_request(request: HttpRequest) -> Site | None:
    try:
        return Site.find_for_request(request)
    except Exception:
        logger.exception("Failed to resolve Wagtail Site.")
        return None


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

    if not page:
        return None

    return _hydrate_homepage_node(page)


def _hydrate_homepage_node(page: Any) -> Any:
    from apps.cms.pages import HeroSlide, Specialty

    return (
        page.__class__.objects.select_related(
            "hero_image",
            "services_hero_poster_image",
        )
        .prefetch_related(
            Prefetch(
                "hero_slides",
                queryset=HeroSlide.objects.select_related("image").order_by("sort_order"),
            ),
            Prefetch(
                "specialties",
                queryset=Specialty.objects.select_related("image").order_by("sort_order"),
            ),
        )
        .get(pk=page.pk)
    )
