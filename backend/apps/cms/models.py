from django.core.cache import cache
from django.db import models
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from modelcluster.fields import ParentalKey
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.images.models import Image
from wagtail.models import Orderable, Page, Site
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


class Specialty(Orderable):
    """Specialty for homepage specialties section."""

    page = ParentalKey(
        "cms.HomePage", related_name="specialties", on_delete=models.CASCADE
    )
    title_en = models.CharField(max_length=200, blank=True, default="")
    title_fr = models.CharField(max_length=200, blank=True, default="")
    image = models.ForeignKey(
        Image, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )

    panels = [
        FieldPanel("title_en"),
        FieldPanel("title_fr"),
        FieldPanel("image"),
    ]

    def __str__(self):
        return self.title_en or self.title_fr or f"Specialty {self.pk}"


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

    services_hero_video_public_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text=(
            "Cloudinary public ID for background video "
            "(e.g. 'serenity/corporate-loop'). Do NOT include extension."
        ),
    )
    services_hero_video_file = models.FileField(
        upload_to="services/videos/",
        blank=True,
        null=True,
        help_text=(
            "Upload MP4 background video for the corporate hero section. "
            "This is stored on Cloudinary."
        ),
    )
    services_hero_poster_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Poster image shown before / instead of video (background still).",
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
                    "about_specialties_title_en",
                    heading="Section Title (English)",
                ),
                FieldPanel(
                    "about_specialties_title_fr",
                    heading="Section Title (Français)",
                ),
                InlinePanel(
                    "specialties",
                    label="Specialties (image + title)",
                ),
            ],
            heading="👤 About Section - Your Specialties",
            help_text="Order controls the display order on the site.",
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
                FieldPanel(
                    "services_hero_video_public_id",
                    heading="Background video (Cloudinary public ID)",
                ),
                FieldPanel(
                    "services_hero_video_file",
                    heading="Background video file (MP4, optional)",
                ),
                FieldPanel(
                    "services_hero_poster_image",
                    heading="Poster image (Wagtail image)",
                ),
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

@register_setting
class GiftSettings(BaseSiteSetting):
    is_enabled = models.BooleanField(
        default=True,
        help_text="Check this to show the Gift Voucher floating icon on the site.",
    )

    # --- NEW FIELD: The Floating Icon ---
    floating_icon = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text=(
            "The small floating button icon (e.g. gift box, heart). "
            "Best size: around 150x150px WebP/PNG."
        ),
    )

    # Floating Icon / Modal Content
    modal_title_en = models.CharField(
        max_length=100,
        default="Give the Gift of Relaxation",
    )
    modal_title_fr = models.CharField(
        max_length=100,
        default="Offrez le Cadeau de la Détente",
    )

    modal_text_en = models.TextField(
        default="Fill out the details below to send a massage voucher."
    )
    modal_text_fr = models.TextField(
        default="Remplissez les détails ci-dessous pour envoyer un bon cadeau."
    )

    # Email Content
    voucher_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="The decorative image inside the email sent to the recipient.",
    )

    email_subject_en = models.CharField(
        max_length=255,
        default="You've received a gift!",
    )
    email_subject_fr = models.CharField(
        max_length=255,
        default="Vous avez reçu un cadeau !",
    )

    # --- Form copy overrides (optional, per campaign) ---

    form_message_placeholder_en = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Optional: override the message placeholder (English).",
    )
    form_message_placeholder_fr = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Optionnel : texte du message personnalisé (Français).",
    )

    form_submit_label_en = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optional: override the submit button label (English).",
    )
    form_submit_label_fr = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optionnel : texte du bouton d’envoi (Français).",
    )

    form_sending_label_en = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optional: override the loading label (English).",
    )
    form_sending_label_fr = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optionnel : texte du bouton en cours d’envoi (Français).",
    )

    form_success_title_en = models.CharField(
        max_length=150,
        blank=True,
        default="",
        help_text="Optional: override success title shown after sending (English).",
    )
    form_success_title_fr = models.CharField(
        max_length=150,
        blank=True,
        default="",
        help_text="Optionnel : titre de succès après l’envoi (Français).",
    )

    form_success_message_en = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Optional: override success message body (English).",
    )
    form_success_message_fr = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Optionnel : texte de succès (Français).",
    )

    form_code_label_en = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optional: override 'Voucher Code' label (English).",
    )
    form_code_label_fr = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optionnel : libellé pour 'Code du bon' (Français).",
    )

    panels = [
        FieldPanel("is_enabled"),
        # New icon picker directly under the toggle
        FieldPanel("floating_icon"),

        MultiFieldPanel(
            [
                FieldPanel("modal_title_en"),
                FieldPanel("modal_title_fr"),
                FieldPanel("modal_text_en"),
                FieldPanel("modal_text_fr"),
            ],
            heading="Website Popup Settings",
        ),
        MultiFieldPanel(
            [
                FieldPanel("voucher_image"),
                FieldPanel("email_subject_en"),
                FieldPanel("email_subject_fr"),
            ],
            heading="Email Settings",
        ),
        MultiFieldPanel(
            [
                FieldPanel("form_message_placeholder_en"),
                FieldPanel("form_message_placeholder_fr"),
                FieldPanel("form_submit_label_en"),
                FieldPanel("form_submit_label_fr"),
                FieldPanel("form_sending_label_en"),
                FieldPanel("form_sending_label_fr"),
                FieldPanel("form_success_title_en"),
                FieldPanel("form_success_title_fr"),
                FieldPanel("form_success_message_en"),
                FieldPanel("form_success_message_fr"),
                FieldPanel("form_code_label_en"),
                FieldPanel("form_code_label_fr"),
            ],
            heading="Gift Form Text (Optional Overrides)",
        ),
    ]

    class Meta:
        verbose_name = "Gift Voucher Settings"

# Cache invalidation helper function
def _delete_homepage_cache_variants():
    site_ids = list(Site.objects.values_list("id", flat=True)) or [0]
    for lang in ("en", "fr"):
        for site_id in site_ids:
            cache.delete(f"cms:homepage:{site_id}:{lang}")


# Cache invalidation signals
@receiver([post_save, post_delete], sender=HomePage)
def clear_homepage_cache_on_homepage(sender, **kwargs):
    _delete_homepage_cache_variants()


@receiver([post_save, post_delete], sender=HeroSlide)
def clear_homepage_cache_on_slide(sender, **kwargs):
    _delete_homepage_cache_variants()


@receiver([post_save, post_delete], sender=Specialty)
def clear_homepage_cache_on_specialty(sender, **kwargs):
    _delete_homepage_cache_variants()


# Import Service model for cache invalidation
try:
    from apps.services.models import Service

    @receiver([post_save, post_delete], sender=Service)
    def clear_services_cache(sender, **kwargs):
        cache.delete("cms:services")

except ImportError:
    pass
