"""Booking API endpoints — thin delegation to services and selectors."""

from __future__ import annotations

from typing import TYPE_CHECKING

from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
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


@extend_schema(
    methods=["GET"],
    operation_id="bookings_list",
    tags=["bookings"],
    parameters=[
        OpenApiParameter(
            name="email",
            description="Filter bookings by email address",
            required=False,
            type=str,
        )
    ],
    responses={200: BookingSerializer(many=True)},
    summary="List bookings",
)
@extend_schema(
    methods=["POST"],
    operation_id="bookings_create",
    tags=["bookings"],
    request=BookingRequestSerializer,
    responses={
        201: BookingSerializer,
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Service error or Unavailable"),
    },
    summary="Create online booking",
)
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def bookings(request: Request) -> Response:
    """GET: list bookings (filter by ?email=). POST: create online booking."""
    if request.method == "POST":
        ser = BookingRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        booking, error = create_booking(ser.validated_data)
        if error:
            return Response({"detail": error}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )

    email = request.query_params.get("email")
    qs = get_bookings_by_email(email) if email else get_all_bookings()
    return Response(BookingSerializer(qs, many=True).data)


@extend_schema(
    operation_id="voucher_booking_create",
    tags=["bookings"],
    request=VoucherBookingRequestSerializer,
    responses={
        201: BookingSerializer,
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Voucher invalid or Service not found"),
    },
    summary="Redeem voucher for booking",
)
@api_view(["POST"])
@permission_classes([AllowAny])
def voucher_bookings(request: Request) -> Response:
    """Create a booking from a voucher redemption."""
    ser = VoucherBookingRequestSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    booking, error = create_voucher_booking(ser.validated_data)
    if error:
        return Response({"detail": error}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        BookingSerializer(booking).data,
        status=status.HTTP_201_CREATED,
    )


@extend_schema(
    operation_id="booking_cancel",
    tags=["bookings"],
    responses={
        200: OpenApiResponse(description="Booking cancelled successfully"),
        404: OpenApiResponse(description="Booking not found"),
    },
    summary="Cancel booking",
)
@api_view(["DELETE"])
@permission_classes([AllowAny])
def cancel_booking_view(request: Request, confirmation_code: str) -> Response:
    """Cancel a booking by confirmation code."""
    data, error, http_status = cancel_booking(confirmation_code)
    if error:
        return Response({"detail": error}, status=http_status)
    return Response(data, status=http_status)
