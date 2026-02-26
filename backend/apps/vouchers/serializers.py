from __future__ import annotations

from rest_framework import serializers

from apps.services.models import Service

from .models import GiftVoucher


class GiftVoucherInputSerializer(serializers.Serializer):
    recipient_name = serializers.CharField(max_length=200)
    recipient_email = serializers.EmailField()
    sender_name = serializers.CharField(max_length=200)
    sender_email = serializers.EmailField()

    message = serializers.CharField(required=False, default="")
    amount = serializers.DecimalField(max_digits=8, decimal_places=2)

    preferred_language = serializers.ChoiceField(choices=["fr", "en"], default="fr")

    service_id = serializers.IntegerField(required=False, allow_null=True)
    start_datetime = serializers.DateTimeField(required=False, allow_null=True)
    end_datetime = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, attrs):
        service_id = attrs.get("service_id")
        start_dt = attrs.get("start_datetime")
        end_dt = attrs.get("end_datetime")

        # If any booking field is provided => require all 3
        provided = [v for v in (service_id, start_dt, end_dt) if v]
        if provided and not (service_id and start_dt and end_dt):
            raise serializers.ValidationError(
                "If booking a slot, provide service_id, start_datetime, and end_datetime together."
            )

        # If service_id is provided, ensure it exists + available
        if service_id:
            if not Service.objects.filter(id=service_id, is_available=True).exists():
                raise serializers.ValidationError({"service_id": "Invalid or unavailable service."})

        return attrs


class GiftVoucherResponseSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(source="service.id", allow_null=True, required=False)

    class Meta:
        model = GiftVoucher
        fields = [
            "id",
            "code",
            "recipient_name",
            "recipient_email",
            "sender_name",
            "sender_email",
            "message",
            "amount",
            "preferred_language",
            "service_id",
            "start_datetime",
            "end_datetime",
            "calendar_event_id",
            "calendar_event_link",
            "calendar_event_status",
            "created_at",
        ]
