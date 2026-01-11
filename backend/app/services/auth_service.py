# app/services/auth_service.py
from ..models import User
from ..db.database import db
from flask_jwt_extended import create_access_token
import requests

class AuthService:

    @staticmethod
    def get_google_user_info(auth_code, redirect_uri, client_id, client_secret):
        """
        Exchange the Google auth code for user info AND tokens.
        """
        # Step 1: Exchange auth code for access token
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "code": auth_code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        r = requests.post(token_url, data=payload)
        r.raise_for_status()
        token_data = r.json()
        
        # --- CHANGED: Capture both tokens ---
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token") # Only present if access_type=offline
        # ------------------------------------

        # Step 2: Use access token to get user info
        userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        r = requests.get(userinfo_url, headers=headers)
        r.raise_for_status()
        user_info = r.json()

        # --- CHANGED: Return everything combined ---
        return {
            "email": user_info["email"],
            "name": user_info.get("name"),
            "google_access_token": access_token,
            "google_refresh_token": refresh_token
        }

    @staticmethod
    def get_or_create_user(user_data):
        email = user_data["email"].lower()
        refresh_token = user_data.get("google_refresh_token")
        access_token = user_data.get("google_access_token")

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email)
            db.session.add(user)
        
        # --- THE FIX STARTS HERE ---
        
        # Case A: This IS a "Connect Drive" login (contains a refresh token)
        if refresh_token:
            user.google_access_token = access_token
            user.google_refresh_token = refresh_token
            user.is_drive_connected = True
            
        # Case B: This is a standard Login, BUT the user is NOT connected to Drive yet.
        # We save the weak token just for basic identification if needed.
        elif not user.is_drive_connected:
            user.google_access_token = access_token
            
        # Case C: User IS connected to Drive, but this is a standard Login.
        # DO NOTHING. Do NOT overwrite the existing tokens. 
        # We rely on the stored refresh_token to generate strong tokens later.
        
        # ---------------------------

        db.session.commit()
        return user

    @staticmethod
    def generate_jwt(user):
        """
        Generate JWT token with user.id as identity
        """
        return create_access_token(identity=str(user.id))

    # --- NEW METHOD: Disconnect Drive ---
    @staticmethod
    def disconnect_drive(user_id):
        user = User.query.get(user_id)
        if user:
            user.google_access_token = None
            user.google_refresh_token = None
            user.is_drive_connected = False
            db.session.commit()
            return True
        return False

    # --- NEW METHOD: Status Check ---
    @staticmethod
    def get_user_status(user_id):
        user = User.query.get(user_id)
        if user:
            return {
                "email": user.email,
                "is_drive_connected": user.is_drive_connected
            }
        return None