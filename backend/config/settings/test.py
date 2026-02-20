"""
Test runner settings — fast, isolated, no external services.
   ENVIRONMENT=test uv run manage.py test
"""

import cloudinary as _cloudinary

from .base import *

# ── Core ────────────────────────────────────────────
DEBUG = False
ENVIRONMENT = "test"
SECRET_KEY = "test-secret-key-not-for-production"

# ── Database — in-memory SQLite ─────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# ── Cache — dummy ──────────────────────────────────
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}

# ── Storage — in-memory ────────────────────────────
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.InMemoryStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Dummy Cloudinary
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

# ── Email — swallow everything ─────────────────────
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# ── Speed tweaks ───────────────────────────────────
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# ── CSP — off ──────────────────────────────────────
CONTENT_SECURITY_POLICY = None
