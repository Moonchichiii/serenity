"""
Booking API endpoints with Google Calendar integration
"""

import secrets
from zoneinfo import ZoneInfo

from django.core.cache import cache
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.availability.google_calendar import create_booking_event, delete_booking_event
from apps.services.models import Service

from .models import Booking
from .serializers import BookingRequestSerializer, BookingSerializer

TZ = ZoneInfo("Europe/Paris")


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def bookings(request):
    """
    GET: List bookings (optionally filtered by email)
    POST: Create new booking and add to Google Calendar
    """

    if request.method == "POST":
        ser = BookingRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # Validate service exists and is available
        try:
            service = Service.objects.get(id=data["service_id"], is_available=True)
        except Service.DoesNotExist:
            return Response(
                {"detail": "Service not found or unavailable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Ensure datetimes are timezone-aware
        start_dt = data["start_datetime"]
        end_dt = data["end_datetime"]

        if start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=TZ)
        if end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=TZ)

        # Generate confirmation code
        confirmation_code = secrets.token_hex(4).upper()

        # Create database record
        booking = Booking.objects.create(
            service=service,
            start_datetime=start_dt,
            end_datetime=end_dt,
            status="pending",
            client_name=data["client_name"],
            client_email=data["client_email"],
            client_phone=data["client_phone"],
            client_notes=data.get("client_notes", ""),
            preferred_language=data["preferred_language"],
            confirmation_code=confirmation_code,
        )

        # Invalidate calendar caches
        start_date = start_dt.date()
        cache.delete(f"calendar:busy:{start_date.year}:{start_date.month}")
        cache.delete(f"calendar:slots:{start_date.isoformat()}")

        # Create Google Calendar event
        event_title = f"{service.title_en} - {data['client_name']}"
        description = f"""
Booking Details:
- Service: {service.title_en} ({service.duration_minutes} min)
- Client: {data['client_name']}
- Email: {data['client_email']}
- Phone: {data['client_phone']}
- Confirmation Code: {confirmation_code}

Notes: {data.get('client_notes', 'N/A')}
        """.strip()

        calendar_event = create_booking_event(
            title=event_title,
            start_datetime=start_dt,
            end_datetime=end_dt,
            client_email=data["client_email"],
            client_name=data["client_name"],
            description=description,
        )

        if calendar_event:
            # Save Google Calendar event ID for future reference
            booking.google_calendar_event_id = calendar_event["id"]
            booking.status = "confirmed"
            booking.save()

            print(f"✅ Booking created: {confirmation_code}")
            print(f"📅 Calendar event: {calendar_event['link']}")
        else:
            print(f"⚠️ Booking {confirmation_code} created but calendar sync failed")

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    # GET: List bookings
    email = request.GET.get("email")
    qs = Booking.objects.all().order_by("-created_at")

    if email:
        qs = qs.filter(client_email__iexact=email)

    return Response(BookingSerializer(qs, many=True).data)


@api_view(["DELETE"])
@permission_classes([AllowAny])  # In production, add proper auth
def cancel_booking(request, confirmation_code):
    """
    Cancel a booking and remove from Google Calendar.
    """
    try:
        booking = Booking.objects.get(confirmation_code=confirmation_code)
    except Booking.DoesNotExist:
        return Response(
            {"detail": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Can only cancel pending/confirmed bookings
    if booking.status not in ["pending", "confirmed"]:
        return Response(
            {"detail": f"Cannot cancel {booking.status} booking"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Delete from Google Calendar
    if booking.google_calendar_event_id:
        success = delete_booking_event(booking.google_calendar_event_id)
        if success:
            print(f"✅ Deleted calendar event {booking.google_calendar_event_id}")
        else:
            print("⚠️ Failed to delete calendar event")

    # Mark as cancelled (don't actually delete for record keeping)
    booking.status = "cancelled"
    booking.save()

    # Invalidate calendar caches
    start_date = booking.start_datetime.date()
    cache.delete(f"calendar:busy:{start_date.year}:{start_date.month}")
    cache.delete(f"calendar:slots:{start_date.isoformat()}")

    return Response(
        {"detail": "Booking cancelled successfully"}, status=status.HTTP_200_OK
    )
