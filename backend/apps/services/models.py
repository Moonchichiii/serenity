from django.core.cache import cache
from django.db import models
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from wagtail.admin.panels import FieldPanel
from wagtail.images.models import Image
from wagtail.snippets.models import register_snippet


@register_snippet
class Service(models.Model):
    title_en = models.CharField(max_length=200)
    title_fr = models.CharField(max_length=200)
    description_en = models.TextField(blank=True, default="")
    description_fr = models.TextField(blank=True, default="")
    duration_minutes = models.PositiveIntegerField(default=60)
    price = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    image = models.ForeignKey(
        Image, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    is_available = models.BooleanField(default=True)

    panels = [
        FieldPanel("title_en"),
        FieldPanel("title_fr"),
        FieldPanel("description_en"),
        FieldPanel("description_fr"),
        FieldPanel("duration_minutes"),
        FieldPanel("price"),
        FieldPanel("image"),
        FieldPanel("is_available"),
    ]

    def __str__(self):
        return self.title_en


@receiver([post_save, post_delete], sender=Service)
def clear_services_cache(sender, **kwargs):
    cache.delete("cms:services")
