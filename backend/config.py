import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # 1. Database URI
    SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI") or os.environ.get("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---------------------------------------------------------
    # THE FIX: Keep the connection alive
    # ---------------------------------------------------------
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # Checks connection before using it. If dead, reconnects.
        "pool_recycle": 300,    # Refreshes connection every 5 minutes to prevent timeouts.
    }

    # 2. Security & API Keys
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    
    FRONTEND_URL = os.getenv("FRONTEND_URL")

    # 3. Validation Checks
    if DATABASE_URL is None:
        raise ValueError("DATABASE_URL is missing from .env")
    if JWT_SECRET_KEY is None:
        raise ValueError("JWT_SECRET_KEY is missing from .env")