from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Site

from apps.cms.models import HomePage
from apps.services.models import Service
from apps.testimonials.models import Testimonial

from .serializers import HomePageSerializer, ServiceSerializer, TestimonialSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def homepage(request):
    site = Site.find_for_request(request)

    # Check if root page itself is HomePage
    if isinstance(site.root_page.specific, HomePage):
        page = site.root_page.specific
    else:
        # Otherwise look for HomePage as descendant
        page = HomePage.objects.live().descendant_of(site.root_page).first()

    if not page:
        return Response({}, status=200)

    # Pass request context for device detection
    data = HomePageSerializer(page, context={"request": request}).data
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def services(request):
    qs = Service.objects.filter(is_available=True)
    # Pass request context for device detection
    return Response(ServiceSerializer(qs, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def testimonials(request):
    featured = request.GET.get("featured")
    qs = Testimonial.objects.all()
    if featured in ("1", "true", "True"):
        qs = qs.filter(featured=True)
    return Response(TestimonialSerializer(qs, many=True).data)


urlpatterns = [
    path("homepage/", homepage),
    path("services/", services),
    path("testimonials/", testimonials),
]
