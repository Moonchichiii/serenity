"""
Google Calendar API client for Serenity.

Low-level functions for reading availability and managing booking events.
Consumed by selectors.py (reads) and apps.bookings.services (writes).
"""

import json
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from decouple import config
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CALENDAR_ID = config("GOOGLE_CALENDAR_ID", default="primary")
TZ = ZoneInfo("Europe/Paris")


def _get_credentials():
    """Load credentials from environment and refresh if needed."""
    token_json = config("GOOGLE_OAUTH_TOKEN_JSON", default=None)
    if not token_json:
        return None

    try:
        data = json.loads(token_json)
        creds = Credentials(
            token=data.get("token"),
            refresh_token=data.get("refresh_token"),
            token_uri=data.get("token_uri"),
            client_id=data.get("client_id"),
            client_secret=data.get("client_secret"),
            scopes=data.get("scopes", SCOPES),
        )

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        return creds
    except (json.JSONDecodeError, KeyError) as e:
        logger.error("Invalid Google OAuth token format: %s", e)
        return None


def _get_service():
    """Get authenticated Calendar API service."""
    creds = _get_credentials()
    if not creds:
        return None
    return build(
        "calendar", "v3", credentials=creds, cache_discovery=False
    )


def list_busy_days(year: int, month: int) -> list[str]:
    """Get dates (YYYY-MM-DD) that have any events for a given month."""
    service = _get_service()
    if not service:
        logger.error("No calendar credentials — cannot fetch busy days")
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
        busy_dates = set()

        for event in events:
            start_date = event["start"].get("date")
            if start_date:
                busy_dates.add(start_date)
            else:
                start_dt = event["start"].get("dateTime")
                if start_dt:
                    date_str = (
                        datetime.fromisoformat(start_dt)
                        .date()
                        .isoformat()
                    )
                    busy_dates.add(date_str)

        return sorted(busy_dates)

    except HttpError as error:
        logger.error("Calendar API error (busy days): %s", error)
        return []


def list_free_slots(
    date_iso: str,
    slot_minutes: int = 30,
    work_hours: tuple = (9, 19),
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

        occupied = []
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

        slots = []
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

    event = {
        "summary": title,
        "description": f"Client: {client_name}\n\n{description}",
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": str(TZ),
        },
        "end": {
            "dateTime": end_datetime.isoformat(),
            "timeZone": str(TZ),
        },
        "attendees": [
            {"email": client_email, "displayName": client_name}
        ],
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
                sendUpdates="all",
            )
            .execute()
        )

        return {
            "id": created_event["id"],
            "link": created_event.get("htmlLink"),
            "status": created_event.get("status"),
        }

    except HttpError as error:
        logger.error("Failed to create calendar event: %s", error)
        return None


def delete_booking_event(event_id: str) -> bool:
    """Delete a calendar event (for cancellations)."""
    service = _get_service()
    if not service:
        return False

    try:
        service.events().delete(
            calendarId=CALENDAR_ID,
            eventId=event_id,
            sendUpdates="all",
        ).execute()
        return True

    except HttpError as error:
        logger.error("Failed to delete calendar event: %s", error)
        return False
