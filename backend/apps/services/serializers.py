"""
apps.services.serializers
~~~~~~~~~~~~~~~~~~~~~~~~
Service serializers for the hydrated CMS payload.

Image DTO is centralized in apps.core.images.
"""

from __future__ import annotations

from typing import Any

from rest_framework import serializers

from apps.core.images import DEFAULT_SIZES, serialize_image

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = (
            "id",
            "title_en",
            "title_fr",
            "description_en",
            "description_fr",
            "duration_minutes",
            "price",
            "image",
        )

    def get_image(self, obj: Service) -> dict[str, Any] | None:
        # Services are usually cards/list items -> eco is ideal
        return serialize_image(
            getattr(obj, "image", None),
            sizes=DEFAULT_SIZES,
            quality="eco",
        )
