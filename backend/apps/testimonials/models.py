from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from wagtail.admin.panels import FieldPanel
from wagtail.snippets.models import register_snippet


@register_snippet
class Testimonial(models.Model):
    """Customer testimonials with moderation"""

    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("approved", "Approuvé"),
        ("rejected", "Rejeté"),
    ]

    # Customer info
    name = models.CharField(max_length=100, verbose_name="Nom")
    email = models.EmailField(blank=True, verbose_name="Email (optionnel)")

    # Review content
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Note (1-5 étoiles)",
    )
    text = models.TextField(max_length=500, verbose_name="Commentaire")

    # Status & metadata
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        db_index=True,
        verbose_name="Statut",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, verbose_name="Notes admin")

    panels = [
        FieldPanel("name"),
        FieldPanel("email"),
        FieldPanel("rating"),
        FieldPanel("text"),
        FieldPanel("status"),
        FieldPanel("admin_notes"),
    ]

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Témoignage"
        verbose_name_plural = "Témoignages"

    def __str__(self):
        return f"{self.name} - {self.rating}★ ({self.get_status_display()})"

    @property
    def date_display(self):
        """Format: 'Fév 2024'"""
        months_fr = {
            1: "Jan",
            2: "Fév",
            3: "Mar",
            4: "Avr",
            5: "Mai",
            6: "Juin",
            7: "Juil",
            8: "Août",
            9: "Sep",
            10: "Oct",
            11: "Nov",
            12: "Déc",
        }
        return f"{months_fr[self.created_at.month]} {self.created_at.year}"

    @property
    def avatar_url(self):
        return f"https://api.dicebear.com/7.x/initials/svg?seed={self.name}"
