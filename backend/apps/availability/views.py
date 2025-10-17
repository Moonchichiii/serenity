from django.http import JsonResponse

from .google_calendar import list_busy_days, list_free_slots


def busy(request):
    year = int(request.GET.get("year"))
    month = int(request.GET.get("month"))
    return JsonResponse({"busy": list_busy_days(year, month)})


def slots(request):
    iso = request.GET.get("date")  # "YYYY-MM-DD"
    return JsonResponse({"times": list_free_slots(iso)})
