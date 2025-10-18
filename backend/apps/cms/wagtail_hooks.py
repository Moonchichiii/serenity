# backend/apps/cms/wagtail_hooks.py
"""
Wagtail Admin Customization for Client-Friendly Interface
This removes clutter and shows only what the client needs
"""
from django.templatetags.static import static
from django.utils.html import format_html
from wagtail import hooks

# ============================================
# HIDE UNNECESSARY MENU ITEMS
# ============================================


@hooks.register("construct_main_menu")
def hide_unnecessary_menu_items(request, menu_items):
    """
    Remove menu items the client doesn't need
    Keep only: Pages, Images, Snippets (Services/Testimonials)
    """
    items_to_remove = [
        "explorer",  # Duplicate of Pages
        "documents",  # Client won't upload PDFs
        "reports",  # Developer-only analytics
        "settings",  # Lock down settings
    ]

    menu_items[:] = [item for item in menu_items if item.name not in items_to_remove]


# ============================================
# SIMPLIFY SETTINGS MENU
# ============================================


@hooks.register("construct_settings_menu")
def hide_settings_menu_items(request, menu_items):
    """
    Hide advanced settings the client shouldn't touch
    """
    items_to_remove = [
        "sites",  # Lock site configuration
        "collections",  # Advanced image organization
        "workflows",  # Publishing workflows
        "workflow-tasks",  # Task management
        "redirects",  # URL redirects
        "promoted-search-results",  # Search optimization
    ]

    menu_items[:] = [item for item in menu_items if item.name not in items_to_remove]


# ============================================
# CUSTOMIZE SNIPPETS MENU (Services/Testimonials)
# ============================================


@hooks.register("construct_snippet_listing_buttons")
def customize_snippet_buttons(snippet_type, user, model_class):
    """
    Simplify snippet action buttons
    Keep only Add/Edit, remove bulk actions
    """
    # Client sees simple "Add" button, not confusing options
    pass  # Default behavior is fine, just documented


# ============================================
# CUSTOM DASHBOARD PANELS
# ============================================


@hooks.register("construct_homepage_panels")
def customize_dashboard(request, panels):
    """
    Customize the dashboard to show only relevant panels
    Remove developer-focused panels
    """
    # Keep only:
    # - Pages to edit
    # - Recent images
    # - Quick links to Services/Testimonials

    panels[:] = [
        panel
        for panel in panels
        if panel.__class__.__name__
        not in [
            "WorkflowPagesPanel",  # Workflow stuff
            "LockedPagesPanel",  # Lock management
        ]
    ]


# ============================================
# ADD CUSTOM HELP TEXT / BRANDING
# ============================================


@hooks.register("insert_global_admin_css")
def custom_admin_css():
    """
    Add custom CSS for client-friendly interface
    Makes buttons bigger, text clearer
    """
    return format_html(
        '<link rel="stylesheet" href="{}">', static("css/wagtail-custom.css")
    )


@hooks.register("insert_global_admin_js")
def custom_admin_js():
    """
    Add custom JavaScript for helpful tooltips
    """
    return format_html('<script src="{}"></script>', static("js/wagtail-custom.js"))


# ============================================
# RESTRICT PAGE TYPES (Lock Structure)
# ============================================


@hooks.register("construct_page_action_menu")
def remove_page_actions(menu_items, request, context):
    """
    Remove dangerous page actions:
    - Delete (they might delete home page!)
    - Move (mess up structure)
    - Copy (create duplicates)

    Keep only: Edit, Publish
    """
    page = context.get("page")

    # If it's the HomePage, remove delete/move options
    if page and page.__class__.__name__ == "HomePage":
        items_to_remove = ["delete", "move", "copy", "unpublish"]
        menu_items[:] = [
            item for item in menu_items if item.name not in items_to_remove
        ]


# ============================================
# CUSTOM WELCOME MESSAGE
# ============================================


@hooks.register("construct_homepage_summary_items")
def add_custom_welcome_panel(request, items):
    """
    Add a friendly welcome message on the dashboard
    """
    items.insert(
        0,
        {
            "template": "cms/custom_welcome.html",
        },
    )
