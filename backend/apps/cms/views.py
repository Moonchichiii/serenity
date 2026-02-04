import logging

from django.core.cache import cache
from django.db.models import Prefetch
from django.views.decorators.cache import never_cache
from django.views.decorators.vary import vary_on_headers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import GiftSettings, HeroSlide, HomePage, Specialty
from apps.services.models import Service

from .serializers import GiftSettingsSerializer, HomePageSerializer, ServiceSerializer

logger = logging.getLogger(__name__)

HOMEPAGE_CACHE_TTL = 60 * 60
SERVICES_CACHE_TTL = 60 * 30


@api_view(["GET"])
@permission_classes([AllowAny])
@vary_on_headers("Accept-Language")
def homepage_view(request):
    """Get homepage content with CMS-managed fields."""
    site = Site.find_for_request(request)
    site_id = getattr(site, "id", 0)
    lang = getattr(request, "LANGUAGE_CODE", "en")
    cache_key = f"cms:homepage:{site_id}:{lang}"

    cached = cache.get(cache_key)
    if cached is not None:
        logger.debug("Homepage cache HIT: %s", cache_key)
        return Response(cached)

    logger.debug("Homepage cache MISS: %s (site=%s, lang=%s)", cache_key, site, lang)

    if not site:
        page = HomePage.objects.live().first()
    elif isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    if not page:
        logger.warning("No HomePage found for site_id=%s lang=%s", site_id, lang)
        return Response({"error": "No HomePage found"}, status=404)

    page = (
        page.__class__.objects.select_related("hero_image")
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

    data = HomePageSerializer(page, context={"request": request}).data
    cache.set(cache_key, data, HOMEPAGE_CACHE_TTL)
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services_view(request):
    """Get all available services with caching."""
    cache_key = "cms:services"
    data = cache.get(cache_key)

    if data is None:
        logger.debug("Services cache MISS: %s", cache_key)
        qs = Service.objects.filter(is_available=True).select_related("image")
        data = ServiceSerializer(qs, many=True, context={"request": request}).data
        cache.set(cache_key, data, SERVICES_CACHE_TTL)
    else:
        logger.debug("Services cache HIT: %s", cache_key)

    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
@never_cache
def globals_view(request):
    """Get global site settings."""
    site = Site.find_for_request(request)
    gift_settings = GiftSettings.for_site(site)

    return Response({"gift": GiftSettingsSerializer(gift_settings).data})
