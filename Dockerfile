FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install --upgrade pip setuptools wheel \
 && python -m pip install \
    --retries 20 \
    --timeout 120 \
    --index-url https://pypi.org/simple \
    -r /app/requirements.txt

COPY . /app

ENV PYTHONPATH=/app/backend
WORKDIR /app/backend

# Build args for collectstatic (dummy values OK, not used at runtime)
ARG DJANGO_SECRET_KEY=build-secret-key-not-used-in-production
ARG DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy
ARG CLOUDINARY_CLOUD_NAME=dummy
ARG CLOUDINARY_API_KEY=dummy
ARG CLOUDINARY_API_SECRET=dummy

ENV DJANGO_SETTINGS_MODULE=config.settings \
    DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY} \
    DATABASE_URL=${DATABASE_URL} \
    CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME} \
    CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY} \
    CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}

RUN mkdir -p /app/backend/staticfiles && \
    python manage.py collectstatic --noinput -v 1

# Clear build-time env vars (will use Fly secrets at runtime)
ENV DJANGO_SECRET_KEY="" \
    DATABASE_URL="" \
    CLOUDINARY_CLOUD_NAME="" \
    CLOUDINARY_API_KEY="" \
    CLOUDINARY_API_SECRET=""

CMD ["bash","-lc","exec gunicorn config.asgi:application \
 -k uvicorn.workers.UvicornWorker \
 --bind 0.0.0.0:${PORT:-8000} \
 --workers ${WEB_CONCURRENCY:-1} \
 --timeout ${WEB_TIMEOUT:-60} \
 --max-requests 200 \
 --max-requests-jitter 50 \
 --graceful-timeout 30 \
 --keep-alive 5"]
