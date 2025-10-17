from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.fields import RichTextField
from wagtail.images.models import Image
from wagtail.models import Page


class HomePage(Page):
    # hero
    hero_title_en = models.CharField(max_length=200, blank=True, default="")
    hero_title_fr = models.CharField(max_length=200, blank=True, default="")
    hero_subtitle_en = models.CharField(max_length=300, blank=True, default="")
    hero_subtitle_fr = models.CharField(max_length=300, blank=True, default="")
    hero_image = models.ForeignKey(
        Image, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )

    # about
    about_title_en = models.CharField(max_length=200, blank=True, default="")
    about_title_fr = models.CharField(max_length=200, blank=True, default="")
    about_text_en = RichTextField(blank=True, default="")
    about_text_fr = RichTextField(blank=True, default="")

    # contact
    phone = models.CharField(max_length=64, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    address_en = models.CharField(max_length=300, blank=True, default="")
    address_fr = models.CharField(max_length=300, blank=True, default="")

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("hero_title_en"),
                FieldPanel("hero_title_fr"),
                FieldPanel("hero_subtitle_en"),
                FieldPanel("hero_subtitle_fr"),
                FieldPanel("hero_image"),
            ],
            heading="Hero",
        ),
        MultiFieldPanel(
            [
                FieldPanel("about_title_en"),
                FieldPanel("about_title_fr"),
                FieldPanel("about_text_en"),
                FieldPanel("about_text_fr"),
            ],
            heading="About",
        ),
        MultiFieldPanel(
            [
                FieldPanel("phone"),
                FieldPanel("email"),
                FieldPanel("address_en"),
                FieldPanel("address_fr"),
            ],
            heading="Contact",
        ),
    ]

    parent_page_types = ["wagtailcore.Page"]
    subpage_types = []
