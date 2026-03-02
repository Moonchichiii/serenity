from __future__ import annotations

from typing import TYPE_CHECKING

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import CheckoutRequestSerializer, CheckoutResponseSerializer
from .services import create_checkout_session

if TYPE_CHECKING:
    from rest_framework.request import Request


@api_view(["POST"])
@permission_classes([AllowAny])
def create_checkout(request: Request) -> Response:
    ser = CheckoutRequestSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    payment, url = create_checkout_session(voucher_payload=ser.validated_data)

    out = CheckoutResponseSerializer(
        {"url": url, "session_id": payment.stripe_checkout_session_id}
    )

    return Response(out.data, status=201)
