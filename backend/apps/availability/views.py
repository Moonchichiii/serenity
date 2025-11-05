from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.cache import cache_page

from .google_calendar import list_busy_days, list_free_slots


@cache_page(60 * 5)  # 5 min cache
def busy(request):
    year = int(request.GET.get("year"))
    month = int(request.GET.get("month"))

    cache_key = f"calendar:busy:{year}:{month}"
    busy_dates = cache.get(cache_key)

    if busy_dates is None:
        busy_dates = list_busy_days(year, month)
        cache.set(cache_key, busy_dates, 60 * 5)

    return JsonResponse({"busy": busy_dates})


@cache_page(60)  # 1 min cache
def slots(request):
    iso = request.GET.get("date")  # "YYYY-MM-DD"

    cache_key = f"calendar:slots:{iso}"
    times = cache.get(cache_key)

    if times is None:
        times = list_free_slots(iso)
        cache.set(cache_key, times, 60)

    return JsonResponse({"times": times})
