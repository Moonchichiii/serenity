from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting


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

    modal_title_en = models.CharField(max_length=100, default="Give the Gift of Relaxation")
    modal_title_fr = models.CharField(max_length=100, default="Offrez le Cadeau de la Détente")

    modal_text_en = models.TextField(default="Fill out the details below to send a massage voucher.")
    modal_text_fr = models.TextField(default="Remplissez les détails ci-dessous pour envoyer un bon cadeau.")

    voucher_image = models.ForeignKey(
        "wagtailimages.Image",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="The decorative image inside the email sent to the recipient.",
    )

    email_subject_en = models.CharField(max_length=255, default="You've received a gift!")
    email_subject_fr = models.CharField(max_length=255, default="Vous avez reçu un cadeau !")

    email_heading_en = models.CharField(
        max_length=120, blank=True, default="",
        help_text="Optional: heading shown inside the voucher email (English).",
    )
    email_heading_fr = models.CharField(
        max_length=120, blank=True, default="",
        help_text="Optionnel : titre dans l'email bon cadeau (Français).",
    )

    email_intro_en = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optional: intro sentence for recipient email (English). Use {purchaser_name}.",
    )
    email_intro_fr = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optionnel : phrase d'intro (Français). Utilisez {purchaser_name}.",
    )

    email_redeem_en = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optional: redemption instructions (English). Use {site_name}.",
    )
    email_redeem_fr = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optionnel : instructions (Français). Utilisez {site_name}.",
    )

    email_closing_en = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optional: closing line (English).",
    )
    email_closing_fr = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optionnel : phrase de fin (Français).",
    )

    form_message_placeholder_en = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optional: override the message placeholder (English).",
    )
    form_message_placeholder_fr = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optionnel : texte du message personnalisé (Français).",
    )

    form_submit_label_en = models.CharField(
        max_length=100, blank=True, default="",
        help_text="Optional: override the submit button label (English).",
    )
    form_submit_label_fr = models.CharField(
        max_length=100, blank=True, default="",
        help_text="Optionnel : texte du bouton d'envoi (Français).",
    )

    form_sending_label_en = models.CharField(
        max_length=100, blank=True, default="",
        help_text="Optional: override the loading label (English).",
    )
    form_sending_label_fr = models.CharField(
        max_length=100, blank=True, default="",
        help_text="Optionnel : texte du bouton en cours d'envoi (Français).",
    )

    form_success_title_en = models.CharField(
        max_length=150, blank=True, default="",
        help_text="Optional: override success title shown after sending (English).",
    )
    form_success_title_fr = models.CharField(
        max_length=150, blank=True, default="",
        help_text="Optionnel : titre de succès après l'envoi (Français).",
    )

    form_success_message_en = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optional: override success message body (English).",
    )
    form_success_message_fr = models.CharField(
        max_length=255, blank=True, default="",
        help_text="Optionnel : texte de succès (Français).",
    )

    form_code_label_en = models.CharField(
        max_length=100, blank=True, default="",
        help_text="Optional: override 'Voucher Code' label (English).",
    )
    form_code_label_fr = models.CharField(
        max_length=100, blank=True, default="",
        help_text="Optionnel : libellé pour 'Code du bon' (Français).",
    )

    panels = [
        FieldPanel("is_enabled"),
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
                FieldPanel("email_heading_en"),
                FieldPanel("email_heading_fr"),
                FieldPanel("email_intro_en"),
                FieldPanel("email_intro_fr"),
                FieldPanel("email_redeem_en"),
                FieldPanel("email_redeem_fr"),
                FieldPanel("email_closing_en"),
                FieldPanel("email_closing_fr"),
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
