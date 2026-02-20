"""
Customises the Wagtail admin dashboard.
Replaces the default dashboard with a Serenity-branded welcome panel containing direct-edit links to content sections.
"""

from __future__ import annotations

from typing import Any

from django.forms import Media
from django.template.loader import render_to_string
from django.urls import NoReverseMatch, reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from wagtail import hooks

try:
    from apps.cms.pages import HomePage
    from apps.cms.settings import GiftSettings
except ImportError:
    HomePage = None
    GiftSettings = None

try:
    from apps.testimonials.models import Testimonial, TestimonialReply
except ImportError:
    Testimonial = None
    TestimonialReply = None

try:
    from apps.services.models import Service
except ImportError:
    Service = None

try:
    from apps.vouchers.models import GiftVoucher
except ImportError:
    GiftVoucher = None

# Helpers

def get_snippet_url(model: Any, action: str = "list") -> str:
    """
    Generate a Wagtail snippet URL. Returns '#' on failure.
    """
    if not model:
        return "#"

    app_label = model._meta.app_label
    model_name = model._meta.model_name
    url_name = f"wagtailsnippets_{app_label}_{model_name}:{action}"

    try:
        return reverse(url_name)
    except NoReverseMatch:
        return "#"

# Dashboard panels

@hooks.register("construct_homepage_panels")
def add_welcome_panel(request: Any, panels: list[Any]) -> list[Any]:
    """
    Replace the default Wagtail dashboard with a custom welcome panel.
    """

    class WelcomePanel:
        order: int = 0
        media: Media = Media()

        def render(self) -> str:
            edit_url = "/cms-admin/pages/"
            homepage_title = ""

            if HomePage:
                homepage_obj = HomePage.objects.live().first()
                if homepage_obj:
                    homepage_title = homepage_obj.title or ""
                    edit_url = reverse(
                        "wagtailadmin_pages:edit",
                        args=[homepage_obj.id],
                    )

            gift_settings_url = "#"
            if GiftSettings is not None:
                app_label = GiftSettings._meta.app_label
                model_name = GiftSettings._meta.model_name
                try:
                    gift_settings_url = reverse(
                        "wagtailsettings:edit",
                        args=[app_label, model_name],
                    )
                except NoReverseMatch:
                    gift_settings_url = "#"

            context = {
                "edit_url": edit_url,
                "homepage_title": homepage_title,
                "testimonial_list_url": get_snippet_url(Testimonial, "list"),
                "testimonial_add_url": get_snippet_url(Testimonial, "add"),
                "reply_list_url": get_snippet_url(TestimonialReply, "list"),
                "service_list_url": get_snippet_url(Service, "list"),
                "service_add_url": get_snippet_url(Service, "add"),
                "voucher_list_url": get_snippet_url(GiftVoucher, "list"),
                "gift_settings_url": gift_settings_url,
            }

            html = render_to_string("admin/wagtail_admin.html", context)
            return format_html("{}", mark_safe(html))

    panels.insert(0, WelcomePanel())
    return panels
