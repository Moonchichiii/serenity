"""
Google Calendar integration for Serenity
Handles reading availability + creating bookings
"""

import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from decouple import config
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CALENDAR_ID = config("GOOGLE_CALENDAR_ID", default="primary")
TZ = ZoneInfo("Europe/Paris")


def _get_credentials():
    """
    Load credentials from environment and refresh if needed.
    Returns None if token is missing.
    """
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

        # Refresh if expired
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Note: In production, save refreshed token back to storage

        return creds
    except (json.JSONDecodeError, KeyError) as e:
        print(f"❌ Invalid token format: {e}")
        return None


def _get_service():
    """Get authenticated Calendar API service."""
    creds = _get_credentials()
    if not creds:
        return None
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def list_busy_days(year: int, month: int) -> list[str]:
    """
    Get list of dates (YYYY-MM-DD) that have any events.
    Used to gray out fully booked days in calendar.
    """
    service = _get_service()
    if not service:
        return []  # Fallback if no credentials

    # Month range
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
            # Handle all-day events
            start_date = event["start"].get("date")
            if start_date:
                busy_dates.add(start_date)
            else:
                # DateTime event - extract date
                start_dt = event["start"].get("dateTime")
                if start_dt:
                    date_str = datetime.fromisoformat(start_dt).date().isoformat()
                    busy_dates.add(date_str)

        return sorted(busy_dates)

    except HttpError as error:
        print(f"❌ Calendar API error: {error}")
        return []


def list_free_slots(
    date_iso: str, slot_minutes: int = 30, work_hours: tuple = (9, 19)
) -> list[str]:
    """
    Get available time slots (HH:MM) for a specific date.

    Args:
        date_iso: Date in YYYY-MM-DD format
        slot_minutes: Duration of each time slot (default 30 min)
        work_hours: Tuple of (start_hour, end_hour) in 24h format

    Returns:
        List of available time slots as strings (e.g., ["09:00", "09:30", ...])
    """
    service = _get_service()
    if not service:
        # Fallback demo times if no credentials
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

    # Parse date and set work hours
    day = datetime.fromisoformat(date_iso).replace(tzinfo=TZ)
    start = day.replace(hour=work_hours[0], minute=0, second=0, microsecond=0)
    end = day.replace(hour=work_hours[1], minute=0, second=0, microsecond=0)

    try:
        # Get all events for this day
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

        # Collect occupied time ranges
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

        # Generate available slots
        slots = []
        current_time = start
        slot_delta = timedelta(minutes=slot_minutes)

        while current_time + slot_delta <= end:
            # Check if this slot conflicts with any occupied range
            slot_end = current_time + slot_delta
            is_free = True

            for occ_start, occ_end in occupied:
                # Slot conflicts if it overlaps with occupied range
                if not (slot_end <= occ_start or current_time >= occ_end):
                    is_free = False
                    break

            if is_free:
                slots.append(current_time.strftime("%H:%M"))

            current_time += slot_delta

        return slots

    except HttpError as error:
        print(f"❌ Calendar API error: {error}")
        return []


def create_booking_event(
    title: str,
    start_datetime: datetime,
    end_datetime: datetime,
    client_email: str,
    client_name: str,
    description: str = "",
) -> dict | None:
    """
    Create a calendar event for a booking.

    Args:
        title: Event title (e.g., "Swedish Massage - Jane Doe")
        start_datetime: Start time (timezone-aware)
        end_datetime: End time (timezone-aware)
        client_email: Client's email for calendar invite
        client_name: Client's name
        description: Additional notes

    Returns:
        dict with event details (id, htmlLink) or None if failed
    """
    service = _get_service()
    if not service:
        print("❌ No calendar credentials available")
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
        "attendees": [{"email": client_email, "displayName": client_name}],
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 24 * 60},  # 1 day before
                {"method": "popup", "minutes": 60},  # 1 hour before
            ],
        },
    }

    try:
        created_event = (
            service.events()
            .insert(
                calendarId=CALENDAR_ID,
                body=event,
                sendUpdates="all",  # Send email invite to client
            )
            .execute()
        )

        return {
            "id": created_event["id"],
            "link": created_event.get("htmlLink"),
            "status": created_event.get("status"),
        }

    except HttpError as error:
        print(f"❌ Failed to create calendar event: {error}")
        return None


def delete_booking_event(event_id: str) -> bool:
    """
    Delete a calendar event (for cancellations).

    Args:
        event_id: Google Calendar event ID

    Returns:
        True if successfully deleted, False otherwise
    """
    service = _get_service()
    if not service:
        return False

    try:
        service.events().delete(
            calendarId=CALENDAR_ID,
            eventId=event_id,
            sendUpdates="all",  # Notify attendees
        ).execute()
        return True

    except HttpError as error:
        print(f"❌ Failed to delete event: {error}")
        return False
