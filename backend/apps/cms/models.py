from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.images.models import Image
from wagtail.models import Page
from wagtail.search import index


class HomePage(Page):
    """
    Single home page for the site.
    Multi-language content (EN/FR).
    """

    # Hero
    hero_title_en = models.CharField(max_length=200, blank=True, default="")
    hero_title_fr = models.CharField(max_length=200, blank=True, default="")
    hero_subtitle_en = models.CharField(max_length=300, blank=True, default="")
    hero_subtitle_fr = models.CharField(max_length=300, blank=True, default="")
    hero_image = models.ForeignKey(
        Image, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )

    # About
    about_title_en = models.CharField(max_length=200, blank=True, default="")
    about_title_fr = models.CharField(max_length=200, blank=True, default="")
    about_text_en = RichTextField(blank=True, default="")
    about_text_fr = RichTextField(blank=True, default="")

    # Contact (global - used site-wide)
    phone = models.CharField(max_length=64, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    address_en = models.CharField(max_length=300, blank=True, default="")
    address_fr = models.CharField(max_length=300, blank=True, default="")

    # Enable search on key fields
    search_fields = Page.search_fields + [
        index.SearchField("hero_title_en"),
        index.SearchField("hero_title_fr"),
        index.SearchField("about_text_en"),
        index.SearchField("about_text_fr"),
    ]

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
            heading="Contact Info",
        ),
    ]

    # Only one HomePage allowed, no children
    parent_page_types = ["wagtailcore.Page"]
    subpage_types = []
    max_count = 1  # Only one home page

    class Meta:
        verbose_name = "Home Page"


@register_setting
class SerenitySettings(BaseSiteSetting):
    """
    Global site settings - brand, social media, etc.
    Accessible via Settings menu in Wagtail admin.
    """

    brand = models.CharField(
        max_length=100, default="Serenity", help_text="Site brand name"
    )

    # Social Media
    instagram_url = models.URLField(blank=True, help_text="Instagram profile URL")
    facebook_url = models.URLField(blank=True, help_text="Facebook page URL")

    # Business Hours
    business_hours = models.CharField(
        max_length=200,
        blank=True,
        default="Mon-Sat: 9:00-19:00",
        help_text="Display hours on site",
    )

    panels = [
        MultiFieldPanel(
            [
                FieldPanel("brand"),
                FieldPanel("business_hours"),
            ],
            heading="Site Info",
        ),
        MultiFieldPanel(
            [
                FieldPanel("instagram_url"),
                FieldPanel("facebook_url"),
            ],
            heading="Social Media",
        ),
    ]

    class Meta:
        verbose_name = "Site Settings"
