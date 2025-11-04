# Dockerfile (root)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_NO_CACHE_DIR=1

# System deps (kept minimal; psycopg2-binary means no libpq build)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Workdir at repo root; we'll set PYTHONPATH to pick up "backend"
WORKDIR /app

# Install Python deps from root requirements.txt
COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# Copy the full repo
COPY . /app

# Ensure Python can import "backend" as the top-level package
ENV PYTHONPATH=/app/backend

# Collect static during build (safe even if DEBUG=False)
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput || true

# Expose Django via Gunicorn+Uvicorn (ASGI entry is backend/config/asgi.py)
CMD ["gunicorn", "config.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080", "--workers", "3", "--timeout", "60"]
