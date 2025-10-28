from django.db.models import Prefetch
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import HeroSlide, HomePage
from apps.services.models import Service

from .serializers import (
    HomePageSerializer,
    ServiceSerializer,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def homepage(request):
    """
    Get homepage content with all CMS-managed fields.
    Returns bilingual content (EN/FR) for all text fields.
    """
    site = Site.find_for_request(request)

    if not site:
        page = HomePage.objects.live().first()
    elif isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    if not page:
        return Response({}, status=200)

    page = (
        page.__class__.objects.select_related("hero_image")
        .prefetch_related(
            Prefetch(
                "hero_slides",
                queryset=HeroSlide.objects.select_related("image").order_by(
                    "sort_order"
                ),
            )
        )
        .get(pk=page.pk)
    )

    data = HomePageSerializer(page, context={"request": request}).data
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services(request):
    """
    Get all available services.
    Returns bilingual service information.
    """
    qs = Service.objects.filter(is_available=True).select_related("image")
    return Response(ServiceSerializer(qs, many=True, context={"request": request}).data)


urlpatterns = [
    path("homepage/", homepage, name="api_homepage"),
    path("services/", services, name="api_services"),
]
