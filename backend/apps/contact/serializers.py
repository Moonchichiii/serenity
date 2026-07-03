from rest_framework import serializers

from apps.core.serializer_mixins import HoneypotMixin
from apps.core.validators import validate_no_newlines


class ContactSubmissionSerializer(HoneypotMixin, serializers.Serializer):
    name = serializers.CharField(
        min_length=2, max_length=100, validators=[validate_no_newlines]
    )
    email = serializers.EmailField()
    phone = serializers.CharField(
        max_length=20, required=False, allow_blank=True, default=""
    )
    subject = serializers.CharField(
        max_length=200, validators=[validate_no_newlines]
    )
    message = serializers.CharField(min_length=10, max_length=1500)
