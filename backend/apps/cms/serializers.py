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

    def get_url(self, obj: Image):
        try:
            f = getattr(obj, "file", None)
            return getattr(f, "url", None) if f else None
        except Exception:
            return None


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
        try:
            f = getattr(img, "file", None)
            base_url = getattr(f, "url", None) if f else None
        except Exception:
            base_url = None
        return {
            "title": getattr(img, "title", "") or "",
            "width": getattr(img, "width", None),
            "height": getattr(img, "height", None),
            "url": base_url,
        }


class SpecialtySerializer(serializers.Serializer):
    title_en = serializers.CharField(required=False)
    title_fr = serializers.CharField(required=False)
    image = WagtailImageSerializer(source="image", required=False, allow_null=True)


class HomePageSerializer(serializers.ModelSerializer):
    hero_slides = HeroSlideSerializer(many=True)
    hero_image = WagtailImageSerializer(required=False, allow_null=True)
    specialties = SpecialtySerializer(many=True, required=False)
    services_hero_poster_image = WagtailImageSerializer(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = HomePage
        fields = [
            # Hero
            "hero_title_en",
            "hero_title_fr",
            "hero_subtitle_en",
            "hero_subtitle_fr",
            "hero_image",
            "hero_slides",
            # About – Header
            "about_title_en",
            "about_title_fr",
            "about_subtitle_en",
            "about_subtitle_fr",
            # About – Intro
            "about_intro_en",
            "about_intro_fr",
            "about_certification_en",
            "about_certification_fr",
            # About – Approach
            "about_approach_title_en",
            "about_approach_title_fr",
            "about_approach_text_en",
            "about_approach_text_fr",
            # About – Specialties
            "about_specialties_title_en",
            "about_specialties_title_fr",
            "specialties",
            # Contact
            "phone",
            "email",
            "address_en",
            "address_fr",
            # Services Hero
            "services_hero_title_en",
            "services_hero_title_fr",
            "services_hero_pricing_label_en",
            "services_hero_pricing_label_fr",
            "services_hero_price_en",
            "services_hero_price_fr",
            "services_hero_cta_en",
            "services_hero_cta_fr",
            "services_hero_benefit_1_en",
            "services_hero_benefit_1_fr",
            "services_hero_benefit_2_en",
            "services_hero_benefit_2_fr",
            "services_hero_benefit_3_en",
            "services_hero_benefit_3_fr",
            "services_hero_video_public_id",
            "services_hero_poster_image",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Maintain consistent ordering
        data["hero_slides"] = HeroSlideSerializer(
            instance.hero_slides.all().order_by("sort_order"), many=True
        ).data

        data["specialties"] = SpecialtySerializer(
            instance.specialties.all().order_by("sort_order"), many=True
        ).data

        return data


class ServiceSerializer(serializers.ModelSerializer):
    image = WagtailImageSerializer(required=False, allow_null=True)

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
    """Serializer matching frontend expectations: name, rating, text, date, avatar."""

    avatar = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ["id", "name", "rating", "text", "date", "avatar"]

    def get_date(self, obj):
        """Return creation date as YYYY-MM-DD or empty string."""
        if obj.created_at:
            return obj.created_at.strftime("%Y-%m-%d")
        return ""

    def get_avatar(self, obj):
        """Return avatar URL from UI Avatars using the testimonial name."""
        import urllib.parse

        name = obj.name or "Anonymous"
        encoded_name = urllib.parse.quote(name)
        return f"https://ui-avatars.com/api/?name={encoded_name}&background=random&size=128"


class TestimonialStatsSerializer(serializers.Serializer):
    """Serializer for testimonial statistics."""

    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    five_star_count = serializers.IntegerField()
    four_star_count = serializers.IntegerField()
    three_star_count = serializers.IntegerField()
    two_star_count = serializers.IntegerField()
    one_star_count = serializers.IntegerField()
