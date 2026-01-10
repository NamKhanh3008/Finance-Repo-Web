# Gunicorn configuration file
import multiprocessing
import os

# Server socket
bind = os.getenv("GUNICORN_BIND", "0.0.0.0:8000")
backlog = 2048

# Worker processes
workers = int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = os.getenv("GUNICORN_WORKER_CLASS", "sync")
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = os.getenv("GUNICORN_ACCESS_LOG", "-")  # "-" means stdout
errorlog = os.getenv("GUNICORN_ERROR_LOG", "-")    # "-" means stderr
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "finance_repo_web"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (uncomment and configure if using HTTPS)
# keyfile = None
# certfile = None

# Graceful timeout for worker shutdown
graceful_timeout = 30

# Preload app for better memory usage (use with caution)
preload_app = False

# Max requests per worker (helps prevent memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Worker timeout
# worker_tmp_dir = "/dev/shm"  # Uncomment for Linux systems with shared memory

