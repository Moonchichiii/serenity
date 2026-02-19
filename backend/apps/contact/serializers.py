from rest_framework import serializers


class ContactSubmissionSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(
        max_length=20, required=False, allow_blank=True, default=""
    )
    subject = serializers.CharField(max_length=200)
    message = serializers.CharField(min_length=10)
