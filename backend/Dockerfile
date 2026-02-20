FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install \
      --retries 30 \
      --timeout 120 \
      --index-url https://pypi.org/simple \
      --extra-index-url https://pypi.python.org/simple \
      --prefer-binary \
      -r /app/requirements.txt

COPY . /app

ENV PYTHONPATH=/app/backend
WORKDIR /app/backend

# Build-time: use base settings for collectstatic (no Redis/Upstash needed)
ENV DJANGO_SETTINGS_MODULE=config.settings

RUN --mount=type=secret,id=django_secret_key,required=false \
    --mount=type=secret,id=database_url,required=false \
    --mount=type=secret,id=cloudinary_cloud_name,required=false \
    --mount=type=secret,id=cloudinary_api_key,required=false \
    --mount=type=secret,id=cloudinary_api_secret,required=false \
    export DJANGO_SECRET_KEY=$(cat /run/secrets/django_secret_key 2>/dev/null || echo "dummysecret") && \
    export DATABASE_URL=$(cat /run/secrets/database_url 2>/dev/null || echo "postgresql://dummy:dummy@dummy:5432/dummy") && \
    export CLOUDINARY_CLOUD_NAME=$(cat /run/secrets/cloudinary_cloud_name 2>/dev/null || echo "dummy") && \
    export CLOUDINARY_API_KEY=$(cat /run/secrets/cloudinary_api_key 2>/dev/null || echo "dummy") && \
    export CLOUDINARY_API_SECRET=$(cat /run/secrets/cloudinary_api_secret 2>/dev/null || echo "dummy") && \
    mkdir -p /app/backend/staticfiles && \
    python manage.py collectstatic --noinput -v 1

# Runtime: Fly's env var (config.settings.production) overrides this
CMD ["bash","-lc","exec gunicorn config.asgi:application \
 -k uvicorn.workers.UvicornWorker \
 --bind 0.0.0.0:${PORT:-8000} \
 --workers ${WEB_CONCURRENCY:-1} \
 --timeout ${WEB_TIMEOUT:-60} \
 --max-requests 200 \
 --max-requests-jitter 50 \
 --graceful-timeout 30 \
 --keep-alive 5"]
