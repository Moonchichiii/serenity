"""Booking API endpoints — thin delegation to services and selectors."""

from __future__ import annotations

from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .selectors import get_all_bookings, get_bookings_by_email
from .serializers import (
    BookingRequestSerializer,
    BookingSerializer,
    VoucherBookingRequestSerializer,
)
from .services import cancel_booking, create_booking, create_voucher_booking

if TYPE_CHECKING:
    from rest_framework.request import Request


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def bookings(request: Request) -> Response:
    """GET: list bookings (filter by ?email=). POST: create online booking."""
    if request.method == 'POST':
        ser = BookingRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        booking, error = create_booking(ser.validated_data)
        if error:
            return Response(
                {'detail': error}, status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )

    email = request.query_params.get('email')
    qs = get_bookings_by_email(email) if email else get_all_bookings()
    return Response(BookingSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def voucher_bookings(request: Request) -> Response:
    """Create a booking from a voucher redemption."""
    ser = VoucherBookingRequestSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    booking, error = create_voucher_booking(ser.validated_data)
    if error:
        return Response(
            {'detail': error}, status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        BookingSerializer(booking).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['DELETE'])
@permission_classes([AllowAny])
def cancel_booking_view(request: Request, confirmation_code: str) -> Response:
    """Cancel a booking by confirmation code."""
    data, error, http_status = cancel_booking(confirmation_code)
    if error:
        return Response({'detail': error}, status=http_status)
    return Response(data, status=http_status)
