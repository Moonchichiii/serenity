from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from decouple import config
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
CALENDAR_ID = config("GOOGLE_CALENDAR_ID", default="primary")
TZ = ZoneInfo("Europe/Paris")


def _credentials():
    # For production, store token in DB or env; keep minimal here.
    # Expect serialized token in env (JSON); or mount token.json in ephemeral disk.
    token_json = config("GOOGLE_OAUTH_TOKEN_JSON", default=None)
    if not token_json:
        return None
    import json

    data = json.loads(token_json)
    return Credentials.from_authorized_user_info(data, SCOPES)


def list_busy_days(year: int, month: int) -> list[str]:
    creds = _credentials()
    if not creds:
        return []  # fallback if token missing
    service = build("calendar", "v3", credentials=creds, cache_discovery=False)
    start = datetime(year, month, 1, tzinfo=TZ)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=TZ)
    else:
        end = datetime(year, month + 1, 1, tzinfo=TZ)
    events = (
        service.events()
        .list(
            calendarId=CALENDAR_ID,
            timeMin=start.isoformat(),
            timeMax=end.isoformat(),
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    busy = set()
    for e in events.get("items", []):
        s = e["start"].get("date") or e["start"].get("dateTime")
        if "date" in e["start"]:
            busy.add(s)  # all-day events
        else:
            d = datetime.fromisoformat(s).date().isoformat()
            busy.add(d)
    return sorted(busy)


def list_free_slots(date_iso: str, slot_minutes=30, work_hours=(9, 19)) -> list[str]:
    creds = _credentials()
    if not creds:
        # fallback demo times if token missing
        return [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
            "16:30",
            "17:00",
            "17:30",
            "18:00",
        ]
    service = build("calendar", "v3", credentials=creds, cache_discovery=False)
    day = datetime.fromisoformat(date_iso).replace(tzinfo=TZ)
    start = day.replace(hour=work_hours[0], minute=0, second=0, microsecond=0)
    end = day.replace(hour=work_hours[1], minute=0, second=0, microsecond=0)

    events = (
        service.events()
        .list(
            calendarId=CALENDAR_ID,
            timeMin=start.isoformat(),
            timeMax=end.isoformat(),
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    occupied = []
    for e in events.get("items", []):
        s = e["start"].get("dateTime")
        f = e["end"].get("dateTime")
        if not s or not f:
            continue
        occupied.append((datetime.fromisoformat(s), datetime.fromisoformat(f)))

    # build slots
    t = start
    slots = []
    delta = timedelta(minutes=slot_minutes)
    while t + delta <= end:
        # slot free if it doesn't intersect any occupied
        conflict = any(not (t + delta <= s or t >= f) for s, f in occupied)
        if not conflict:
            slots.append(t.strftime("%H:%M"))
        t += delta
    return slots
