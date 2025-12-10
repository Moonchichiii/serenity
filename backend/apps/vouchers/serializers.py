from rest_framework import serializers

from .models import GiftVoucher


class GiftVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftVoucher
        fields = [
            "purchaser_name",
            "purchaser_email",
            "recipient_name",
            "recipient_email",
            "message",
            "preferred_date"
        ]
