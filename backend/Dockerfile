FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT="/usr/local" \
    UV_NO_CACHE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN uv sync --no-dev --frozen

COPY . /app

ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=config.settings.production
ENV ENVIRONMENT=production

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
    mkdir -p /app/staticfiles && \
    python manage.py collectstatic --noinput -v 1

CMD ["bash", "-lc", "exec gunicorn config.asgi:application \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers ${WEB_CONCURRENCY:-1} \
  --timeout ${WEB_TIMEOUT:-60} \
  --max-requests 200 \
  --max-requests-jitter 50 \
  --graceful-timeout 30 \
  --keep-alive 5"]
