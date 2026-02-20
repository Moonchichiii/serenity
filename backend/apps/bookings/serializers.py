from rest_framework import serializers

from .models import Booking


class BookingRequestSerializer(serializers.Serializer):
    """Input for creating an online booking."""

    service_id = serializers.IntegerField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    client_name = serializers.CharField(max_length=200)
    client_email = serializers.EmailField()
    client_phone = serializers.CharField(max_length=64)
    client_notes = serializers.CharField(required=False, allow_blank=True, default="")
    preferred_language = serializers.ChoiceField(choices=[("fr", "fr"), ("en", "en")])


class VoucherBookingRequestSerializer(serializers.Serializer):
    """Input for creating a booking from a voucher redemption."""

    service_id = serializers.IntegerField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    client_name = serializers.CharField(max_length=200)
    client_email = serializers.EmailField()
    client_phone = serializers.CharField(max_length=64)
    client_notes = serializers.CharField(required=False, allow_blank=True, default="")
    preferred_language = serializers.ChoiceField(choices=[("fr", "fr"), ("en", "en")])
    voucher_code = serializers.CharField(max_length=20)


class BookingSerializer(serializers.ModelSerializer):
    """Output serializer for booking responses."""

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

    def get_service(self, obj):
        s = obj.service
        return {
            "id": s.id,
            "title_fr": s.title_fr,
            "title_en": s.title_en,
        }
