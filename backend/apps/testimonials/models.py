from django.core.cache import cache
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from wagtail.admin.panels import FieldPanel
from wagtail.snippets.models import register_snippet


@register_snippet
class Testimonial(models.Model):
    """Customer testimonials with moderation."""

    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("approved", "Approuvé"),
        ("rejected", "Rejeté"),
    ]

    name = models.CharField(max_length=100, verbose_name="Nom")
    email = models.EmailField(blank=True, verbose_name="Email (optionnel)")

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Note (1-5 étoiles)",
    )
    text = models.TextField(max_length=500, verbose_name="Commentaire")

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
        """Format date as 'Fév 2024'."""
        months_fr = {
            1: "Jan", 2: "Fév", 3: "Mar", 4: "Avr", 5: "Mai", 6: "Juin",
            7: "Juil", 8: "Août", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Déc",
        }
        return f"{months_fr[self.created_at.month]} {self.created_at.year}"

    @property
    def avatar_url(self):
        """Generate avatar URL using ui-avatars.com."""
        import urllib.parse
        name = self.name or "Anonymous"
        encoded_name = urllib.parse.quote(name)
        return f"https://ui-avatars.com/api/?name={encoded_name}&background=random&size=128"


@register_snippet
class TestimonialReply(models.Model):
    """Reply to a testimonial."""

    parent = models.ForeignKey(
        Testimonial,
        on_delete=models.CASCADE,
        related_name="replies",
        verbose_name="Témoignage parent"
    )
    name = models.CharField(max_length=100, verbose_name="Nom")
    email = models.EmailField(verbose_name="Email (privé)")
    text = models.TextField(max_length=500, verbose_name="Réponse")

    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("approved", "Approuvé"),
        ("rejected", "Rejeté"),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        verbose_name="Statut"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    panels = [
        FieldPanel("parent"),
        FieldPanel("name"),
        FieldPanel("email"),
        FieldPanel("text"),
        FieldPanel("status"),
    ]

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Réponse"
        verbose_name_plural = "Réponses"

    def __str__(self):
        return f"Reply by {self.name}"


@receiver(post_save, sender=Testimonial)
def clear_testimonials_cache(sender, instance, **kwargs):
    """Clear testimonials cache on save."""
    for rating in range(0, 6):
        cache.delete(f"testimonials:list:{rating}")


@receiver(post_save, sender=TestimonialReply)
def clear_cache_on_reply(sender, instance, **kwargs):
    """Clear testimonials cache when reply is saved."""
    for rating in range(0, 6):
        cache.delete(f"testimonials:list:{rating}")
