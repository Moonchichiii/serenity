from __future__ import annotations

from rest_framework import serializers

from apps.vouchers.serializers import GiftVoucherInputSerializer


class CheckoutRequestSerializer(GiftVoucherInputSerializer):
    """
    Same input as voucher creation, but we won't create the voucher immediately.
    We just validate + pass data into Stripe metadata.
    """
    pass


class CheckoutResponseSerializer(serializers.Serializer):
    url = serializers.URLField()
    session_id = serializers.CharField()
