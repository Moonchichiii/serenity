"""
Local development settings.
    uv run manage.py runserver
No .env file required — sensible defaults for everything.
"""

import cloudinary as _cloudinary
from decouple import config

from .base import *

# ── Core ────────────────────────────────────────────
DEBUG = True
ENVIRONMENT = "development"

# ── Database — SQLite, zero config ──────────────────
DATABASES = {
     "default": {
          "ENGINE": "django.db.backends.sqlite3",
          "NAME": BASE_DIR / "db.sqlite3",
     }
}

# ── Cache — in-memory ──────────────────────────────
CACHES = {
     "default": {
          "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
          "LOCATION": "serenity-local",
     }
}

# ── Cloudinary Configuration ───────────────────────
CLOUDINARY_CLOUD_NAME = config("CLOUDINARY_CLOUD_NAME", default="")
CLOUDINARY_API_KEY = config("CLOUDINARY_API_KEY", default="")
CLOUDINARY_API_SECRET = config("CLOUDINARY_API_SECRET", default="")

USE_CLOUDINARY = bool(
     CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
)

if USE_CLOUDINARY:
     _cloudinary.config(
          cloud_name=CLOUDINARY_CLOUD_NAME,
          api_key=CLOUDINARY_API_KEY,
          api_secret=CLOUDINARY_API_SECRET,
          secure=True,
     )
     CLOUDINARY_STORAGE = {
          "CLOUD_NAME": CLOUDINARY_CLOUD_NAME,
          "API_KEY": CLOUDINARY_API_KEY,
          "API_SECRET": CLOUDINARY_API_SECRET,
          "SECURE": True,
     }
     STORAGES = {
          "default": {
                "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage"
          },
          "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
          },
     }
else:
     _cloudinary.config(
          cloud_name="dummy",
          api_key="000000000000000",
          api_secret="dummy",
     )
     CLOUDINARY_STORAGE = {
          "CLOUD_NAME": "dummy",
          "API_KEY": "000000000000000",
          "API_SECRET": "dummy",
     }
     STORAGES = {
          "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
          },
          "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
          },
     }
     MEDIA_ROOT = BASE_DIR / "media"

# ── Email — live testing production flow. ───────────────────────
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


GIFT_VOUCHER_SETTINGS = {
    "business_name": "Serenity Touch",
    # This ensures the admin email is sent to YOU
    "business_email": config("EMAIL_HOST_USER"),
    "business_phone": "+33 6 12 34 56 78",
    "business_address": "123 Wellness Street, Paris",
    "site_url": "http://localhost:5173",
}

# ── CORS — wide open for localhost ──────────────────
CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = [
     "http://localhost:4173",
     "http://localhost:5173",
     "http://127.0.0.1:4173",
     "http://127.0.0.1:5173",
     "http://localhost:3000",
     "http://127.0.0.1:3000",
]

# ── Security — relaxed ─────────────────────────────
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# ── CSP — disabled for local dev ───────────────────
CONTENT_SECURITY_POLICY = None

# ── Rate limiting — disabled for tests/dev ──────────
RATELIMIT_ENABLE = False
