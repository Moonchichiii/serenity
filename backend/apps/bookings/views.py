import secrets

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.services.models import Service

from .models import Booking
from .serializers import BookingRequestSerializer, BookingSerializer


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def bookings(request):
    if request.method == "POST":
        ser = BookingRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        try:
            service = Service.objects.get(id=data["service_id"], is_available=True)
        except Service.DoesNotExist:
            return Response(
                {"detail": "Service not found"}, status=status.HTTP_404_NOT_FOUND
            )

        code = secrets.token_hex(4).upper()
        booking = Booking.objects.create(
            service=service,
            start_datetime=data["start_datetime"],
            end_datetime=data["end_datetime"],
            status="pending",
            client_name=data["client_name"],
            client_email=data["client_email"],
            client_phone=data["client_phone"],
            client_notes=data.get("client_notes", ""),
            preferred_language=data["preferred_language"],
            confirmation_code=code,
        )
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    # GET ?email=
    email = request.GET.get("email")
    qs = Booking.objects.all()
    if email:
        qs = qs.filter(client_email=email)
    return Response(BookingSerializer(qs, many=True).data)
