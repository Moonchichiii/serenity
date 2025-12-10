from django.contrib import admin
from django.utils import timezone

from .models import GiftVoucher


@admin.register(GiftVoucher)
class GiftVoucherAdmin(admin.ModelAdmin):
    list_display = ("code", "recipient_name", "purchaser_name", "created_at", "is_redeemed", "redeemed_at")
    list_filter = ("is_redeemed", "created_at")
    search_fields = ("code", "recipient_name", "purchaser_name", "purchaser_email", "recipient_email")
    readonly_fields = ("code", "created_at", "redeemed_at")

    actions = ["mark_as_redeemed"]

    @admin.action(description="Mark selected vouchers as REDEEMED")
    def mark_as_redeemed(self, request, queryset):
        queryset.update(is_redeemed=True, redeemed_at=timezone.now())

    def save_model(self, request, obj, form, change):
        # Allow manual toggling of redeemed status to update timestamp
        if change and "is_redeemed" in form.changed_data:
            if obj.is_redeemed:
                obj.redeemed_at = timezone.now()
            else:
                obj.redeemed_at = None
        super().save_model(request, obj, form, change)
