from rest_framework import serializers

from .models import Booking


class BookingRequestSerializer(serializers.Serializer):
    service_id = serializers.IntegerField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    client_name = serializers.CharField()
    client_email = serializers.EmailField()
    client_phone = serializers.CharField()
    client_notes = serializers.CharField(required=False, allow_blank=True)
    preferred_language = serializers.ChoiceField(choices=[("fr", "fr"), ("en", "en")])


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
            "client_name",
            "client_email",
            "confirmation_code",
        ]

    def get_service(self, obj):
        s = obj.service
        return {"id": s.id, "title_fr": s.title_fr, "title_en": s.title_en}
