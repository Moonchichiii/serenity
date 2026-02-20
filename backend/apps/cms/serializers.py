"""
apps.cms.serializers
~~~~~~~~~~~~~~~~~~~~
DRF serializers configured for high-performance hydration.
Zero-query policy: Data must be prefetched by selectors.
"""

from __future__ import annotations

import logging
from typing import Any

import cloudinary.utils
from rest_framework import serializers
from wagtail.images.models import Image

from apps.cms.pages import HomePage
from apps.cms.settings import GiftSettings

logger = logging.getLogger(__name__)

# Image helpers

class WagtailImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ("title", "width", "height", "url")

    def get_url(self, obj: Image) -> str | None:
        try:
            f = getattr(obj, "file", None)
            return getattr(f, "url", None) if f else None
        except Exception:
            return None

# Orderable serializers

class HeroSlideSerializer(serializers.Serializer):
    title_en = serializers.CharField(required=False)
    title_fr = serializers.CharField(required=False)
    subtitle_en = serializers.CharField(required=False)
    subtitle_fr = serializers.CharField(required=False)
    image = serializers.SerializerMethodField()

    def get_image(self, obj: Any) -> dict[str, Any] | None:
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
    image = WagtailImageSerializer(required=False, allow_null=True)

# ──────────────────────────────────────────────────────────────────────
# HomePage Serializer
# ──────────────────────────────────────────────────────────────────────

class HomePageSerializer(serializers.ModelSerializer):
    hero_slides = HeroSlideSerializer(many=True, read_only=True)
    hero_image = WagtailImageSerializer(required=False, allow_null=True)
    specialties = SpecialtySerializer(many=True, required=False, read_only=True)
    services_hero_poster_image = WagtailImageSerializer(required=False, allow_null=True)
    services_hero_video_url = serializers.SerializerMethodField()

    class Meta:
        model = HomePage
        fields = (
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
            "specialties",
            "phone",
            "email",
            "address_en",
            "address_fr",
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
            "services_hero_video_url",
            "services_hero_poster_image",
        )

    def to_representation(self, instance: HomePage) -> dict[str, Any]:
        """
        Enterprise optimization: Do not invoke .order_by() or .all() here.
        Ordering and hydration are handled by selectors with Prefetch.
        This method only serializes the in-memory data.
        """
        data = super().to_representation(instance)
        data["hero_slides"] = HeroSlideSerializer(
            instance.hero_slides, many=True
        ).data
        data["specialties"] = SpecialtySerializer(
            instance.specialties, many=True
        ).data
        return data

    def get_services_hero_video_url(self, obj: HomePage) -> str | None:
        f = getattr(obj, "services_hero_video_file", None)
        try:
            return f.url if f else None
        except Exception:
            return None

class GiftSettingsSerializer(serializers.ModelSerializer):
    floating_icon = serializers.SerializerMethodField()

    class Meta:
        model = GiftSettings
        fields = (
            "is_enabled",
            "floating_icon",
            "modal_title_en",
            "modal_title_fr",
            "modal_text_en",
            "modal_text_fr",
            "form_message_placeholder_en",
            "form_message_placeholder_fr",
            "form_submit_label_en",
            "form_submit_label_fr",
            "form_sending_label_en",
            "form_sending_label_fr",
            "form_success_title_en",
            "form_success_title_fr",
            "form_success_message_en",
            "form_success_message_fr",
            "form_code_label_en",
            "form_code_label_fr",
            "email_heading_en",
            "email_heading_fr",
            "email_intro_en",
            "email_intro_fr",
            "email_redeem_en",
            "email_redeem_fr",
            "email_closing_en",
            "email_closing_fr",
        )

    def get_floating_icon(
        self, obj: GiftSettings
    ) -> dict[str, Any] | None:
        if not obj.floating_icon:
            return None
        try:
            public_id = obj.floating_icon.file.name
            url, _ = cloudinary.utils.cloudinary_url(
                public_id,
                width=150,
                crop="scale",
                quality="auto",
                fetch_format="auto",
                secure=True,
            )
            return {
                "url": url,
                "width": 150,
                "height": 150,
                "title": obj.floating_icon.title,
            }
        except Exception:
            logger.exception(
                "Failed to generate Cloudinary URL for floating_icon"
            )
            return None
