from __future__ import annotations

from rest_framework import serializers

from .models import GiftVoucher


class GiftVoucherInputSerializer(serializers.ModelSerializer):
    """Validates voucher purchase input."""

    class Meta:
        model = GiftVoucher
        # Fixed RUF012: Converted list to immutable tuple
        fields = (
            'purchaser_name',
            'purchaser_email',
            'recipient_name',
            'recipient_email',
            'message',
            'preferred_date',
        )


class GiftVoucherResponseSerializer(serializers.ModelSerializer):
    """Minimal read serializer for the purchase response."""

    class Meta:
        model = GiftVoucher
        # Fixed RUF012: Converted lists to immutable tuples
        fields = ('code', 'recipient_name', 'created_at')
        read_only_fields = ('code', 'recipient_name', 'created_at')
