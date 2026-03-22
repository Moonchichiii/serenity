from django.contrib import admin

from .models import GiftVoucher


@admin.register(GiftVoucher)
class GiftVoucherAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "recipient_name",
        "sender_name",
        "amount",
        "service",
        "start_datetime",
        "is_redeemed",
        "created_at",
    )
    list_filter = ("is_redeemed", "preferred_language", "created_at")
    search_fields = ("code", "recipient_name", "sender_name", "recipient_email")
    readonly_fields = ("code", "created_at", "updated_at", "calendar_event_id", "calendar_event_link", "calendar_event_status")
    list_select_related = ("service",)
