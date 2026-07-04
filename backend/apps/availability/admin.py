from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "customer_name",
        "service",
        "start_datetime",
        "status",
        "customer_email",
        "created_at",
    )
    list_filter = ("status", "service")
    search_fields = ("customer_name", "customer_email")
    date_hierarchy = "start_datetime"
    readonly_fields = ("stripe_checkout_session_id", "google_event_id", "created_at")
