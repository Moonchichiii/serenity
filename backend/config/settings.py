from pathlib import Path

import dj_database_url
from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe")
DEBUG = config("DJANGO_DEBUG", cast=bool, default=False)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "django_filters",
    "corsheaders",
    "drf_spectacular",
    # Wagtail
    "wagtail.contrib.forms",
    "wagtail.contrib.redirects",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.users",
    "wagtail.snippets",
    "wagtail.documents",
    "wagtail.images",
    "wagtail.search",
    "wagtail.admin",
    "wagtail",
    "modelcluster",
    "taggit",
    "wagtail_localize",
    "wagtailmenus",
    # Cloudinary
    "cloudinary",
    "cloudinary_storage",
    # Local apps
    "apps.core",
    "apps.cms",
    "apps.services",
    "apps.testimonials",
    "apps.availability",
    "apps.bookings",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",  # i18n
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": dj_database_url.parse(
        config("DATABASE_URL", default=f'sqlite:///{BASE_DIR / "db.sqlite3"}'),
        conn_max_age=600,
    )
}

# Static / Media
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
MEDIA_URL = "/media/"
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# Cloudinary defaults: webp + responsive (set in templates/transform or via rendition rules)
CLOUDINARY_STORAGE = {
    "SECURE": True,
    # You can set upload options here if you want server-side auto-format:
    # 'DEFAULTS': {'format': 'webp', 'quality': 'auto'}
}

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Serenity API",
    "VERSION": "1.0.0",
}

# --- CORS & CSRF ---
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", cast=Csv(), default="http://localhost:5173"
)
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", cast=Csv(), default="http://localhost:5173"
)

# Cookie flags (tune in prod)
SESSION_COOKIE_SAMESITE = (
    "None"  # 'Lax' for same-site setups, 'None' for cross-site w/ HTTPS
)
CSRF_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True  # True in prod behind HTTPS
CSRF_COOKIE_SECURE = True  # True in prod behind HTTPS

# Internationalization: EN default, FR available
LANGUAGE_CODE = "en"
LANGUAGES = [
    ("en", "English"),
    ("fr", "Français"),
]
WAGTAIL_CONTENT_LANGUAGES = LANGUAGES
TIME_ZONE = "Europe/Paris"
USE_I18N = True
USE_TZ = True
LOCALE_PATHS = [BASE_DIR / "locale"]

# Wagtail
WAGTAIL_SITE_NAME = config("WAGTAIL_SITE_NAME", default="Serenity")
WAGTAIL_I18N_ENABLED = True

# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
