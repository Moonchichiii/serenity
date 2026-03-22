from django.db.models import QuerySet

from .models import Service


def get_available_services() -> QuerySet[Service]:
    """Return all available services with their images prefetched."""
    return (
        Service.objects.filter(is_available=True)
        .select_related("image")
        .order_by("title_en")
    )
