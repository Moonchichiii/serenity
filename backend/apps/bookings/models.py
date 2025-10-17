from django.db import models

from apps.services.models import Service


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "pending"),
        ("confirmed", "confirmed"),
        ("cancelled", "cancelled"),
        ("completed", "completed"),
    ]
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name="bookings"
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    client_name = models.CharField(max_length=200)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=64)
    client_notes = models.TextField(blank=True, default="")
    preferred_language = models.CharField(max_length=2, default="fr")
    confirmation_code = models.CharField(max_length=12, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client_name} - {self.service} - {self.start_datetime:%Y-%m-%d %H:%M}"
