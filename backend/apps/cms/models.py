from django.db import models
from modelcluster.fields import ParentalKey
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.images.models import Image
from wagtail.models import Orderable, Page
from wagtail.search import index


class HeroSlide(Orderable):
    """Slide for homepage hero carousel."""

    page = ParentalKey(
        "cms.HomePage", related_name="hero_slides", on_delete=models.CASCADE
    )
    image = models.ForeignKey(
        Image, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    title_en = models.CharField(max_length=200, blank=True, default="")
    title_fr = models.CharField(max_length=200, blank=True, default="")
    subtitle_en = models.CharField(max_length=300, blank=True, default="")
    subtitle_fr = models.CharField(max_length=300, blank=True, default="")

    panels = [
        FieldPanel("image"),
        FieldPanel("title_en"),
        FieldPanel("title_fr"),
        FieldPanel("subtitle_en"),
        FieldPanel("subtitle_fr"),
    ]

    def __str__(self):
        return self.title_en or self.title_fr or f"Slide {self.pk}"


class HomePage(Page):
    """Single multilingual home page."""

    hero_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Main headline - Keep it short and impactful (e.g., 'Find Your Balance')",
    )
    hero_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Titre principal - Court et percutant (ex: 'Trouvez Votre Équilibre')",
    )
    hero_subtitle_en = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Tagline under the title - Describe what you offer in one sentence",
    )
    hero_subtitle_fr = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Sous-titre - Décrivez votre offre en une phrase",
    )
    hero_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Background image for hero section - Choose a calming, professional spa photo",
    )

    about_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Section heading (e.g., 'About Me')",
    )
    about_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Titre de section (ex: 'À Propos de Moi')",
    )
    about_subtitle_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Subtitle under About title (e.g., 'Dedicated to Your Wellness')",
    )
    about_subtitle_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Sous-titre (ex: 'Dédiée à Votre Bien-Être')",
    )

    about_intro_en = RichTextField(
        blank=True,
        default="",
        help_text="Your professional introduction - Who you are and your experience",
    )
    about_intro_fr = RichTextField(
        blank=True,
        default="",
        help_text="Votre présentation professionnelle - Qui vous êtes et votre expérience",
    )
    about_certification_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Your main certification (e.g., 'Certified Professional Massage Therapist')",
    )
    about_certification_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Votre certification principale (ex: 'Massothérapeute Professionnelle Certifiée')",
    )

    about_approach_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Title for your approach section (e.g., 'My Approach')",
    )
    about_approach_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Titre de votre approche (ex: 'Mon Approche')",
    )
    about_approach_text_en = RichTextField(
        blank=True,
        default="",
        help_text="Describe your unique approach to massage therapy",
    )
    about_approach_text_fr = RichTextField(
        blank=True,
        default="",
        help_text="Décrivez votre approche unique du massage thérapeutique",
    )

    about_specialties_title_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Title for specialties section (e.g., 'Specialties')",
    )
    about_specialties_title_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Titre des spécialités (ex: 'Spécialités')",
    )
    specialty_1_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="First specialty (e.g., 'Deep Tissue Therapy')",
    )
    specialty_1_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Première spécialité (ex: 'Thérapie Tissus Profonds')",
    )
    specialty_2_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Second specialty (e.g., 'Swedish Relaxation')",
    )
    specialty_2_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Deuxième spécialité (ex: 'Relaxation Suédoise')",
    )
    specialty_3_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Third specialty (e.g., 'Sports Recovery')",
    )
    specialty_3_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Troisième spécialité (ex: 'Récupération Sportive')",
    )
    specialty_4_en = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Fourth specialty (e.g., 'Prenatal Care')",
    )
    specialty_4_fr = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Quatrième spécialité (ex: 'Soins Prénatals')",
    )

    phone = models.CharField(
        max_length=64,
        blank=True,
        default="",
        help_text="Phone number with country code (e.g., +33 6 00 00 00 00)",
    )
    email = models.EmailField(
        blank=True,
        default="",
        help_text="Professional email address for bookings and inquiries",
    )
    address_en = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Your business address in English (e.g., 'Paris, France' or full address)",
    )
    address_fr = models.CharField(
        max_length=300,
        blank=True,
        default="",
        help_text="Votre adresse professionnelle en français (ex: 'Paris, France' ou adresse complète)",
    )

    # --- Services Hero Section ---
    services_hero_title_en = models.CharField(
        max_length=255,
        blank=True,
        default="Corporate Wellness Programs",
        help_text="Main title for the services hero section (English)",
    )
    services_hero_title_fr = models.CharField(
        max_length=255,
        blank=True,
        default="Programmes de Bien-être en Entreprise",
        help_text="Main title for the services hero section (Français)",
    )

    services_hero_price_en = models.CharField(
        max_length=100,
        blank=True,
        default="€45/person",
        help_text="Displayed price (English)",
    )
    services_hero_price_fr = models.CharField(
        max_length=100,
        blank=True,
        default="45€/personne",
        help_text="Displayed price (Français)",
    )

    services_hero_pricing_label_en = models.CharField(
        max_length=100,
        blank=True,
        default="Starting from",
        help_text="Label before price (English)",
    )
    services_hero_pricing_label_fr = models.CharField(
        max_length=100,
        blank=True,
        default="À partir de",
        help_text="Label before price (Français)",
    )

    services_hero_cta_en = models.CharField(
        max_length=100,
        blank=True,
        default="Request a Quote",
        help_text="CTA button text (English)",
    )
    services_hero_cta_fr = models.CharField(
        max_length=100,
        blank=True,
        default="Demander un Devis",
        help_text="CTA button text (Français)",
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

    search_fields = Page.search_fields + [
        index.SearchField("hero_title_en"),
        index.SearchField("hero_title_fr"),
        index.SearchField("about_intro_en"),
        index.SearchField("about_intro_fr"),
        index.SearchField("about_approach_text_en"),
        index.SearchField("about_approach_text_fr"),
    ]

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("hero_title_en", heading="Title (English)"),
                FieldPanel("hero_title_fr", heading="Title (Français)"),
                FieldPanel("hero_subtitle_en", heading="Subtitle (English)"),
                FieldPanel("hero_subtitle_fr", heading="Subtitle (Français)"),
                FieldPanel("hero_image", heading="Background Image (fallback)"),
                InlinePanel("hero_slides", label="Slides"),
            ],
            heading="🏠 Hero Section",
            help_text="If slides exist, frontend shows slider; else falls back to single hero image.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            [
                FieldPanel("about_title_en", heading="Section Title (English)"),
                FieldPanel("about_title_fr", heading="Section Title (Français)"),
                FieldPanel("about_subtitle_en", heading="Subtitle (English)"),
                FieldPanel("about_subtitle_fr", heading="Subtitle (Français)"),
            ],
            heading="👤 About Section - Header",
            help_text="The main heading for your About section.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            [
                FieldPanel("about_intro_en", heading="Introduction (English)"),
                FieldPanel("about_intro_fr", heading="Introduction (Français)"),
                FieldPanel(
                    "about_certification_en", heading="Certification Badge (English)"
                ),
                FieldPanel(
                    "about_certification_fr", heading="Certification Badge (Français)"
                ),
            ],
            heading="👤 About Section - Introduction",
            help_text="Your professional introduction and credentials.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            [
                FieldPanel(
                    "about_approach_title_en", heading="Approach Title (English)"
                ),
                FieldPanel(
                    "about_approach_title_fr", heading="Approach Title (Français)"
                ),
                FieldPanel(
                    "about_approach_text_en", heading="Approach Description (English)"
                ),
                FieldPanel(
                    "about_approach_text_fr", heading="Approach Description (Français)"
                ),
            ],
            heading="👤 About Section - Your Approach",
            help_text="Describe your unique approach to massage therapy.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            [
                FieldPanel(
                    "about_specialties_title_en", heading="Section Title (English)"
                ),
                FieldPanel(
                    "about_specialties_title_fr", heading="Section Title (Français)"
                ),
                FieldPanel(
                    "specialty_1_en",
                    heading="Specialty 1 (English) - e.g., Deep Tissue Therapy",
                ),
                FieldPanel(
                    "specialty_1_fr",
                    heading="Specialty 1 (Français) - e.g., Thérapie Tissus Profonds",
                ),
                FieldPanel(
                    "specialty_2_en",
                    heading="Specialty 2 (English) - e.g., Swedish Relaxation",
                ),
                FieldPanel(
                    "specialty_2_fr",
                    heading="Specialty 2 (Français) - e.g., Relaxation Suédoise",
                ),
                FieldPanel(
                    "specialty_3_en",
                    heading="Specialty 3 (English) - e.g., Sports Recovery",
                ),
                FieldPanel(
                    "specialty_3_fr",
                    heading="Specialty 3 (Français) - e.g., Récupération Sportive",
                ),
                FieldPanel(
                    "specialty_4_en",
                    heading="Specialty 4 (English) - e.g., Prenatal Care",
                ),
                FieldPanel(
                    "specialty_4_fr",
                    heading="Specialty 4 (Français) - e.g., Soins Prénatals",
                ),
            ],
            heading="👤 About Section - Your Specialties",
            help_text="List your 4 main specialties.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            [
                FieldPanel("phone", heading="Phone Number (with country code)"),
                FieldPanel("email", heading="Email Address"),
                FieldPanel("address_en", heading="Address (English)"),
                FieldPanel("address_fr", heading="Address (Français)"),
            ],
            heading="📞 Contact Information",
            help_text="Your contact details displayed in the footer and contact sections.",
            classname="collapsible",
        ),
        MultiFieldPanel(
            [
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
            ],
            heading="💼 Services Hero Section",
            classname="collapsible",
        ),
    ]

    parent_page_types = ["wagtailcore.Page"]
    subpage_types = []
    max_count = 1

    class Meta:
        verbose_name = "Home Page"


@register_setting
class SerenitySettings(BaseSiteSetting):
    """Global site settings."""

    brand = models.CharField(
        max_length=100, default="Serenity", help_text="Site brand name"
    )
    instagram_url = models.URLField(blank=True, help_text="Instagram profile URL")
    facebook_url = models.URLField(blank=True, help_text="Facebook page URL")
    business_hours = models.CharField(
        max_length=200,
        blank=True,
        default="Mon-Sat: 9:00-19:00",
        help_text="Display hours on site",
    )

    panels = [
        MultiFieldPanel(
            [FieldPanel("brand"), FieldPanel("business_hours")], heading="Site Info"
        ),
        MultiFieldPanel(
            [FieldPanel("instagram_url"), FieldPanel("facebook_url")],
            heading="Social Media",
        ),
    ]

    class Meta:
        verbose_name = "Site Settings"
