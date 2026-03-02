from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from .serializers import CheckoutRequestSerializer, CheckoutResponseSerializer
from .services import create_checkout_session


@api_view(["POST"])
@permission_classes([AllowAny])
def create_checkout(request: Request) -> Response:
    ser = CheckoutRequestSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    payment = create_checkout_session(voucher_payload=ser.validated_data)

    out = CheckoutResponseSerializer(
        {"url": f"https://checkout.stripe.com/c/pay/{payment.stripe_checkout_session_id}",
         "session_id": payment.stripe_checkout_session_id}
    )

    # Better: use session.url returned by Stripe if present in your SDK version.
    # Some SDK versions return session.url; if available, return that instead.

    return Response(out.data, status=201)
