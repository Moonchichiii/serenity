from __future__ import annotations

import urllib.parse
from typing import ClassVar

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.snippets.models import register_snippet

MONTHS_FR: ClassVar[dict[int, str]] = {
    1: 'Jan',
    2: 'Fév',
    3: 'Mar',
    4: 'Avr',
    5: 'Mai',
    6: 'Juin',
    7: 'Juil',
    8: 'Août',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Déc',
}


@register_snippet
class Testimonial(ClusterableModel):
    """Customer testimonial with moderation support."""

    STATUS_CHOICES: ClassVar[list[tuple[str, str]]] = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ]

    name = models.CharField(max_length=100, verbose_name='Nom')
    email = models.EmailField(blank=True, verbose_name='Email (optionnel)')

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Note (1-5 étoiles)',
    )
    text = models.TextField(max_length=500, verbose_name='Commentaire')

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,
        verbose_name='Statut',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, verbose_name='Notes admin')

    panels: ClassVar[list] = [
        FieldPanel('name'),
        FieldPanel('email'),
        FieldPanel('rating'),
        FieldPanel('text'),
        FieldPanel('status'),
        FieldPanel('admin_notes'),
        InlinePanel('replies', label='Réponses / Replies'),
    ]

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Témoignage'
        verbose_name_plural = 'Témoignages'

    def __str__(self) -> str:
        return f'{self.name} - {self.rating}★ ({self.get_status_display()})'

    @property
    def date_display(self) -> str:
        """Format date as 'Fév 2024'."""
        return f'{MONTHS_FR[self.created_at.month]} {self.created_at.year}'

    @property
    def avatar_url(self) -> str:
        """Generate avatar URL using ui-avatars.com."""
        name = urllib.parse.quote(self.name or 'Anonymous')
        return (
            f'https://ui-avatars.com/api/'
            f'?name={name}&background=random&size=128'
        )


@register_snippet
class TestimonialReply(models.Model):
    """Reply to a testimonial."""

    STATUS_CHOICES: ClassVar[list[tuple[str, str]]] = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ]

    parent = ParentalKey(
        Testimonial,
        on_delete=models.CASCADE,
        related_name='replies',
        verbose_name='Témoignage parent',
    )
    name = models.CharField(max_length=100, verbose_name='Nom')
    email = models.EmailField(verbose_name='Email (privé)')
    text = models.TextField(max_length=500, verbose_name='Réponse')

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Statut',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    panels: ClassVar[list] = [
        FieldPanel('name'),
        FieldPanel('email'),
        FieldPanel('text'),
        FieldPanel('status'),
    ]

    class Meta:
        ordering = ('created_at',)
        verbose_name = 'Réponse'
        verbose_name_plural = 'Réponses'

    def __str__(self) -> str:
        return f'Reply by {self.name}'
