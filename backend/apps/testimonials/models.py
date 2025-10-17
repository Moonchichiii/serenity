from django.db import models
from wagtail.admin.panels import FieldPanel
from wagtail.snippets.models import register_snippet


@register_snippet
class Testimonial(models.Model):
    client_name = models.CharField(max_length=200)
    text_en = models.TextField()
    text_fr = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    featured = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    panels = [
        FieldPanel("client_name"),
        FieldPanel("text_en"),
        FieldPanel("text_fr"),
        FieldPanel("rating"),
        FieldPanel("featured"),
    ]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.client_name} ({self.rating}★)"
