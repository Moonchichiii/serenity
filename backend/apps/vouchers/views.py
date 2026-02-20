from __future__ import annotations

from typing import TYPE_CHECKING

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import GiftVoucherInputSerializer
from .services import create_voucher, send_voucher_emails

if TYPE_CHECKING:
    from rest_framework.request import Request


@api_view(['POST'])
@permission_classes([AllowAny])
def create_voucher_view(request: Request) -> Response:
    """Create a gift voucher and send notification emails."""
    serializer = GiftVoucherInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    voucher = create_voucher(data=serializer.validated_data)
    send_voucher_emails(voucher=voucher, request=request)

    return Response({'code': voucher.code}, status=status.HTTP_201_CREATED)
