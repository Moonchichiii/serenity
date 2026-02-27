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

# ── Storage — local filesystem, no Cloudinary ──────
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
MEDIA_ROOT = BASE_DIR / "media"

# Use real Cloudinary locally if env vars exist, else dummy (so imports don’t crash)
CLOUDINARY_CLOUD_NAME = config("CLOUDINARY_CLOUD_NAME", default="")
CLOUDINARY_API_KEY = config("CLOUDINARY_API_KEY", default="")
CLOUDINARY_API_SECRET = config("CLOUDINARY_API_SECRET", default="")

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
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
else:
    # Dummy Cloudinary config so the SDK import doesn't crash
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

# ── Email — print to console ───────────────────────
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

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
