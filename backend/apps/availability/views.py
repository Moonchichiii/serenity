from datetime import date, timedelta

from django.http import JsonResponse

# Create your views here.


def busy(request):
    year = int(request.GET.get('year'))
    month = int(request.GET.get('month'))
    # demo: block every Monday + 20th of the month
    d = date(year, month, 1)
    busy = []
    while d.month == month:
        if d.weekday() == 0 or d.day == 20:
            busy.append(d.isoformat())
        d += timedelta(days=1)
    return JsonResponse({'busy': busy})


def slots(request):
    iso = request.GET.get('date')  # "YYYY-MM-DD"
    # demo: morning slots only if not the 20th
    if iso and iso.endswith('-20'):
        return JsonResponse({'times': []})
    return JsonResponse(
        {
            'times': [
                '09:00',
                '09:30',
                '10:00',
                '10:30',
                '11:00',
                '11:30',
                '13:00',
                '13:30',
                '14:00',
                '14:30',
                '15:00',
                '15:30',
                '16:00',
            ]
        }
    )
