from __future__ import annotations

from rest_framework import serializers

from .models import GiftVoucher


class GiftVoucherInputSerializer(serializers.ModelSerializer):
    """Validates voucher purchase input with optional booking details."""

    # Optional booking fields — if provided the backend will create
    # a calendar booking alongside the voucher.
    service_id = serializers.IntegerField(required=False, default=None)
    start_datetime = serializers.DateTimeField(required=False, default=None)
    end_datetime = serializers.DateTimeField(required=False, default=None)

    class Meta:
        model = GiftVoucher
        fields = (
            'purchaser_name',
            'purchaser_email',
            'recipient_name',
            'recipient_email',
            'message',
            'preferred_date',
            # booking extras (not on the model)
            'service_id',
            'start_datetime',
            'end_datetime',
        )

    def validate(self, attrs: dict) -> dict:
        """If any booking field is set, all three must be present."""
        booking_fields = (
            attrs.get('service_id'),
            attrs.get('start_datetime'),
            attrs.get('end_datetime'),
        )
        has_any = any(f is not None for f in booking_fields)
        has_all = all(f is not None for f in booking_fields)

        if has_any and not has_all:
            raise serializers.ValidationError(
                'service_id, start_datetime and end_datetime must all '
                'be provided together to create a calendar booking.'
            )
        return attrs


class GiftVoucherResponseSerializer(serializers.ModelSerializer):
    """Minimal read serializer for the purchase response."""

    booking_confirmation = serializers.CharField(
        read_only=True, required=False, default=''
    )

    class Meta:
        model = GiftVoucher
        fields = ('code', 'recipient_name', 'created_at', 'booking_confirmation')
        read_only_fields = fields
