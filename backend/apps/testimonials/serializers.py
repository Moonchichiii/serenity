from rest_framework import serializers

from .models import Testimonial, TestimonialReply


class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = TestimonialReply
        fields = ['id', 'name', 'text', 'created_at']


class TestimonialSerializer(serializers.ModelSerializer):
    date = serializers.CharField(source='date_display')
    avatar = serializers.CharField(source='avatar_url')
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'rating', 'text', 'date', 'avatar', 'replies']

    def get_replies(self, obj):
        """Return only approved replies."""
        replies = obj.replies.filter(status='approved')
        return ReplySerializer(replies, many=True).data
