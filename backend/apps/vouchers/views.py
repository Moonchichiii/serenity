from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .serializers import GiftVoucherInputSerializer, GiftVoucherResponseSerializer
from .services import create_voucher, send_voucher_emails


class GiftVoucherCreateThrottle(AnonRateThrottle):
    rate = "10/hour"


@api_view(["POST"])
@throttle_classes([GiftVoucherCreateThrottle])
@permission_classes([AllowAny])
def create_voucher_view(request: Request) -> Response:
    serializer = GiftVoucherInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    voucher = create_voucher(serializer.validated_data)
    send_voucher_emails(voucher)

    response_serializer = GiftVoucherResponseSerializer(voucher)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)
