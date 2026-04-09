"""
Shared settings for all environments.
Nothing environment-specific belongs here.
"""

from pathlib import Path

from corsheaders.defaults import default_headers
from decouple import Csv, config

# ── Paths ───────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("DJANGO_SECRET_KEY", default="override-me-in-env-settings")

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    cast=Csv(),
    default='localhost,127.0.0.1',
)

# ── Apps ────────────────────────────────────────────
INSTALLED_APPS = [
    # Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Cloudinary
    'cloudinary',
    'cloudinary_storage',
    # Third-party
    'rest_framework',
    'django_filters',
    'corsheaders',
    'csp',
    'drf_spectacular',
    # Wagtail
    'wagtail.contrib.forms',
    'wagtail.contrib.redirects',
    'wagtail.contrib.settings',
    'wagtail.embeds',
    'wagtail.sites',
    'wagtail.users',
    'wagtail.snippets',
    'wagtail.documents',
    'wagtail.images',
    'wagtail.search',
    'wagtail.admin',
    'wagtail',
    'modelcluster',
    'taggit',
    'wagtail_localize',
    # Local apps
    'apps.core',
    'apps.cms.apps.CmsConfig',
    'apps.services.apps.ServicesConfig',
    'apps.testimonials',
    'apps.availability',
    'apps.contact',
    "apps.payments",
    'apps.vouchers',
]

# Optional: rate limiting
if config('RATELIMIT_ENABLE', cast=bool, default=False):
    INSTALLED_APPS = [*INSTALLED_APPS, 'django_ratelimit']

# ── Auth ────────────────────────────────────────────
AUTHENTICATION_BACKENDS = [
    'apps.core.backends.EmailOrUsernameBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# ── Middleware ──────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'csp.middleware.CSPMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'wagtail.contrib.redirects.middleware.RedirectMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.CacheHeaderMiddleware',
]

# ── URL / WSGI / ASGI ──────────────────────────────
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# ── Static files ────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'

# ── Email (defaults — overridden per env) ───────────
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.smtp.EmailBackend',
)
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', cast=int, default=587)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool, default=True)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
EMAIL_TIMEOUT = 15

DEFAULT_FROM_EMAIL = config(
    'DEFAULT_FROM_EMAIL',
    default=f'Serenity <{EMAIL_HOST_USER}>',
)
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_SUBJECT_PREFIX = '[Serenity] '

ADMINS = [('Serenity Admin', EMAIL_HOST_USER)]
MANAGERS = ADMINS


# ── DRF / Schema ───────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}
SPECTACULAR_SETTINGS = {
    "TITLE": "Serenity API",
    "DESCRIPTION": "Wellness & spa platform — bookings, vouchers, CMS, availability",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": r"/api/",
    "TAGS": [
        {"name": "cms", "description": "CMS & hydrated homepage"},
        {"name": "vouchers", "description": "Gift voucher operations"},
        {"name": "availability", "description": "Google Calendar availability"},
        {"name": "testimonials", "description": "Testimonial submission & listing"},
        {"name": "contact", "description": "Contact form"},
    ],
}

# Stripe settings
STRIPE_SECRET_KEY = config("STRIPE_SECRET_KEY", default="")
STRIPE_WEBHOOK_SECRET = config("STRIPE_WEBHOOK_SECRET", default="")

FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

STRIPE_SUCCESS_URL = config(
    "STRIPE_SUCCESS_URL",
    default=f"{FRONTEND_URL}/voucher/success?session_id={{CHECKOUT_SESSION_ID}}",
)
STRIPE_CANCEL_URL = config(
    "STRIPE_CANCEL_URL",
    default=f"{FRONTEND_URL}/voucher/cancelled",
)

STRIPE_CURRENCY = config("STRIPE_CURRENCY", default="eur")
STRIPE_API_VERSION = config("STRIPE_API_VERSION", default="2024-06-20")

STRIPE_LIVEMODE = config(
    "STRIPE_LIVEMODE",
    default=False,
    cast=lambda v: str(v).lower() in ("1", "true", "yes", "on"),
)

# ── CORS ────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=Csv(), default='')
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', cast=Csv(), default='')
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://[a-z0-9-]+\.pages\.dev$',
    r'^https://.*\.laserenity\.fr$',
]
CORS_ALLOW_CREDENTIALS = config('CORS_ALLOW_CREDENTIALS', cast=bool, default=True)

# Fixed RUF005: Replacement for CORS_ALLOW_HEADERS concatenation
CORS_ALLOW_HEADERS = [
    *default_headers,
    'cache-control',
    'x-cache-status',
    'x-requested-with',
]
CORS_PREFLIGHT_MAX_AGE = 86400

# ── CSP ─────────────────────────────────────────────
CONTENT_SECURITY_POLICY = {
    'DIRECTIVES': {
        'default-src': ("'self'",),
        'script-src': ("'self'", "'nonce-*'", "https://js.stripe.com"),
        'style-src': ("'self'", "'unsafe-inline'"),
        'img-src': (
            "'self'",
            'https://res.cloudinary.com',
            'https://ui-avatars.com',
            'https://api.dicebear.com',
            'data:',
            'blob:',
        ),
        'media-src': (
            "'self'",
            'https://res.cloudinary.com',
            'blob:',
        ),
        'font-src': ("'self'", 'data:'),
        'connect-src': (
            "'self'",
            'https://serenity.fly.dev',
            'https://res.cloudinary.com',
            "https://api.stripe.com",
        ),
        'frame-src': ("'self'", "https://js.stripe.com"),
        'object-src': ("'none'",),
        'base-uri': ("'self'",),
        'form-action': ("'self'",),
        'upgrade-insecure-requests': True,
    },
    'EXCLUDE_URL_PREFIXES': ('/cms-admin/', '/admin/', '/documents/'),
}

# ── Session / CSRF (common) ────────────────────────
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_AGE = 86400

# ── i18n / L10n ────────────────────────────────────
LANGUAGE_CODE = 'en'
LANGUAGES = [('en', 'English'), ('fr', 'Français')]
WAGTAIL_CONTENT_LANGUAGES = LANGUAGES
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True
LOCALE_PATHS = [BASE_DIR / 'locale']

# ── Wagtail ─────────────────────────────────────────
WAGTAIL_SITE_NAME = config('WAGTAIL_SITE_NAME', default='Serenity')
WAGTAIL_I18N_ENABLED = True
WAGTAIL_FRONTEND_LOGIN_URL = '/portal'
WAGTAILADMIN_BASE_URL = config('WAGTAILADMIN_BASE_URL', default='')
WAGTAILIMAGES_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
WAGTAILIMAGES_MAX_IMAGE_PIXELS = 128_000_000

# ── Templates ───────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Cache (base — overridden per env) ──────────────
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 300
CACHE_MIDDLEWARE_KEY_PREFIX = ''

# ── Logging ─────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {'handlers': ['console'], 'level': 'INFO'},
}
