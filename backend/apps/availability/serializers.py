from rest_framework import serializers


class BusyDaysQuerySerializer(serializers.Serializer):
    year = serializers.IntegerField(min_value=1970, max_value=2100)
    month = serializers.IntegerField(min_value=1, max_value=12)


class FreeSlotsQuerySerializer(serializers.Serializer):
    # Accepts "YYYY-MM-DD" and validates properly.
    date = serializers.DateField()

    @property
    def date_iso(self) -> str:
        # Convenience accessor after validation.
        return self.validated_data["date"].isoformat()
