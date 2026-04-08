################################################################################
# AryaOS — Production Dockerfile
# Uses requirements-prod.txt (no ML deps) → lean ~200 MB image
################################################################################
FROM python:3.11-slim

# Env: no .pyc files, unbuffered logs, default port
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=10000 \
    WSGI_MODULE=core.wsgi:application

WORKDIR /app

# --- OS deps (only what's needed for pure-Python + SQLite) -------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# --- Python deps (prod only — no torch/transformers/pytest) ------------------
COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

# --- Application code --------------------------------------------------------
COPY . .

# Ensure the filesystem sandbox directory exists inside the image
RUN mkdir -p aryaos_storage/home aryaos_storage/system

# Collect static files (WhiteNoise will serve them)
# SECRET_KEY must be set or Django refuses to run — use a throw-away value here
RUN SECRET_KEY=build-time-dummy \
    ALLOWED_HOSTS=* \
    python manage.py collectstatic --noinput

# Expose the port (Render / Railway read $PORT at runtime)
EXPOSE ${PORT}

# On startup: run migrations, then serve with gunicorn
# Two workers is plenty for a SQLite portfolio site
CMD ["sh", "-c", \
     "python manage.py migrate --run-syncdb && \
      gunicorn ${WSGI_MODULE} \
        --bind 0.0.0.0:${PORT} \
        --workers 2 \
        --timeout 120 \
        --access-logfile - \
        --error-logfile -"]
