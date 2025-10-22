from __future__ import annotations

from rest_framework import serializers
from wagtail.images.models import Image

from apps.cms.models import HomePage
from apps.services.models import Service
from apps.testimonials.models import Testimonial


class WagtailImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ("title", "width", "height", "url")

    def get_url(self, obj: Image) -> str:
        return obj.file.url


class HeroSlideSerializer(serializers.Serializer):
    title_en = serializers.CharField(required=False)
    title_fr = serializers.CharField(required=False)
    subtitle_en = serializers.CharField(required=False)
    subtitle_fr = serializers.CharField(required=False)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        img = getattr(obj, "image", None)
        if not img:
            return None
        base_url = img.file.url
        return {
            "title": img.title,
            "width": img.width,
            "height": img.height,
            "url": base_url,
        }


class HomePageSerializer(serializers.ModelSerializer):
    hero_image = WagtailImageSerializer()
    hero_slides = serializers.SerializerMethodField()

    class Meta:
        model = HomePage
        fields = [
            "hero_title_en",
            "hero_title_fr",
            "hero_subtitle_en",
            "hero_subtitle_fr",
            "hero_image",
            "hero_slides",
            "about_title_en",
            "about_title_fr",
            "about_subtitle_en",
            "about_subtitle_fr",
            "about_intro_en",
            "about_intro_fr",
            "about_certification_en",
            "about_certification_fr",
            "about_approach_title_en",
            "about_approach_title_fr",
            "about_approach_text_en",
            "about_approach_text_fr",
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
            "phone",
            "email",
            "address_en",
            "address_fr",
        ]

    def get_hero_slides(self, obj):
        return HeroSlideSerializer(
            obj.hero_slides.all().order_by("sort_order"), many=True
        ).data


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
