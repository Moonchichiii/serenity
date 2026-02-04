from django.db import models

from apps.services.models import Service


class Booking(models.Model):
    """Represents a service booking with client details and calendar integration."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    # Core booking info
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name="bookings"
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")

    # Client details
    client_name = models.CharField(max_length=200)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=64)
    client_notes = models.TextField(blank=True, default="")
    preferred_language = models.CharField(max_length=2, default="fr")

    # Confirmation
    confirmation_code = models.CharField(max_length=12, unique=True)

    # Google Calendar integration
    google_calendar_event_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Google Calendar event ID for syncing",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["client_email"]),
            models.Index(fields=["confirmation_code"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.client_name} - {self.service} - {self.start_datetime:%Y-%m-%d %H:%M}"
