from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting


@register_setting
class SerenitySettings(BaseSiteSetting):
    brand = models.CharField(max_length=100, default="Serenity")
    phone = models.CharField(max_length=64, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")

    hero_title = models.CharField(max_length=200, blank=True, default="")
    hero_subtitle = models.CharField(max_length=300, blank=True, default="")
    hero_image_url = models.URLField(
        blank=True, default=""
    )  # if you want to bypass Image chooser here

    about_intro = models.TextField(blank=True, default="")
    about_approach = models.TextField(blank=True, default="")

    panels = [
        MultiFieldPanel(
            [
                FieldPanel("brand"),
                FieldPanel("phone"),
                FieldPanel("email"),
                FieldPanel("address"),
            ],
            heading="Site",
        ),
        MultiFieldPanel(
            [
                FieldPanel("hero_title"),
                FieldPanel("hero_subtitle"),
                FieldPanel("hero_image_url"),
            ],
            heading="Hero",
        ),
        MultiFieldPanel(
            [FieldPanel("about_intro"), FieldPanel("about_approach")], heading="About"
        ),
    ]
