from rest_framework import serializers
from wagtail.images.models import Image

from apps.cms.models import HomePage
from apps.services.models import Service
from apps.testimonials.models import Testimonial
from config.cloudinary_config import build_responsive


class WagtailImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    responsive_urls = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ["title", "width", "height", "url", "responsive_urls"]

    def get_url(self, obj):
        return obj.file.url

    def get_responsive_urls(self, obj):
        return build_responsive(obj.file.url)


class HomePageSerializer(serializers.ModelSerializer):
    hero_image = WagtailImageSerializer()

    class Meta:
        model = HomePage
        fields = [
            # Hero
            "hero_title_en",
            "hero_title_fr",
            "hero_subtitle_en",
            "hero_subtitle_fr",
            "hero_image",
            # About - Header
            "about_title_en",
            "about_title_fr",
            "about_subtitle_en",
            "about_subtitle_fr",
            # About - Intro
            "about_intro_en",
            "about_intro_fr",
            "about_certification_en",
            "about_certification_fr",
            # About - Approach
            "about_approach_title_en",
            "about_approach_title_fr",
            "about_approach_text_en",
            "about_approach_text_fr",
            # About - Specialties
            "about_specialties_title_en",
            "about_specialties_title_fr",
            "specialty_1_en",
            "specialty_1_fr",
            "specialty_2_en",
            "specialty_2_fr",
            "specialty_3_en",
            "specialty_3_fr",
            "specialty_4_en",
            "specialty_4_fr",
            # Contact
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
