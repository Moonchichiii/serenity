"""
Wagtail Admin Customization - Ultra Client-Friendly
Organized by website sections for easy editing
"""

from django.forms import Media
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from wagtail import hooks

# ============================================
# SIMPLIFY MAIN MENU
# ============================================


@hooks.register("construct_main_menu")
def customize_main_menu(request, menu_items):
    """
    Remove unnecessary items and rename for clarity.
    Safe for clients: keeps Pages, Images, Snippets by default.
    """
    # Remove items clients don't need
    items_to_remove = {
        "explorer",  # Duplicate of Pages
        "documents",  # Not needed
        "reports",  # Developer only
    }

    menu_items[:] = [item for item in menu_items if item.name not in items_to_remove]

    # Friendlier labels with emojis for visual recognition
    for item in menu_items:
        if item.name == "pages":
            item.label = "📄 Website Content"
        elif item.name == "images":
            item.label = "📸 Photos"
        elif item.name == "snippets":
            item.label = "💆 Services & Testimonials"
        elif item.name == "settings":
            item.label = "⚙️ Settings"

    return menu_items


# ============================================
# HIDE ADVANCED SETTINGS
# ============================================


@hooks.register("construct_settings_menu")
def hide_settings_menu_items(request, menu_items):
    """
    Hide advanced settings the client shouldn't touch.
    Keep only what's necessary.
    """
    items_to_remove = {
        "sites",
        "collections",
        "workflows",
        "workflow-tasks",
        "redirects",
        "promoted-search-results",
    }

    menu_items[:] = [item for item in menu_items if item.name not in items_to_remove]


# ============================================
# PROTECT HOMEPAGE FROM DANGEROUS ACTIONS
# ============================================


@hooks.register("construct_page_action_menu")
def remove_page_actions(menu_items, request, context):
    """
    For HomePage, remove Delete/Move/Copy/Unpublish to keep things safe.
    Keeps: Edit, Publish.
    """
    page = context.get("page")
    if page and page.__class__.__name__ == "HomePage":
        disallowed = {"delete", "move", "copy", "unpublish"}
        menu_items[:] = [item for item in menu_items if item.name not in disallowed]


# ============================================
# CLEAN UP DASHBOARD
# ============================================


@hooks.register("construct_homepage_panels")
def prune_dashboard(request, panels):
    """
    Remove developer-focused panels.
    """
    hide_classes = {"WorkflowPagesPanel", "LockedPagesPanel"}
    panels[:] = [p for p in panels if p.__class__.__name__ not in hide_classes]
    return panels


# ============================================
# ENHANCED CUSTOM STYLING
# ============================================


@hooks.register("insert_global_admin_css")
def custom_admin_css():
    """
    Add custom CSS for a warmer, friendlier interface with better organization.
    """
    return mark_safe(
        """
        <style>
            /* ============================================
               GLOBAL STYLING - Warm Color Scheme
               ============================================ */

            :root {
                --serenity-sage: #6d9177;
                --serenity-terracotta: #f7b5a3;
                --serenity-charcoal: #2e2e2e;
                --serenity-sand: #ede7e1;
            }

            /* Navigation styling */
            .nav-main a:hover,
            .nav-main a.active {
                background-color: var(--serenity-terracotta) !important;
                color: var(--serenity-charcoal) !important;
            }

            /* Button improvements */
            .button {
                font-size: 1rem !important;
                padding: 0.75rem 1.5rem !important;
                border-radius: 8px !important;
                transition: all 0.2s ease;
            }

            .button-secondary {
                background-color: var(--serenity-sage) !important;
                color: white !important;
            }

            .button-secondary:hover {
                background-color: #577460 !important;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }

            /* Form labels */
            label {
                font-size: 1rem !important;
                font-weight: 600 !important;
                margin-bottom: 0.5rem !important;
                color: var(--serenity-charcoal);
            }

            /* Help text under fields */
            .help {
                color: #666 !important;
                font-size: 0.9rem !important;
                margin-top: 0.25rem;
            }

            /* ============================================
               WELCOME PANEL - Section-Based Navigation
               ============================================ */

            .welcome-panel {
                background: linear-gradient(135deg, #dce5df 0%, #ede7e1 100%);
                border-left: 4px solid var(--serenity-sage);
                padding: 2rem;
                margin-bottom: 2rem;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .welcome-panel h2 {
                font-size: 1.75rem;
                margin-bottom: 0.5rem;
                color: var(--serenity-charcoal);
                font-weight: 700;
            }

            .welcome-subtitle {
                font-size: 1rem;
                color: #666;
                margin-bottom: 2rem;
                font-weight: 400;
            }

            /* Section cards grid */
            .section-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.25rem;
                margin-bottom: 1.5rem;
            }

            .section-card {
                background: white;
                padding: 1.5rem;
                border-radius: 12px;
                border: 2px solid #dce5df;
                transition: all 0.3s ease;
                position: relative;
            }

            .section-card:hover {
                border-color: var(--serenity-sage);
                box-shadow: 0 6px 20px rgba(109, 145, 119, 0.15);
                transform: translateY(-2px);
            }

            .section-card-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
            }

            .section-icon {
                font-size: 1.75rem;
                flex-shrink: 0;
            }

            .section-card h3 {
                font-size: 1.15rem;
                margin: 0;
                color: var(--serenity-charcoal);
                font-weight: 700;
            }

            .section-card p {
                color: #666;
                margin: 0.5rem 0 1rem 0;
                font-size: 0.95rem;
                line-height: 1.5;
            }

            .section-card .field-list {
                margin: 0.75rem 0;
                padding-left: 1.25rem;
                font-size: 0.9rem;
                color: #777;
            }

            .section-card .field-list li {
                margin-bottom: 0.25rem;
            }

            /* Quick action buttons */
            .quick-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }

            .quick-actions .button {
                flex: 1;
                min-width: 120px;
                text-align: center;
                font-size: 0.9rem !important;
                padding: 0.6rem 1rem !important;
            }

            /* Help footer */
            .help-footer {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 2px solid rgba(0,0,0,0.06);
                display: flex;
                align-items: center;
                gap: 1rem;
                background: rgba(255,255,255,0.5);
                padding: 1rem;
                border-radius: 8px;
            }

            .help-footer p {
                margin: 0;
                font-size: 0.95rem;
                color: #666;
            }

            /* ============================================
               RESPONSIVE MAIN MENU
               ============================================ */

            .nav-main {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                align-items: center;
                padding: 0.5rem;
            }

            .nav-main li {
                list-style: none;
            }

            .nav-main a {
                display: inline-flex !important;
                align-items: center;
                gap: 0.6rem;
                padding: 0.65rem 1rem !important;
                border-radius: 8px;
                font-size: 0.98rem;
                text-decoration: none;
                min-width: 140px;
                justify-content: flex-start;
                transition: all 0.18s ease;
            }

            .nav-main a:hover,
            .nav-main a.active {
                box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            }

            .nav-main a .icon,
            .nav-main a svg,
            .nav-main a img {
                width: 1.3rem;
                height: 1.3rem;
                display: inline-block;
                flex: 0 0 1.3rem;
            }

            .nav-main a span,
            .nav-main a .label {
                color: var(--serenity-charcoal);
                font-weight: 600;
            }

            /* Responsive adjustments */
            @media (max-width: 900px) {
                .nav-main {
                    justify-content: center;
                }
                .nav-main a {
                    flex: 1 0 45%;
                    min-width: 140px;
                }
                .section-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 480px) {
                .nav-main a {
                    flex: 1 0 100%;
                    min-width: 0;
                    padding: 0.9rem 1rem !important;
                }
            }

            /* ============================================
               EDIT PAGE IMPROVEMENTS
               ============================================ */

            /* Make panel titles clearer */
            .w-panel__heading {
                font-size: 1.2rem !important;
                font-weight: 700 !important;
                color: var(--serenity-charcoal) !important;
                padding: 1rem 1.5rem !important;
                background: var(--serenity-sand) !important;
                border-radius: 8px 8px 0 0 !important;
            }

            /* Better field spacing in edit forms */
            .w-field {
                margin-bottom: 1.5rem !important;
            }

            /* Collapsible sections styling */
            .w-panel--collapsible {
                margin-bottom: 1.5rem;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid #e0e0e0;
            }

            .w-panel--collapsible:hover {
                border-color: var(--serenity-sage);
            }

            /* Success messages */
            .messages .success {
                background-color: #d4edda !important;
                border-color: var(--serenity-sage) !important;
                color: #155724 !important;
            }
        </style>
        """
    )


# ============================================
# ENHANCED WELCOME PANEL - Section-Based
# ============================================


@hooks.register("construct_homepage_panels")
def add_welcome_panel(request, panels):
    """
    Add comprehensive welcome screen with section-based navigation.
    Each card represents a section of the website that can be edited.
    """

    class WelcomePanel:
        order = 0
        media = Media()

        def render(self):
            # Get the home page ID for direct edit link
            from apps.cms.models import HomePage

            try:
                homepage = HomePage.objects.first()
                edit_url = (
                    f"/cms-admin/pages/{homepage.id}/edit/"
                    if homepage
                    else "/cms-admin/pages/"
                )
            except Exception:
                edit_url = "/cms-admin/pages/"

            return format_html(
                f"""
                <section class="panel summary nice-padding welcome-panel">
                    <h2>🌿 Welcome to Serenity CMS</h2>
                    <p class="welcome-subtitle">
                        Edit your website content by section. Click on any section below to jump directly to what you want to change.
                    </p>

                    <div class="section-grid">
                        <!-- Hero Section -->
                        <div class="section-card">
                            <div class="section-card-header">
                                <span class="section-icon">🏠</span>
                                <h3>Hero Section</h3>
                            </div>
                            <p>The first thing visitors see - your main headline and tagline at the top of the page.</p>
                            <ul class="field-list">
                                <li>Main title (EN/FR)</li>
                                <li>Subtitle (EN/FR)</li>
                                <li>Background image</li>
                            </ul>
                            <div class="quick-actions">
                                <a href="{edit_url}" class="button button-small button-secondary">Edit Hero</a>
                            </div>
                        </div>

                        <!-- About Section -->
                        <div class="section-card">
                            <div class="section-card-header">
                                <span class="section-icon">👤</span>
                                <h3>About Section</h3>
                            </div>
                            <p>Tell your story - introduce yourself, your approach, and your specialties.</p>
                            <ul class="field-list">
                                <li>About title & subtitle</li>
                                <li>Introduction paragraph</li>
                                <li>Your approach</li>
                                <li>4 Specialties</li>
                            </ul>
                            <div class="quick-actions">
                                <a href="{edit_url}" class="button button-small button-secondary">Edit About</a>
                            </div>
                        </div>

                        <!-- Services -->
                        <div class="section-card">
                            <div class="section-card-header">
                                <span class="section-icon">💆</span>
                                <h3>Services</h3>
                            </div>
                            <p>Add, edit, or remove massage services (Swedish, Deep Tissue, etc.).</p>
                            <ul class="field-list">
                                <li>Service name (EN/FR)</li>
                                <li>Description (EN/FR)</li>
                                <li>Duration & price</li>
                                <li>Service image</li>
                            </ul>
                            <div class="quick-actions">
                                <a href="/cms-admin/snippets/services/service/" class="button button-small button-secondary">Manage Services</a>
                                <a href="/cms-admin/snippets/services/service/add/" class="button button-small">Add New</a>
                            </div>
                        </div>

                        <!-- Photos -->
                        <div class="section-card">
                            <div class="section-card-header">
                                <span class="section-icon">📸</span>
                                <h3>Photos</h3>
                            </div>
                            <p>Upload and manage all images used across your website.</p>
                            <ul class="field-list">
                                <li>Hero background images</li>
                                <li>Service photos</li>
                                <li>About section images</li>
                            </ul>
                            <div class="quick-actions">
                                <a href="/cms-admin/images/" class="button button-small button-secondary">View Photos</a>
                                <a href="/cms-admin/images/chooser/upload/" class="button button-small">Upload New</a>
                            </div>
                        </div>

                        <!-- Testimonials -->
                        <div class="section-card">
                            <div class="section-card-header">
                                <span class="section-icon">⭐</span>
                                <h3>Testimonials</h3>
                            </div>
                            <p>Manage client reviews and ratings displayed on your site.</p>
                            <ul class="field-list">
                                <li>Client name</li>
                                <li>Review text (EN/FR)</li>
                                <li>Star rating</li>
                                <li>Featured status</li>
                            </ul>
                            <div class="quick-actions">
                                <a href="/cms-admin/snippets/testimonials/testimonial/" class="button button-small button-secondary">Manage Reviews</a>
                                <a href="/cms-admin/snippets/testimonials/testimonial/add/" class="button button-small">Add New</a>
                            </div>
                        </div>

                        <!-- Contact Info -->
                        <div class="section-card">
                            <div class="section-card-header">
                                <span class="section-icon">📞</span>
                                <h3>Contact Info</h3>
                            </div>
                            <p>Update your contact details shown in the footer and throughout the site.</p>
                            <ul class="field-list">
                                <li>Phone number</li>
                                <li>Email address</li>
                                <li>Business address (EN/FR)</li>
                            </ul>
                            <div class="quick-actions">
                                <a href="{edit_url}" class="button button-small button-secondary">Edit Contact</a>
                            </div>
                        </div>
                    </div>

                    <div class="help-footer">
                        <span style="font-size: 2rem;">💡</span>
                        <div>
                            <p><strong>Quick Tip:</strong> Always click <strong>"Publish"</strong> after making changes to make them visible on your live website. You can also click <strong>"Preview"</strong> to see changes before publishing.</p>
                            <p style="margin-top: 0.5rem;"><strong>Need help?</strong> Contact your developer for assistance.</p>
                        </div>
                    </div>
                </section>
                """
            )

    panels.insert(0, WelcomePanel())
    return panels
