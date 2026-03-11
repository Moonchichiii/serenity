"""Google Calendar API integration for managing booking events."""
import base64
import json
import logging
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from decouple import config
from google.auth.exceptions import RefreshError
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CALENDAR_ID = config("GOOGLE_CALENDAR_ID", default="primary")
TZ = ZoneInfo("Europe/Paris")


def _get_credentials() -> Credentials | None:
    """Load service-account credentials from environment."""
    sa_b64 = config("GOOGLE_SERVICE_ACCOUNT_BASE64", default=None)
    if not sa_b64:
        logger.error(
            "GOOGLE_SERVICE_ACCOUNT_BASE64 not set — "
            "cannot authenticate with Google Calendar"
        )
        return None

    try:
        sa_json = base64.b64decode(sa_b64).decode("utf-8")
        info = json.loads(sa_json)
        creds = Credentials.from_service_account_info(
            info, scopes=SCOPES
        )
        return creds
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error("Invalid service-account JSON: %s", e)
        return None


def _get_service() -> Any | None:
    """Get authenticated Calendar API service."""
    creds = _get_credentials()
    if not creds:
        return None
    try:
        return build(
            "calendar",
            "v3",
            credentials=creds,
            cache_discovery=False,
        )
    except RefreshError as e:
        logger.error(
            "Failed to refresh service-account token: %s", e
        )
        return None


def list_busy_days(year: int, month: int) -> list[str]:
    """Get dates (YYYY-MM-DD) that should be visually disabled in the calendar."""
    service = _get_service()
    if not service:
        logger.error(
            "No calendar credentials — cannot fetch busy days"
        )
        return []

    start = datetime(year, month, 1, tzinfo=TZ)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=TZ)
    else:
        end = datetime(year, month + 1, 1, tzinfo=TZ)

    try:
        events_result = (
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

        events = events_result.get("items", [])
        busy_dates: set[str] = set()

        for event in events:
            start_date = event["start"].get("date")
            if start_date:
                busy_dates.add(start_date)

        return sorted(busy_dates)

    except HttpError as error:
        logger.error("Calendar API error (busy days): %s", error)
        return []
    except RefreshError as error:
        logger.error(
            "Token refresh failed (busy days): %s", error
        )
        return []


def list_free_slots(
    date_iso: str,
    slot_minutes: int = 30,
    work_hours: tuple[int, int] = (9, 19),
) -> list[str]:
    """Get available time slots (HH:MM) for a specific date."""
    service = _get_service()
    if not service:
        logger.error(
            "No calendar credentials — cannot fetch slots for %s",
            date_iso,
        )
        return []

    day = datetime.fromisoformat(date_iso).replace(tzinfo=TZ)
    start = day.replace(
        hour=work_hours[0], minute=0, second=0, microsecond=0
    )
    end = day.replace(
        hour=work_hours[1], minute=0, second=0, microsecond=0
    )

    try:
        events_result = (
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

        events = events_result.get("items", [])

        for event in events:
            if event["start"].get("date"):
                logger.info(
                    "All-day event found on %s — no slots available",
                    date_iso,
                )
                return []

        occupied: list[tuple[datetime, datetime]] = []
        for event in events:
            event_start = event["start"].get("dateTime")
            event_end = event["end"].get("dateTime")
            if event_start and event_end:
                occupied.append(
                    (
                        datetime.fromisoformat(event_start),
                        datetime.fromisoformat(event_end),
                    )
                )

        slots: list[str] = []
        current_time = start
        slot_delta = timedelta(minutes=slot_minutes)

        while current_time + slot_delta <= end:
            slot_end = current_time + slot_delta
            is_free = all(
                slot_end <= occ_start or current_time >= occ_end
                for occ_start, occ_end in occupied
            )

            if is_free:
                slots.append(current_time.strftime("%H:%M"))

            current_time += slot_delta

        return slots

    except HttpError as error:
        logger.error("Calendar API error (free slots): %s", error)
        return []
    except RefreshError as error:
        logger.error(
            "Token refresh failed (free slots): %s", error
        )
        return []


def create_booking_event(
    title: str,
    start_datetime: datetime,
    end_datetime: datetime,
    client_email: str,
    client_name: str,
    description: str = "",
) -> dict | None:
    """Create a calendar event for a booking."""
    service = _get_service()
    if not service:
        logger.error("No calendar credentials — cannot create event")
        return None

    full_description = (
        f"CLIENT NAME: {client_name}\n"
        f"CLIENT EMAIL: {client_email}\n"
        f"--------------------------------\n"
        f"{description}"
    )

    event = {
        "summary": title,
        "description": full_description,
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": str(TZ),
        },
        "end": {
            "dateTime": end_datetime.isoformat(),
            "timeZone": str(TZ),
        },
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 24 * 60},
                {"method": "popup", "minutes": 60},
            ],
        },
    }

    try:
        created_event = (
            service.events()
            .insert(
                calendarId=CALENDAR_ID,
                body=event,
            )
            .execute()
        )

        return {
            "id": created_event["id"],
            "link": created_event.get("htmlLink"),
            "status": created_event.get("status"),
        }

    except HttpError as error:
        content = error.content.decode("utf-8") if error.content else ""
        logger.error(f"Failed to create calendar event: {error} | Details: {content}")
        return None
    except RefreshError as error:
        logger.error("Token refresh failed (create event): %s", error)
        return None


def delete_booking_event(event_id: str) -> bool:
    """Delete a calendar event."""
    service = _get_service()
    if not service:
        return False

    try:
        service.events().delete(
            calendarId=CALENDAR_ID,
            eventId=event_id,
        ).execute()
        return True

    except HttpError as error:
        logger.error(
            "Failed to delete calendar event: %s", error
        )
        return False
    except RefreshError as error:
        logger.error(
            "Token refresh failed (delete event): %s", error
        )
        return False
