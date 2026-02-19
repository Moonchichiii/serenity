from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "confirmation_code",
        "client_name",
        "service",
        "source",
        "status",
        "start_datetime",
        "created_at",
    ]
    list_filter = ["status", "source", "created_at"]
    search_fields = [
        "client_name",
        "client_email",
        "confirmation_code",
        "voucher_code",
    ]
    readonly_fields = [
        "confirmation_code",
        "google_calendar_event_id",
        "created_at",
        "updated_at",
    ]
    list_select_related = ["service"]
