from django.conf import settings
from rest_framework import serializers
from wagtail.images.models import Image

from apps.cms.models import HomePage
from apps.services.models import Service
from apps.testimonials.models import Testimonial

if settings.USE_CLOUDINARY:
    from config.cloudinary_config import get_device_from_user_agent, get_responsive_url


class WagtailImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    responsive_urls = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ["title", "width", "height", "url", "responsive_urls"]

    def get_url(self, obj):
        """Default optimized URL (desktop)"""
        url = obj.file.url

        if settings.USE_CLOUDINARY:
            request = self.context.get("request")
            if request:
                user_agent = request.META.get("HTTP_USER_AGENT", "")
                device = get_device_from_user_agent(user_agent)
                return get_responsive_url(url, device)

        return url

    def get_responsive_urls(self, obj):
        """All device variants for client-side responsive images"""
        if not settings.USE_CLOUDINARY:
            return None

        base_url = obj.file.url
        return {
            "mobile": get_responsive_url(base_url, "mobile"),
            "tablet": get_responsive_url(base_url, "tablet"),
            "desktop": get_responsive_url(base_url, "desktop"),
        }


class HomePageSerializer(serializers.ModelSerializer):
    hero_image = WagtailImageSerializer()

    class Meta:
        model = HomePage
        fields = [
            "hero_title_en",
            "hero_title_fr",
            "hero_subtitle_en",
            "hero_subtitle_fr",
            "hero_image",
            "about_title_en",
            "about_title_fr",
            "about_text_en",
            "about_text_fr",
            "phone",
            "email",
            "address_en",
            "address_fr",
        ]


class ServiceSerializer(serializers.ModelSerializer):
    image = WagtailImageSerializer()

    class Meta:
        model = Service
        fields = [
            "id",
            "title_en",
            "title_fr",
            "description_en",
            "description_fr",
            "duration_minutes",
            "price",
            "image",
            "is_available",
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["id", "client_name", "text_en", "text_fr", "rating", "created_at"]
