from django.http import JsonResponse

from .selectors import get_busy_days, get_free_slots


def busy(request):
    """Return busy dates for a given year and month."""
    raw_year = request.GET.get("year")
    raw_month = request.GET.get("month")

    if not raw_year or not raw_month:
        return JsonResponse(
            {"error": "Both 'year' and 'month' query params are required."},
            status=400,
        )

    try:
        year = int(raw_year)
        month = int(raw_month)
    except (TypeError, ValueError):
        return JsonResponse(
            {"error": "'year' and 'month' must be integers."},
            status=400,
        )

    if not (1 <= month <= 12):
        return JsonResponse(
            {"error": "'month' must be between 1 and 12."},
            status=400,
        )

    busy_dates = get_busy_days(year=year, month=month)
    return JsonResponse({"busy": busy_dates})


def slots(request):
    """Return available time slots for a given date."""
    date_iso = request.GET.get("date")

    if not date_iso:
        return JsonResponse(
            {"error": "'date' query param is required."},
            status=400,
        )

    # Basic format check (YYYY-MM-DD)
    parts = date_iso.split("-")
    if len(parts) != 3 or not all(p.isdigit() for p in parts):
        return JsonResponse(
            {"error": "'date' must be in YYYY-MM-DD format."},
            status=400,
        )

    times = get_free_slots(date_iso=date_iso)
    return JsonResponse({"times": times})
