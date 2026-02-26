from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from .serializers import GiftVoucherInputSerializer, GiftVoucherResponseSerializer
from .services import cancel_booking, create_voucher, send_voucher_emails


@api_view(["POST"])
@permission_classes([AllowAny])
def create_voucher_view(request: Request) -> Response:
    serializer = GiftVoucherInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    voucher = create_voucher(serializer.validated_data)
    send_voucher_emails(voucher)

    response_serializer = GiftVoucherResponseSerializer(voucher)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def cancel_booking_view(
    request: Request, confirmation_code: str
) -> Response:
    data, error, status_code = cancel_booking(confirmation_code)
    if error:
        return Response({"detail": error}, status=status_code)
    return Response(data, status=status_code)
