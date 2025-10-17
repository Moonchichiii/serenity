from rest_framework import serializers
from wagtail.images.models import Image

from apps.cms.models import HomePage
from apps.services.models import Service
from apps.testimonials.models import Testimonial


class WagtailImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ["title", "width", "height", "url"]

    def get_url(self, obj):
        # Cloudinary rendition: webp & auto quality via dynamic delivery
        return obj.file.url  # Cloudinary will serve optimized urls


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
