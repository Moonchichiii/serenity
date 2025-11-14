from django.core.cache import cache
from django.db.models import Prefetch
from django.urls import path
from django.views.decorators.vary import vary_on_headers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import HeroSlide, HomePage, Specialty
from apps.services.models import Service

from .serializers import HomePageSerializer, ServiceSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
@vary_on_headers("Accept-Language")
def homepage(request):
    """
    DEBUG version – no cache, no swallowed exceptions.
    """

    site = Site.find_for_request(request)
    site_id = getattr(site, "id", None)
    lang = getattr(request, "LANGUAGE_CODE", "en")

    # helpful debug prints in your runserver console
    print("DEBUG /api/homepage/: site =", site, "site_id =", site_id, "lang =", lang)

    if not site:
        page = HomePage.objects.live().first()
    elif isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    print("DEBUG /api/homepage/: page =", page)

    if not page:
        # make it explicit instead of silently returning {}
        return Response({"error": "No HomePage found"}, status=404)

    # optional prefetch, same as before
    page = (
        page.__class__.objects.select_related("hero_image")
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
        .get(pk=page.pk)
    )

    data = HomePageSerializer(page, context={"request": request}).data
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services(request):
    """
    Get all available services (bilingual in serializer).
    Manual cache + model signals handle invalidation.
    """
    cache_key = "cms:services"
    data = cache.get(cache_key)
    if not data:
        qs = Service.objects.filter(is_available=True).select_related("image")
        data = ServiceSerializer(qs, many=True, context={"request": request}).data
        cache.set(cache_key, data, 60 * 30)

    return Response(data)


urlpatterns = [
    path("homepage/", homepage, name="api_homepage"),
    path("services/", services, name="api_services"),
]
