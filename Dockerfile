FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY . /app

ENV PYTHONPATH=/app/backend
WORKDIR /app/backend

CMD ["bash","-lc","gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 60"]
