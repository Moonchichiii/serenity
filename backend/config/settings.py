from pathlib import Path

import cloudinary  # noqa: F401
import dj_database_url
from corsheaders.defaults import default_headers
from decouple import Csv, config

# Core
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe")
DEBUG = config("DJANGO_DEBUG", cast=bool, default=False)
ENVIRONMENT = config("ENVIRONMENT", default="development")

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    cast=Csv(),
    default="localhost,127.0.0.1",
)

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
    "csp",
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


# Optional: rate limiting
if config("RATELIMIT_ENABLE", cast=bool, default=False):
    INSTALLED_APPS += ["django_ratelimit"]

# Auth
AUTHENTICATION_BACKENDS = [
    "apps.core.backends.EmailOrUsernameBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# ── Middleware
MIDDLEWARE = [
    "django.middleware.cache.UpdateCacheMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "csp.middleware.CSPMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.core.middleware.CacheHeaderMiddleware",
    "django.middleware.cache.FetchFromCacheMiddleware",
]


ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database
DATABASES = {
    "default": dj_database_url.parse(
        config("DATABASE_URL"),
        conn_max_age=600,
    )
}

# STATIC & MEDIA FILES
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"

# Cloudinary SDK
cloudinary.config(
    cloud_name=config("CLOUDINARY_CLOUD_NAME"),
    api_key=config("CLOUDINARY_API_KEY"),
    api_secret=config("CLOUDINARY_API_SECRET"),
    secure=True,
)

# Cloudinary storage for Django
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": config("CLOUDINARY_API_KEY"),
    "API_SECRET": config("CLOUDINARY_API_SECRET"),
    "SECURE": True,
}

STORAGES = {
    "default": {  # media
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {  # static
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
EMAIL_TIMEOUT = 15
DEFAULT_FROM_EMAIL = config(
    "DEFAULT_FROM_EMAIL",
    default="Serenity <fivzserenity@gmail.com>",
)
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_SUBJECT_PREFIX = "[Serenity] "
ADMINS = [("Serenity Site", "fivzserenity@gmail.com")]


# DRF / Schema
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}
SPECTACULAR_SETTINGS = {"TITLE": "Serenity API", "VERSION": "1.0.0"}


# ── CORS / CSRF Settings
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", cast=Csv(), default="")
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", cast=Csv(), default="")

# Allow preview sites
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://[a-z0-9-]+\.pages\.dev$",
    r"^https://.*\.laserenity\.fr$",
]

CORS_ALLOW_CREDENTIALS = config("CORS_ALLOW_CREDENTIALS", cast=bool, default=True)

# IMPORTANT:
CORS_ALLOW_HEADERS = list(default_headers) + [
    "cache-control",
    "x-cache-status",
    "x-requested-with",
]

# Preflight cache duration
CORS_PREFLIGHT_MAX_AGE = 86400

CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": ("'self'",),
        "script-src": ("'self'", "'nonce-*'"),
        "style-src": ("'self'", "'unsafe-inline'"),
        "img-src": (
            "'self'",
            "https://res.cloudinary.com",
            "https://ui-avatars.com",
            "https://api.dicebear.com",
            "data:",
            "blob:",
        ),
        "media-src": ("'self'", "https://res.cloudinary.com", "blob:"),
        "font-src": ("'self'", "data:"),
        "connect-src": (
            "'self'",
            "https://serenity.fly.dev",
            "https://res.cloudinary.com",
        ),
        "frame-src": ("'none'",),
        "object-src": ("'none'",),
        "base-uri": ("'self'",),
        "form-action": ("'self'",),
        "upgrade-insecure-requests": True,
    },
    "EXCLUDE_URL_PREFIXES": ("/cms-admin/", "/admin/", "/documents/"),
}


# Security
if ENVIRONMENT == "production":
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    # Trusted Types + COOP/COEP for stricter security
    # SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"
    # SECURE_CROSS_ORIGIN_EMBEDDER_POLICY = "require-corp"
else:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_AGE = 86400  # 1 day

# i18n
LANGUAGE_CODE = "en"
LANGUAGES = [("en", "English"), ("fr", "Français")]
WAGTAIL_CONTENT_LANGUAGES = LANGUAGES
TIME_ZONE = "Europe/Paris"
USE_I18N = USE_TZ = True
LOCALE_PATHS = [BASE_DIR / "locale"]

# WAGTAIL CMS
WAGTAIL_SITE_NAME = config("WAGTAIL_SITE_NAME", default="Serenity")
WAGTAIL_I18N_ENABLED = True
WAGTAIL_FRONTEND_LOGIN_URL = "/portal"
WAGTAILADMIN_BASE_URL = config("WAGTAILADMIN_BASE_URL", default="")

# Wagtail Image Upload Settings
WAGTAILIMAGES_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
WAGTAILIMAGES_MAX_IMAGE_PIXELS = 128000000

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
            ]
        },
    }
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Cache Redis
REDIS_URL = config("REDIS_URL", default=None)
if REDIS_URL:
    redis_options = {
        "CLIENT_CLASS": "django_redis.client.DefaultClient",
        "CONNECTION_POOL_KWARGS": {"max_connections": 5},
        "SOCKET_CONNECT_TIMEOUT": 5,
        "SOCKET_TIMEOUT": 5,
    }
    try:
        import hiredis  # noqa

        redis_options["PARSER_CLASS"] = "redis.connection._HiredisParser"
    except Exception:
        pass

    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": redis_options,
            "KEY_PREFIX": "serenity",
            "TIMEOUT": 300,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-serenity",
        }
    }

# Cache middleware config
CACHE_MIDDLEWARE_ALIAS = "default"
CACHE_MIDDLEWARE_SECONDS = 300
CACHE_MIDDLEWARE_KEY_PREFIX = ""

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
