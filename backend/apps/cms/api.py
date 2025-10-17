from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import HomePage, SerenitySettings
from apps.services.models import Service
from apps.testimonials.models import Testimonial

from .serializers import HomePageSerializer, ServiceSerializer, TestimonialSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def homepage(request):
    site = Site.find_for_request(request)
    page = HomePage.objects.live().descendant_of(site.root_page).first()
    if not page:
        return Response({}, status=200)
    data = HomePageSerializer(page).data
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services(request):
    qs = Service.objects.filter(is_available=True)
    return Response(ServiceSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def testimonials(request):
    featured = request.GET.get("featured")
    qs = Testimonial.objects.all()
    if featured in ("1", "true", "True"):
        qs = qs.filter(featured=True)
    return Response(TestimonialSerializer(qs, many=True).data)


# Simple CMS data used by your /pages/cms.tsx
@api_view(["GET", "PUT"])
def cms_settings(request):
    site = Site.find_for_request(request)
    settings = SerenitySettings.for_site(site)

    if request.method == "GET":
        data = {
            "site": {
                "brand": settings.brand,
                "phone": settings.phone,
                "email": settings.email,
                "address": settings.address,
            },
            "hero": {
                "title": settings.hero_title,
                "subtitle": settings.hero_subtitle,
            },
            "about": {
                "intro": settings.about_intro,
                "approachText": settings.about_approach,
            },
            "services": [],  # Keep simple; you can wire editable services here if desired
            "media": {
                "heroImage": settings.hero_image_url or None,
                "gallery": [],
            },
        }
        return Response(data)

    # PUT
    payload = request.data or {}
    site_data = payload.get("site", {})
    hero = payload.get("hero", {})
    about = payload.get("about", {})
    media = payload.get("media", {})

    settings.brand = site_data.get("brand", settings.brand)
    settings.phone = site_data.get("phone", settings.phone)
    settings.email = site_data.get("email", settings.email)
    settings.address = site_data.get("address", settings.address)
    settings.hero_title = hero.get("title", settings.hero_title)
    settings.hero_subtitle = hero.get("subtitle", settings.hero_subtitle)
    settings.hero_image_url = media.get("heroImage", settings.hero_image_url) or ""
    settings.about_intro = about.get("intro", settings.about_intro)
    settings.about_approach = about.get("approachText", settings.about_approach)
    settings.save()
    return Response({"ok": True})


urlpatterns = [
    path("homepage/", homepage),
    path("services/", services),
    path("testimonials/", testimonials),
    path("cms", cms_settings),
]
