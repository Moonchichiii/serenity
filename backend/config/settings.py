from pathlib import Path

import dj_database_url
from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe")
DEBUG = config("DJANGO_DEBUG", cast=bool, default=False)

# Environment
ENVIRONMENT = config("ENVIRONMENT", default="development")

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

# If you want a simple toggle in .env
USE_CLOUDINARY = config("USE_CLOUDINARY", cast=bool, default=False)
CLOUDINARY_URL = config("CLOUDINARY_URL", default="")  # optional: auto-detect
USE_CLOUDINARY = USE_CLOUDINARY or bool(CLOUDINARY_URL)

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
    # "wagtailmenus",
    # Cloudinary
    # "cloudinary",
    # "cloudinary_storage",
    # Local apps
    "apps.core",
    "apps.cms",
    "apps.services",
    "apps.testimonials",
    "apps.availability",
    "apps.bookings",
]

# Only add Cloudinary apps if creds/toggle are present
if USE_CLOUDINARY:
    INSTALLED_APPS += ["cloudinary", "cloudinary_storage"]

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

# --- Static / Media ---
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"

if USE_CLOUDINARY:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
    CLOUDINARY_STORAGE = {
        "SECURE": True,
        # "DEFAULTS": {"format": "webp", "quality": "auto"}  # optional
    }
else:
    # Local dev storage
    MEDIA_ROOT = BASE_DIR / "media"
    # Do NOT set DEFAULT_FILE_STORAGE = cloudinary_* here

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Serenity API",
    "VERSION": "1.0.0",
}

# --- Rate Limiting ---
RATELIMIT_ENABLE = False

# --- CORS & CSRF ---
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", cast=Csv(), default="http://localhost:5173"
)
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", cast=Csv(), default="http://localhost:5173"
)

# Security - HTTPS / Cookie Settings
# Tune these per ENVIRONMENT
if ENVIRONMENT == "production":
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
else:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  # JS needs to read this
SESSION_COOKIE_AGE = 86400  # 24 hours

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

# Wagtail Admin Settings
WAGTAIL_FRONTEND_LOGIN_URL = "/portal"
WAGTAILADMIN_BASE_URL = config("WAGTAILADMIN_BASE_URL", default="http://localhost:8000")

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

# Rate Limiting
# RATELIMIT_ENABLE = config("RATELIMIT_ENABLE", cast=bool, default=True)
# RATELIMIT_USE_CACHE = "default"
# RATELIMIT_VIEW = "apps.core.views.ratelimit_error"

# Add django-ratelimit to INSTALLED_APPS if enabled
INSTALLED_APPS += ["django_ratelimit"] if RATELIMIT_ENABLE else []

# Cache for rate limiting (default local cache)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}
