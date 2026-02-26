from .models import Booking

_BASE_QS = Booking.objects.select_related("service")


def get_all_bookings() -> list[Booking]:
    return list(_BASE_QS.order_by("-created_at"))


def get_bookings_by_email(email: str) -> list[Booking]:
    return list(
        _BASE_QS.filter(client_email__iexact=email).order_by(
            "-created_at"
        )
    )


def get_booking_by_confirmation_code(code: str) -> Booking | None:
    return _BASE_QS.filter(confirmation_code=code).first()
