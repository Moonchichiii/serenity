from rest_framework import serializers

from .models import Booking, GiftVoucher


class GiftVoucherInputSerializer(serializers.Serializer):
    recipient_name = serializers.CharField(max_length=200)
    recipient_email = serializers.EmailField()
    sender_name = serializers.CharField(max_length=200)
    sender_email = serializers.EmailField()
    message = serializers.CharField(required=False, default="")
    amount = serializers.DecimalField(max_digits=8, decimal_places=2)
    preferred_language = serializers.ChoiceField(
        choices=["fr", "en"], default="fr"
    )
    service_id = serializers.IntegerField(required=False)
    start_datetime = serializers.DateTimeField(required=False)
    end_datetime = serializers.DateTimeField(required=False)

    def validate(self, attrs):
        booking_fields = ["service_id", "start_datetime", "end_datetime"]
        provided = [f for f in booking_fields if attrs.get(f)]
        if provided and len(provided) != len(booking_fields):
            raise serializers.ValidationError(
                "If booking a slot, provide service_id, "
                "start_datetime, and end_datetime together."
            )
        return attrs


class GiftVoucherResponseSerializer(serializers.ModelSerializer):
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
            "booking_confirmation",
            "created_at",
        ]


class BookingSerializer(serializers.ModelSerializer):
    service = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "service",
            "start_datetime",
            "end_datetime",
            "status",
            "source",
            "client_name",
            "client_email",
            "confirmation_code",
            "voucher_code",
        ]

    def get_service(self, obj) -> dict:
        return {
            "id": obj.service.id,
            "title_fr": obj.service.title_fr,
            "title_en": obj.service.title_en,
        }
