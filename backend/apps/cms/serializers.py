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
        return obj.file.url  # Changed from obj.file.name to get full URL


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
        return {
            "title": img.title,
            "width": img.width,
            "height": img.height,
            "url": img.file.url,  # Full URL instead of just name
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
    """
    Updated to match frontend expectations.
    Maps backend fields to frontend naming convention.
    """

    name = serializers.CharField(source="client_name", read_only=True)
    text = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ["id", "name", "rating", "text", "date", "avatar"]

    def get_text(self, obj):
        """
        Return language-specific text based on request language.
        Falls back to English if language not specified.
        """
        request = self.context.get("request")
        lang = "en"  # default

        if request:
            # Check Accept-Language header
            accept_lang = request.headers.get("Accept-Language", "").lower()
            if "fr" in accept_lang:
                lang = "fr"
            # Or check query parameter
            lang = request.GET.get("lang", lang)

        if lang == "fr" and obj.text_fr:
            return obj.text_fr
        return obj.text_en or obj.text_fr or ""

    def get_date(self, obj):
        """
        Format date for display.
        Returns ISO format that frontend can parse.
        """
        if obj.created_at:
            return obj.created_at.strftime("%Y-%m-%d")
        return ""

    def get_avatar(self, obj):
        """
        Generate avatar URL using UI Avatars service.
        Falls back to initials-based placeholder.
        """
        if hasattr(obj, "avatar_image") and obj.avatar_image:
            # If model has avatar_image field (for future use)
            return obj.avatar_image.file.url

        # Generate placeholder avatar
        import urllib.parse

        name = obj.client_name or "Anonymous"
        encoded_name = urllib.parse.quote(name)
        return f"https://ui-avatars.com/api/?name={encoded_name}&background=random&size=128"


class TestimonialStatsSerializer(serializers.Serializer):
    """
    Serializer for testimonial statistics.
    Used by stats endpoint.
    """

    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    five_star_count = serializers.IntegerField()
    four_star_count = serializers.IntegerField()
    three_star_count = serializers.IntegerField()
    two_star_count = serializers.IntegerField()
    one_star_count = serializers.IntegerField()
