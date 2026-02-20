from __future__ import annotations

from typing import ClassVar

from django.db import models

from apps.services.models import Service


class Booking(models.Model):
    """
    Represents a service booking with client details and calendar
    integration. Supports both online and voucher-sourced bookings.
    """

    STATUS_CHOICES: ClassVar[list[tuple[str, str]]] = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    SOURCE_CHOICES: ClassVar[list[tuple[str, str]]] = [
        ('online', 'Online'),
        ('voucher', 'Voucher'),
        ('manual', 'Manual'),
    ]

    # Core booking info
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name='bookings'
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default='pending'
    )
    source = models.CharField(
        max_length=16,
        choices=SOURCE_CHOICES,
        default='online',
        help_text='How this booking originated',
    )

    # Client details
    client_name = models.CharField(max_length=200)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=64)
    client_notes = models.TextField(blank=True, default='')
    preferred_language = models.CharField(max_length=2, default='fr')

    # Confirmation
    confirmation_code = models.CharField(max_length=12, unique=True)

    # Voucher linkage (soft reference)
    voucher_code = models.CharField(
        max_length=20,
        blank=True,
        default='',
        db_index=True,
        help_text='Gift voucher code if booked via voucher redemption',
    )

    # Google Calendar integration
    google_calendar_event_id = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Google Calendar event ID for syncing',
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Changed to tuples to satisfy RUF012 (immutable class attributes)
        ordering = ('-created_at',)
        indexes = (
            models.Index(fields=['client_email']),
            models.Index(fields=['confirmation_code']),
            models.Index(fields=['status']),
            models.Index(fields=['source']),
        )

    def __str__(self) -> str:
        label = (
            f'[{self.get_source_display()}] '
            if self.source != 'online'
            else ''
        )
        return (
            f'{label}{self.client_name} - {self.service} '
            f'- {self.start_datetime:%Y-%m-%d %H:%M}'
        )
