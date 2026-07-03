# syntax=docker/dockerfile:1.7
# ═══════════════════════════════════════════════════════════════
# Stage 1 — builder: resolve deps into a self-contained venv.
# uv version pinned (never :latest). No compilers needed: every
# dependency ships manylinux wheels for py3.12.
# ═══════════════════════════════════════════════════════════════
FROM python:3.14-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Dependency layer first — cached until pyproject/uv.lock change.
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --extra prod --no-install-project

# Project layer.
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --extra prod

# ═══════════════════════════════════════════════════════════════
# Stage 2 — runtime: slim, non-root, no uv, no build tools.
# ═══════════════════════════════════════════════════════════════
FROM python:3.14-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /app --shell /usr/sbin/nologin app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PATH="/app/.venv/bin:$PATH" \
    DJANGO_SETTINGS_MODULE=config.settings.production \
    ENVIRONMENT=production

WORKDIR /app
COPY --from=builder --chown=app:app /app /app

# collectstatic at build time with inert dummies. WhiteNoise hashing
# needs no real secrets; nothing sensitive ever touches an image layer.
RUN DJANGO_SECRET_KEY=build-only-not-a-secret-0123456789abcdefghijklmnopqrstuv \
    DATABASE_URL=postgresql://build:build@localhost:5432/build \
    FRONTEND_URL=https://laserenity.fr \
    CLOUDINARY_CLOUD_NAME=build CLOUDINARY_API_KEY=build CLOUDINARY_API_SECRET=build \
    ALLOWED_HOSTS=localhost CORS_ALLOWED_ORIGINS=https://laserenity.fr CSRF_TRUSTED_ORIGINS=https://laserenity.fr \
    EMAIL_HOST_USER=build@example.com EMAIL_HOST_PASSWORD=build \
    DEFAULT_FROM_EMAIL=build@example.com CONTACT_RECIPIENT_EMAIL=build@example.com \
    STRIPE_SECRET_KEY=sk_test_build STRIPE_WEBHOOK_SECRET=whsec_build STRIPE_PUBLISHABLE_KEY=pk_test_build \
    GOOGLE_CALENDAR_ID=build GOOGLE_SERVICE_ACCOUNT_JSON='{}' \
    python manage.py collectstatic --noinput -v 0 \
    && chown -R app:app /app/staticfiles

USER app
EXPOSE 8000

CMD ["bash", "-lc", "exec gunicorn config.asgi:application \
  -k uvicorn_worker.UvicornWorker \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers ${WEB_CONCURRENCY:-1} \
  --timeout ${WEB_TIMEOUT:-60} \
  --max-requests 200 \
  --max-requests-jitter 50 \
  --graceful-timeout 30 \
  --keep-alive 5"]
