from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.cache import cache_page

from .google_calendar import list_busy_days, list_free_slots


@cache_page(60 * 5)
def busy(request):
    """Return busy dates for a given year and month."""
    year = int(request.GET.get("year"))
    month = int(request.GET.get("month"))

    cache_key = f"calendar:busy:{year}:{month}"
    busy_dates = cache.get(cache_key)

    if busy_dates is None:
        busy_dates = list_busy_days(year, month)
        cache.set(cache_key, busy_dates, 60 * 5)

    return JsonResponse({"busy": busy_dates})


@cache_page(60)
def slots(request):
    """Return available time slots for a given date."""
    iso = request.GET.get("date")

    cache_key = f"calendar:slots:{iso}"
    times = cache.get(cache_key)

    if times is None:
        times = list_free_slots(iso)
        cache.set(cache_key, times, 60)

    return JsonResponse({"times": times})
