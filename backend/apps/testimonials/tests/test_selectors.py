import pytest
from django.core.cache import cache

from apps.testimonials.models import Testimonial, TestimonialReply
from apps.testimonials.selectors import (
    get_approved_testimonials,
    get_testimonial_stats,
)


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
class TestGetApprovedTestimonials:
    def test_returns_only_approved(
        self, approved_testimonial, pending_testimonial
    ):
        result = get_approved_testimonials()
        ids = [t.pk for t in result]
        assert approved_testimonial.pk in ids
        assert pending_testimonial.pk not in ids

    def test_filters_by_min_rating(self, db):
        Testimonial.objects.create(
            name="Low", rating=2, text="Pas terrible...",
            status="approved",
        )
        Testimonial.objects.create(
            name="High", rating=5, text="Formidable massage !",
            status="approved",
        )

        result = get_approved_testimonials(min_rating=4)
        assert len(result) == 1
        assert result[0].name == "High"

    def test_prefetches_approved_replies_only(
        self, approved_testimonial, approved_reply
    ):
        TestimonialReply.objects.create(
            parent=approved_testimonial,
            name="Pending Reply",
            email="p@test.com",
            text="Pending",
            status="pending",
        )

        result = get_approved_testimonials()
        testimonial = result[0]
        # Access prefetched replies via .all()
        replies = list(testimonial.replies.all())
        assert len(replies) == 1
        assert replies[0].name == "Serenity"

    def test_results_are_cached(self, approved_testimonial):
        first = get_approved_testimonials()
        assert len(first) == 1

        # Create another after cache is set
        Testimonial.objects.create(
            name="New",
            rating=5,
            text="Should not appear yet.",
            status="approved",
        )

        second = get_approved_testimonials()
        assert len(second) == 1  # still cached

    def test_cache_miss_queries_db(self, approved_testimonial):
        # First call populates cache
        result = get_approved_testimonials()
        assert len(result) == 1

        # Clear and re-fetch
        cache.clear()
        Testimonial.objects.create(
            name="New",
            rating=5,
            text="Now it should appear.",
            status="approved",
        )
        result = get_approved_testimonials()
        assert len(result) == 2

    def test_respects_limit(self, db):
        for i in range(5):
            Testimonial.objects.create(
                name=f"T{i}",
                rating=5,
                text=f"Testimonial number {i} here.",
                status="approved",
            )

        result = get_approved_testimonials(limit=3)
        assert len(result) == 3

    def test_empty_db_returns_empty_list(self, db):
        result = get_approved_testimonials()
        assert result == []


@pytest.mark.django_db
class TestGetTestimonialStats:
    def test_returns_correct_aggregation(self, db):
        Testimonial.objects.create(
            name="A", rating=5, text="Five stars!", status="approved"
        )
        Testimonial.objects.create(
            name="B", rating=5, text="Also five stars.", status="approved"
        )
        Testimonial.objects.create(
            name="C", rating=3, text="Three stars ok.", status="approved"
        )
        Testimonial.objects.create(
            name="D", rating=1, text="Not great....", status="approved"
        )
        # Pending — should be excluded
        Testimonial.objects.create(
            name="E", rating=5, text="Pending five!!!", status="pending"
        )

        stats = get_testimonial_stats()

        assert stats["total_reviews"] == 4
        assert stats["five_star_count"] == 2
        assert stats["three_star_count"] == 1
        assert stats["one_star_count"] == 1
        assert stats["four_star_count"] == 0
        assert stats["two_star_count"] == 0
        assert stats["average_rating"] == 3.5

    def test_empty_db_returns_zeros(self, db):
        stats = get_testimonial_stats()

        assert stats["total_reviews"] == 0
        assert stats["average_rating"] == 0
        assert stats["five_star_count"] == 0
