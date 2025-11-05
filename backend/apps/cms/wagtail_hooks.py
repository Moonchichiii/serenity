from django.forms import Media
from django.template.loader import render_to_string
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from wagtail import hooks


@hooks.register("construct_homepage_panels")
def add_welcome_panel(request, panels):
    class WelcomePanel:
        order = 0
        media = Media()

        def render(self):
            from apps.cms.models import HomePage

            homepage = HomePage.objects.first()
            edit_url = (
                f"/cms-admin/pages/{homepage.id}/edit/"
                if homepage
                else "/cms-admin/pages/"
            )
            return format_html(
                "{}",
                mark_safe(
                    render_to_string(
                        "admin/serenity_welcome.html", {"edit_url": edit_url}
                    )
                ),
            )

    panels.insert(0, WelcomePanel())
    return panels
