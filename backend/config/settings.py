from pathlib import Path

import cloudinary  # noqa: F401
import dj_database_url
from decouple import Csv, config

# Core
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe")
DEBUG = config("DJANGO_DEBUG", cast=bool, default=True)
ENVIRONMENT = config("ENVIRONMENT", default="development")
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

# Installed apps
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Cloudinary
    "cloudinary",
    "cloudinary_storage",
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
    # Local apps
    "apps.core",
    "apps.cms",
    "apps.services",
    "apps.testimonials",
    "apps.availability",
    "apps.bookings",
    "apps.contact",
]

# Optional rate limiting app
RATELIMIT_ENABLE = config("RATELIMIT_ENABLE", cast=bool, default=False)
INSTALLED_APPS += ["django_ratelimit"] if RATELIMIT_ENABLE else []


# Auth
AUTHENTICATION_BACKENDS = [
    "apps.core.backends.EmailOrUsernameBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# Middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# URLs / WSGI / ASGI
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database
DATABASES = {
    "default": dj_database_url.parse(
        config("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600,
    )
}

# Configure Cloudinary SDK (for cloudinary package)
cloudinary.config(
    cloud_name=config("CLOUDINARY_CLOUD_NAME"),
    api_key=config("CLOUDINARY_API_KEY"),
    api_secret=config("CLOUDINARY_API_SECRET"),
    secure=True,
)

#  Configure Cloudinary Storage (for cloudinary_storage package)
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": config("CLOUDINARY_API_KEY"),
    "API_SECRET": config("CLOUDINARY_API_SECRET"),
}

# Static & Media
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"

# Django storage configuration
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Email
EMAIL_BACKEND = config(
    "EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", cast=int, default=587)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", cast=bool, default=True)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config(
    "DEFAULT_FROM_EMAIL",
    default=(
        f"Serenity <{EMAIL_HOST_USER}>" if EMAIL_HOST_USER else "webmaster@localhost"
    ),
)

# DRF / Schema
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Serenity API",
    "VERSION": "1.0.0",
}

# CORS / CSRF
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", cast=Csv(), default="http://localhost:4173"
)
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", cast=Csv(), default="http://localhost:4173"
)
CORS_ALLOW_CREDENTIALS = True

# Security
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
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_AGE = 86400

# Internationalization
LANGUAGE_CODE = "en"
LANGUAGES = [("en", "English"), ("fr", "Français")]
WAGTAIL_CONTENT_LANGUAGES = LANGUAGES
TIME_ZONE = "Europe/Paris"
USE_I18N = True
USE_TZ = True
LOCALE_PATHS = [BASE_DIR / "locale"]

# Wagtail
WAGTAIL_SITE_NAME = config("WAGTAIL_SITE_NAME", default="Serenity")
WAGTAIL_I18N_ENABLED = True
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

# Defaults / Cache
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}
