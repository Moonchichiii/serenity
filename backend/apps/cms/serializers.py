"""
apps.cms.serializers
~~~~~~~~~~~~~~~~~~~~
DRF serializers configured for high-performance hydration.
Zero-query policy: Data must be prefetched by selectors.
"""

from __future__ import annotations

from typing import Any

from rest_framework import serializers

from apps.cms.pages import HomePage
from apps.cms.settings import GiftSettings
from apps.core.images import HERO_SIZES, SECTION_HERO_SIZES, serialize_image

# ──────────────────────────────────────────────────────────────────────
# Orderable serializers
# ──────────────────────────────────────────────────────────────────────


class HeroSlideSerializer(serializers.Serializer):
    title_en = serializers.CharField(required=False)
    title_fr = serializers.CharField(required=False)
    subtitle_en = serializers.CharField(required=False)
    subtitle_fr = serializers.CharField(required=False)
    image = serializers.SerializerMethodField()

    def get_image(self, obj: Any) -> dict[str, Any] | None:
        # Hero backgrounds: higher quality is worth it
        return serialize_image(
            getattr(obj, "image", None),
            sizes=HERO_SIZES,
            quality="good",
        )


class SpecialtySerializer(serializers.Serializer):
    title_en = serializers.CharField(required=False)
    title_fr = serializers.CharField(required=False)
    image = serializers.SerializerMethodField()

    def get_image(self, obj: Any) -> dict[str, Any] | None:
        # Defaults should be "eco" in serialize_image()
        return serialize_image(getattr(obj, "image", None))


# ──────────────────────────────────────────────────────────────────────
# HomePage serializer
# ──────────────────────────────────────────────────────────────────────


class HomePageSerializer(serializers.ModelSerializer):
    hero_slides = HeroSlideSerializer(many=True, read_only=True)
    hero_image = serializers.SerializerMethodField()
    specialties = SpecialtySerializer(many=True, required=False, read_only=True)

    services_hero_poster_image = serializers.SerializerMethodField()
    services_hero_video_url = serializers.SerializerMethodField()

    class Meta:
        model = HomePage
        fields = (
            # Hero
            "hero_title_en",
            "hero_title_fr",
            "hero_subtitle_en",
            "hero_subtitle_fr",
            "hero_image",
            "hero_slides",
            # About
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
            # Contact
            "phone",
            "email",
            "address_en",
            "address_fr",
            # Services hero
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

    def get_hero_image(self, obj: HomePage) -> dict[str, Any] | None:
        return serialize_image(
            obj.hero_image,
            sizes=HERO_SIZES,
            quality="good",
        )

    def get_services_hero_poster_image(self, obj: HomePage) -> dict[str, Any] | None:
        return serialize_image(
            obj.services_hero_poster_image,
            sizes=SECTION_HERO_SIZES,
            quality="good",
        )

    def get_services_hero_video_url(self, obj: HomePage) -> str | None:
        f = getattr(obj, "services_hero_video_file", None)
        try:
            return f.url if f else None
        except Exception:
            return None


# ──────────────────────────────────────────────────────────────────────
# Settings serializers
# ──────────────────────────────────────────────────────────────────────


class GiftSettingsSerializer(serializers.ModelSerializer):
    floating_icon = serializers.SerializerMethodField()
    voucher_image = serializers.SerializerMethodField()

    class Meta:
        model = GiftSettings
        fields = (
            "is_enabled",
            "floating_icon",
            "voucher_image",
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

    def get_floating_icon(self, obj: GiftSettings) -> dict[str, Any] | None:
        # Small UI icons: limit srcset widths + fixed sizes
        return serialize_image(
            obj.floating_icon,
            widths=(150, 300),
            sizes="150px",
            quality="eco",
        )

    def get_voucher_image(self, obj: GiftSettings) -> dict[str, Any] | None:
        # Useful for SPA modal preview (even if email also uses it)
        return serialize_image(
            obj.voucher_image,
            sizes="(max-width: 640px) 90vw, 600px",
            quality="good",
        )
