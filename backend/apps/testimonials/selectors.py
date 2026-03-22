from django.core.cache import cache
from django.db.models import Avg, Count, Prefetch, Q, QuerySet

from .models import Testimonial, TestimonialReply


def get_approved_testimonials(
    *, min_rating: int = 0, limit: int = 20
) -> QuerySet[Testimonial]:
    """
    Return approved testimonials with approved replies prefetched.

    Results are cached per min_rating for 15 minutes.
    """
    cache_key = f"testimonials:list:{min_rating}"
    data = cache.get(cache_key)
    if data is not None:
        return data

    testimonials = list(
        Testimonial.objects.filter(
            status="approved", rating__gte=min_rating
        )
        .prefetch_related(
            Prefetch(
                "replies",
                queryset=TestimonialReply.objects.filter(
                    status="approved"
                ).order_by("created_at"),
            )
        )
        .order_by("-created_at")[:limit]
    )

    cache.set(cache_key, testimonials, 60 * 15)
    return testimonials


def get_testimonial_stats() -> dict:
    """
    Return aggregate statistics for approved testimonials.

    Single query with conditional aggregation instead of 6 separate COUNTs.
    """
    stats = Testimonial.objects.filter(status="approved").aggregate(
        average=Avg("rating"),
        total=Count("id"),
        five_star=Count("id", filter=Q(rating=5)),
        four_star=Count("id", filter=Q(rating=4)),
        three_star=Count("id", filter=Q(rating=3)),
        two_star=Count("id", filter=Q(rating=2)),
        one_star=Count("id", filter=Q(rating=1)),
    )

    return {
        "average_rating": round(stats["average"] or 0, 1),
        "total_reviews": stats["total"],
        "five_star_count": stats["five_star"],
        "four_star_count": stats["four_star"],
        "three_star_count": stats["three_star"],
        "two_star_count": stats["two_star"],
        "one_star_count": stats["one_star"],
    }
