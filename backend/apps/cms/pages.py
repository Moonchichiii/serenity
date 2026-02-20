"""
Wagtail Page and Orderable models for the Serenity homepage.
"""

from __future__ import annotations

from typing import ClassVar

from django.db import models
from modelcluster.fields import ParentalKey
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.fields import RichTextField
from wagtail.images.models import Image
from wagtail.models import Orderable, Page
from wagtail.search import index

# Orderables


class HeroSlide(Orderable):
    """
    Slide for the homepage hero carousel.
    """

    page = ParentalKey(
        "cms.HomePage",
        related_name="hero_slides",
        on_delete=models.CASCADE,
    )
    image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    title_en = models.CharField(max_length=200, blank=True, default="")
    title_fr = models.CharField(max_length=200, blank=True, default="")
    subtitle_en = models.CharField(max_length=300, blank=True, default="")
    subtitle_fr = models.CharField(max_length=300, blank=True, default="")

    panels: ClassVar[list] = [
        FieldPanel("image"),
        FieldPanel("title_en"),
        FieldPanel("title_fr"),
        FieldPanel("subtitle_en"),
        FieldPanel("subtitle_fr"),
    ]

    class Meta:
        ordering = ["sort_order"]

    def __str__(self) -> str:
        return self.title_en or self.title_fr or f"Slide {self.pk}"


class Specialty(Orderable):
    """
    Specialty badge for the About section.
    """

    page = ParentalKey(
        "cms.HomePage",
        related_name="specialties",
        on_delete=models.CASCADE,
    )
    title_en = models.CharField(max_length=200, blank=True, default="")
    title_fr = models.CharField(max_length=200, blank=True, default="")
    image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    panels: ClassVar[list] = [
        FieldPanel("title_en"),
        FieldPanel("title_fr"),
        FieldPanel("image"),
    ]

    class Meta:
        ordering = ["sort_order"]

    def __str__(self) -> str:
        return self.title_en or self.title_fr or f"Specialty {self.pk}"


# Panel definitions

_HERO_PANELS: list = [
    FieldPanel("hero_title_en", heading="Title (English)"),
    FieldPanel("hero_title_fr", heading="Title (Français)"),
    FieldPanel("hero_subtitle_en", heading="Subtitle (English)"),
    FieldPanel("hero_subtitle_fr", heading="Subtitle (Français)"),
    FieldPanel("hero_image", heading="Background Image (fallback)"),
    InlinePanel("hero_slides", label="Slides"),
]

_ABOUT_HEADER_PANELS: list = [
    FieldPanel("about_title_en", heading="Section Title (English)"),
    FieldPanel("about_title_fr", heading="Section Title (Français)"),
    FieldPanel("about_subtitle_en", heading="Subtitle (English)"),
    FieldPanel("about_subtitle_fr", heading="Subtitle (Français)"),
]

_ABOUT_INTRO_PANELS: list = [
    FieldPanel("about_intro_en", heading="Introduction (English)"),
    FieldPanel("about_intro_fr", heading="Introduction (Français)"),
    FieldPanel(
        "about_certification_en", heading="Certification Badge (English)"
    ),
    FieldPanel(
        "about_certification_fr", heading="Certification Badge (Français)"
    ),
]

_ABOUT_APPROACH_PANELS: list = [
    FieldPanel("about_approach_title_en", heading="Approach Title (English)"),
    FieldPanel(
        "about_approach_title_fr", heading="Approach Title (Français)"
    ),
    FieldPanel(
        "about_approach_text_en", heading="Approach Description (English)"
    ),
    FieldPanel(
        "about_approach_text_fr", heading="Approach Description (Français)"
    ),
]

_ABOUT_SPECIALTIES_PANELS: list = [
    FieldPanel("about_specialties_title_en", heading="Section Title (EN)"),
    FieldPanel("about_specialties_title_fr", heading="Section Title (FR)"),
    InlinePanel("specialties", label="Specialties (image + title)"),
]

_CONTACT_PANELS: list = [
    FieldPanel("phone", heading="Phone Number (with country code)"),
    FieldPanel("email", heading="Email Address"),
    FieldPanel("address_en", heading="Address (English)"),
    FieldPanel("address_fr", heading="Address (Français)"),
]

_SERVICES_HERO_PANELS: list = [
    FieldPanel("services_hero_title_en"),
    FieldPanel("services_hero_title_fr"),
    FieldPanel("services_hero_pricing_label_en"),
    FieldPanel("services_hero_pricing_label_fr"),
    FieldPanel("services_hero_price_en"),
    FieldPanel("services_hero_price_fr"),
    FieldPanel("services_hero_cta_en"),
    FieldPanel("services_hero_cta_fr"),
    FieldPanel("services_hero_benefit_1_en"),
    FieldPanel("services_hero_benefit_1_fr"),
    FieldPanel("services_hero_benefit_2_en"),
    FieldPanel("services_hero_benefit_2_fr"),
    FieldPanel("services_hero_benefit_3_en"),
    FieldPanel("services_hero_benefit_3_fr"),
    FieldPanel(
        "services_hero_video_public_id",
        heading="Background video (Cloudinary ID)",
    ),
    FieldPanel(
        "services_hero_video_file",
        heading="Background video file (MP4)",
    ),
    FieldPanel(
        "services_hero_poster_image",
        heading="Poster image (Wagtail image)",
    ),
]


# HomePage


class HomePage(Page):
    """
    Multilingual homepage for the React SPA.
    """

    hero_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text=(
            "Main headline — keep it short and impactful "
            "(e.g. 'Find Your Balance')."
        ),
    )
    hero_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text=(
            "Titre principal — court et percutant "
            "(ex : 'Trouvez Votre Équilibre')."
        ),
    )
    hero_subtitle_en = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Tagline under the title — describe your offer in one sentence.",
    )
    hero_subtitle_fr = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Sous-titre — décrivez votre offre en une phrase.",
    )
    hero_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text=(
            "Background image for hero section — "
            "choose a calming, professional spa photo."
        ),
    )

    about_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Section heading (e.g. 'About Me').",
    )
    about_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Titre de section (ex : 'À Propos de Moi').",
    )
    about_subtitle_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Subtitle under About title (e.g. 'Dedicated to Your Wellness').",
    )
    about_subtitle_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Sous-titre (ex : 'Dédiée à Votre Bien-Être').",
    )

    about_intro_en = RichTextField(
        blank=True,
        default="",
        help_text="Your professional introduction — who you are and your experience.",
    )
    about_intro_fr = RichTextField(
        blank=True,
        default="",
        help_text=(
            "Votre présentation professionnelle — "
            "qui vous êtes et votre expérience."
        ),
    )
    about_certification_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text=(
            "Your main certification "
            "(e.g. 'Certified Professional Massage Therapist')."
        ),
    )
    about_certification_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text=(
            "Votre certification principale "
            "(ex : 'Massothérapeute Professionnelle Certifiée')."
        ),
    )

    about_approach_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Title for your approach section (e.g. 'My Approach').",
    )
    about_approach_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Titre de votre approche (ex : 'Mon Approche').",
    )
    about_approach_text_en = RichTextField(
        blank=True,
        default="",
        help_text="Describe your unique approach to massage therapy.",
    )
    about_approach_text_fr = RichTextField(
        blank=True,
        default="",
        help_text="Décrivez votre approche unique du massage thérapeutique.",
    )

    about_specialties_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Title for specialties section (e.g. 'Specialties').",
    )
    about_specialties_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Titre des spécialités (ex : 'Spécialités').",
    )

    services_hero_video_public_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text=(
            "Cloudinary public ID for background video "
            "(e.g. 'serenity/corporate-loop'). Do NOT include file extension."
        ),
    )
    services_hero_video_file = models.FileField(
        upload_to="services/videos/",
        blank=True,
        null=True,
        help_text=(
            "Upload MP4 background video for the corporate hero section. "
            "Stored on Cloudinary."
        ),
    )
    services_hero_poster_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Poster image shown before/instead of video.",
    )

    services_hero_title_en = models.CharField(
        max_length=255,
        blank=True,
        default="Corporate Wellness Programs",
        help_text="Main title for the services hero section (English).",
    )
    services_hero_title_fr = models.CharField(
        max_length=255,
        blank=True,
        default="Programmes de Bien-être en Entreprise",
        help_text="Main title for the services hero section (Français).",
    )
    services_hero_price_en = models.CharField(
        max_length=100,
        blank=True,
        default="€45/person",
        help_text="Displayed price (English).",
    )
    services_hero_price_fr = models.CharField(
        max_length=100,
        blank=True,
        default="45€/personne",
        help_text="Displayed price (Français).",
    )
    services_hero_pricing_label_en = models.CharField(
        max_length=100,
        blank=True,
        default="Starting from",
        help_text="Label before price (English).",
    )
    services_hero_pricing_label_fr = models.CharField(
        max_length=100,
        blank=True,
        default="À partir de",
        help_text="Label before price (Français).",
    )
    services_hero_cta_en = models.CharField(
        max_length=100,
        blank=True,
        default="Request a Quote",
        help_text="CTA button text (English).",
    )
    services_hero_cta_fr = models.CharField(
        max_length=100,
        blank=True,
        default="Demander un Devis",
        help_text="CTA button text (Français).",
    )

    services_hero_benefit_1_en = models.CharField(
        max_length=200,
        blank=True,
        default="Professional equipment provided",
    )
    services_hero_benefit_1_fr = models.CharField(
        max_length=200,
        blank=True,
        default="Équipement professionnel fourni",
    )
    services_hero_benefit_2_en = models.CharField(
        max_length=200,
        blank=True,
        default="Flexible group sizes available",
    )
    services_hero_benefit_2_fr = models.CharField(
        max_length=200,
        blank=True,
        default="Groupes flexibles disponibles",
    )
    services_hero_benefit_3_en = models.CharField(
        max_length=200,
        blank=True,
        default="Boost team wellness and morale",
    )
    services_hero_benefit_3_fr = models.CharField(
        max_length=200,
        blank=True,
        default="Améliorez le bien-être et le moral de l'équipe",
    )

    phone = models.CharField(
        max_length=64,
        blank=True,
        default="",
        help_text="Phone number with country code (e.g. +33 6 00 00 00 00).",
    )
    email = models.EmailField(
        blank=True,
        default="",
        help_text="Professional email address for bookings and inquiries.",
    )
    address_en = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Business address in English.",
    )
    address_fr = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Adresse professionnelle en français.",
    )

    search_fields: ClassVar[list] = [
        *Page.search_fields,
        index.SearchField("hero_title_en"),
        index.SearchField("hero_title_fr"),
        index.SearchField("about_intro_en"),
        index.SearchField("about_intro_fr"),
        index.SearchField("about_approach_text_en"),
        index.SearchField("about_approach_text_fr"),
    ]

    content_panels: ClassVar[list] = [
        *Page.content_panels,
        MultiFieldPanel(
            _HERO_PANELS,
            heading="🏠 Hero Section",
            help_text=(
                "If slides exist the frontend shows a slider; "
                "otherwise it falls back to the single hero image."
            ),
            classname="collapsible",
        ),
        MultiFieldPanel(
            _ABOUT_HEADER_PANELS,
            heading="👤 About — Header",
            classname="collapsible",
        ),
        MultiFieldPanel(
            _ABOUT_INTRO_PANELS,
            heading="👤 About — Introduction",
            help_text="Your professional introduction and credentials.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            _ABOUT_APPROACH_PANELS,
            heading="👤 About — Your Approach",
            help_text="Describe your unique approach to massage therapy.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            _ABOUT_SPECIALTIES_PANELS,
            heading="👤 About — Specialties",
            help_text="Order controls display order on the site.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            _CONTACT_PANELS,
            heading="📞 Contact Information",
            help_text="Displayed in the footer and contact sections.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            _SERVICES_HERO_PANELS,
            heading="💼 Services Hero Section",
            classname="collapsible",
        ),
    ]

    parent_page_types: ClassVar[list[str]] = ["wagtailcore.Page"]
    subpage_types: ClassVar[list[str]] = []
    max_count = 1

    class Meta:
        verbose_name = "Home Page"

    def __str__(self) -> str:
        return self.title or "HomePage (untitled)"
