from __future__ import annotations

from rest_framework import serializers


class CheckoutRequestSerializer(serializers.Serializer):
    """
    Same input as voucher creation, but we won't create the voucher immediately.
    We just validate + pass data into Stripe metadata.
    """
    sender_name = serializers.CharField()
    recipient_name = serializers.CharField()
    preferred_language = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    service_id = serializers.IntegerField(required=False, allow_null=True)
    start_datetime = serializers.DateTimeField(required=False, allow_null=True)
    end_datetime = serializers.DateTimeField(required=False, allow_null=True)


class CheckoutResponseSerializer(serializers.Serializer):
    url = serializers.URLField()
    session_id = serializers.CharField()
