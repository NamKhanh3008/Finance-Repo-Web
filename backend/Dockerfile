FROM python:3.11-slim

# Prevent Python buffering logs
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# System deps (safe minimal set)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose Gunicorn port
EXPOSE 8000

# Start Gunicorn
CMD ["gunicorn", "-c", "gunicorn_config.py", "run:app"]
