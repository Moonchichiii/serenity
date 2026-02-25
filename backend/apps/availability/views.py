from __future__ import annotations

from typing import TYPE_CHECKING

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .selectors import get_busy_days, get_free_slots
from .serializers import BusyDaysQuerySerializer, FreeSlotsQuerySerializer

if TYPE_CHECKING:
    from rest_framework.request import Request


@extend_schema(
    operation_id="availability_busy_days",
    tags=["availability"],
    parameters=[
        OpenApiParameter(
            name="year",
            type=int,
            location=OpenApiParameter.QUERY,
            required=True,
        ),
        OpenApiParameter(
            name="month",
            type=int,
            location=OpenApiParameter.QUERY,
            required=True,
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "busy": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "List of days in the month that are fully booked",
                }
            },
        }
    },
    summary="Get busy days for month",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def busy(request: Request) -> Response:
    """
    Return busy dates for a given year and month.
    """
    ser = BusyDaysQuerySerializer(data=request.query_params)
    ser.is_valid(raise_exception=True)

    data = get_busy_days(
        year=ser.validated_data["year"],
        month=ser.validated_data["month"],
    )
    return Response({"busy": data})


@extend_schema(
    operation_id="availability_slots",
    tags=["availability"],
    parameters=[
        OpenApiParameter(
            name="date",
            type=str,
            location=OpenApiParameter.QUERY,
            required=True,
            description="ISO date string (YYYY-MM-DD)",
        ),
    ],
    responses={
        200: {
            "type": "object",
            "properties": {
                "times": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of available time strings (HH:MM)",
                }
            },
        }
    },
    summary="Get available time slots",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def slots(request: Request) -> Response:
    """
    Return available time slots for a given date.
    """
    ser = FreeSlotsQuerySerializer(data=request.query_params)
    ser.is_valid(raise_exception=True)

    times = get_free_slots(date_iso=ser.validated_data["date"].isoformat())
    return Response({"times": times})
