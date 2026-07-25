FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Collect static files and ensure DB setup
RUN python manage.py collectstatic --noinput

# Expose Django port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "ipl_project.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
