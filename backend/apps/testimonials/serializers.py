from rest_framework import serializers

from .models import Testimonial, TestimonialReply


class ReplySerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = TestimonialReply
        fields = ['id', 'name', 'text', 'date']

    def get_date(self, obj):
        return obj.created_at.strftime("%Y-%m-%d") if obj.created_at else ""


class TestimonialSerializer(serializers.ModelSerializer):
    date = serializers.CharField(source='date_display')
    avatar = serializers.CharField(source='avatar_url')
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'rating', 'text', 'date', 'avatar', 'replies']

    def get_replies(self, obj):
        """
        Return approved replies.

        The view (get_testimonials) already prefetches replies with:
        Prefetch('replies', queryset=TestimonialReply.objects.filter(status='approved').order_by('created_at'))

        Therefore, we must use .all() here to use the cached results.
        Using .filter() would trigger a fresh database query for every testimonial.
        """
        return ReplySerializer(obj.replies.all(), many=True).data
