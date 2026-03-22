from .models import GiftVoucher

_BASE_QS = GiftVoucher.objects.select_related("service")

def get_all_vouchers() -> list[GiftVoucher]:
    return list(_BASE_QS.order_by("-created_at"))

def get_voucher_by_code(code: str) -> GiftVoucher | None:
    return _BASE_QS.filter(code=code).first()
