from __future__ import annotations

from typing import Any

from rest_framework import serializers

from apps.core.serializer_mixins import HoneypotMixin
from apps.core.validators import validate_no_newlines


class CheckoutRequestSerializer(HoneypotMixin, serializers.Serializer):
    """
    Same input as voucher creation, but we won't create the voucher immediately.
    We just validate + pass data into Stripe metadata.
    """
    kind = serializers.ChoiceField(
        choices=("gift", "booking"), default="gift"
    )

    sender_name = serializers.CharField(
        max_length=200, validators=[validate_no_newlines]
    )
    sender_email = serializers.EmailField()

    recipient_name = serializers.CharField(
        required=False, allow_blank=True, default="",
        max_length=200, validators=[validate_no_newlines],
    )
    recipient_email = serializers.EmailField(
        required=False, allow_blank=True, default=""
    )

    preferred_language = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    message = serializers.CharField(required=False, allow_blank=True, default="")

    service_id = serializers.IntegerField(required=False, allow_null=True)
    start_datetime = serializers.DateTimeField(required=False, allow_null=True)
    end_datetime = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        kind = attrs.get("kind", "gift")
        errors: dict[str, list] = {}
        if kind == "booking":
            for field in ("service_id", "start_datetime", "end_datetime"):
                if attrs.get(field) in (None, ""):
                    errors[field] = [
                        serializers.ErrorDetail(
                            "This field is required for bookings.",
                            code="required",
                        )
                    ]
            start = attrs.get("start_datetime")
            end = attrs.get("end_datetime")
            if start and end and end <= start:
                errors["end_datetime"] = [
                    serializers.ErrorDetail(
                        "End must be after start.", code="invalid"
                    )
                ]
        else:
            for field in ("recipient_name", "recipient_email"):
                if not attrs.get(field):
                    errors[field] = [
                        serializers.ErrorDetail(
                            "This field is required.", code="required"
                        )
                    ]
        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class CheckoutResponseSerializer(serializers.Serializer):
    url = serializers.URLField()
    session_id = serializers.CharField()
