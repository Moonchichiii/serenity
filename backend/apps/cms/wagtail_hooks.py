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


def get_snippet_url(model, action="list"):
    """Generate Wagtail 7.x snippet URL, returning '#' on failure."""
    if not model:
        return "#"

    app_label = model._meta.app_label
    model_name = model._meta.model_name
    url_name = f"wagtailsnippets_{app_label}_{model_name}:{action}"

    try:
        return reverse(url_name)
    except NoReverseMatch:
        return "#"


@hooks.register("construct_homepage_panels")
def add_welcome_panel(request, panels):
    """Add custom welcome panel to Wagtail admin homepage."""

    class WelcomePanel:
        order = 0
        media = Media()

        def render(self):
            # --- HomePage edit URL ---
            edit_url = "/cms-admin/pages/"
            if HomePage:
                homepage_obj = HomePage.objects.live().first()
                if homepage_obj:
                    edit_url = reverse("wagtailadmin_pages:edit", args=[homepage_obj.id])

            # --- GiftSettings URL ---
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
                "testimonial_list_url": get_snippet_url(Testimonial, "list"),
                "testimonial_add_url": get_snippet_url(Testimonial, "add"),
                "reply_list_url": get_snippet_url(TestimonialReply, "list"),
                "service_list_url": get_snippet_url(Service, "list"),
                "service_add_url": get_snippet_url(Service, "add"),
                "voucher_list_url": get_snippet_url(GiftVoucher, "list"),
                "gift_settings_url": gift_settings_url,
            }

            html = render_to_string("admin/wagtail_admin", context)
            return format_html("{}", mark_safe(html))

    panels.insert(0, WelcomePanel())
    return panels
