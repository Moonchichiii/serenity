"""Serializer mixins shared by every public form (prompt 03)."""

from typing import Any

from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail


class HoneypotMixin(serializers.Serializer):
    """Invisible `website` field — humans never fill it, bots do.

    Implemented in `to_internal_value` so it runs before any subclass
    `validate()` (no fragile super() chains) and the key is always
    popped, keeping `validated_data` clean for `Model.objects.create`.
    """

    website = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        default="",
        help_text="Leave this field empty.",
    )

    def to_internal_value(self, data: Any) -> dict[str, Any]:
        ret: dict[str, Any] = super().to_internal_value(data)
        if ret.pop("website", ""):
            raise serializers.ValidationError(
                {"website": [ErrorDetail("Spam detected.", code="spam_detected")]}
            )
        return ret
