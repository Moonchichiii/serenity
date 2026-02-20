from __future__ import annotations

from typing import Any

from rest_framework import serializers

from .models import Testimonial, TestimonialReply


class ReplySerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = TestimonialReply
        # Fixed RUF012: Converted list to tuple
        fields = ('id', 'name', 'text', 'date')

    def get_date(self, obj: TestimonialReply) -> str:
        return (
            obj.created_at.strftime('%Y-%m-%d')
            if obj.created_at
            else ''
        )


class TestimonialSerializer(serializers.ModelSerializer):
    date = serializers.CharField(source='date_display')
    avatar = serializers.CharField(source='avatar_url')
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        # Fixed RUF012: Converted list to tuple
        fields = (
            'id',
            'name',
            'rating',
            'text',
            'date',
            'avatar',
            'replies',
        )

    def get_replies(self, obj: Testimonial) -> list[dict[str, Any]]:
        """
        Use .all() to leverage the prefetched approved-reply queryset
        set by selectors.get_approved_testimonials().
        """
        return ReplySerializer(obj.replies.all(), many=True).data


# --- Input serializers ---


class SubmitTestimonialSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100)
    email = serializers.EmailField(required=False, default='')
    rating = serializers.IntegerField(min_value=1, max_value=5)
    text = serializers.CharField(min_length=10, max_length=500)


class SubmitReplySerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100)
    email = serializers.EmailField()
    text = serializers.CharField(min_length=2, max_length=500)
