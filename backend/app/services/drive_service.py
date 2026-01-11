import requests
from flask import current_app
from ..db.database import db
from ..models import User

class DriveService:
    
    @staticmethod
    def get_valid_headers(user):
        """
        Generates headers for Google API.
        """
        # If we don't even have an access token, we can't try.
        if not user.google_access_token:
            # If we have a refresh token, we can generate one immediately
            if user.google_refresh_token:
                 DriveService.refresh_access_token(user)
            else:
                 raise Exception("User has no access token")
                 
        return {"Authorization": f"Bearer {user.google_access_token}"}

    @staticmethod
    def refresh_access_token(user):
        """
        Uses the long-lived refresh_token to get a new short-lived access_token.
        """
        if not user.google_refresh_token:
            raise Exception("User not connected to Drive (No Refresh Token)")

        token_url = "https://oauth2.googleapis.com/token"
        
        # --- FIX: Use Flask Config, not hardcoded strings ---
        payload = {
            "client_id": current_app.config['GOOGLE_CLIENT_ID'],
            "client_secret": current_app.config['GOOGLE_CLIENT_SECRET'],
            "refresh_token": user.google_refresh_token,
            "grant_type": "refresh_token"
        }
        
        r = requests.post(token_url, data=payload)
        
        if r.status_code != 200:
            print(f"❌ Google Token Refresh Failed: {r.text}")
            # If the refresh token is invalid (revoked), disconnect the user
            if r.status_code in [400, 401]:
                user.is_drive_connected = False
                user.google_access_token = None
                user.google_refresh_token = None
                db.session.commit()
                raise Exception("Google Drive connection expired. Please reconnect in settings.")
            raise Exception(f"Failed to refresh token: {r.text}")

        new_tokens = r.json()
        
        # Save the new token
        user.google_access_token = new_tokens["access_token"]
        db.session.commit()
        
        print(f"✅ Token Refreshed for {user.email}")
        return user.google_access_token

    @staticmethod
    def list_files(user):
        """
        Returns PDFs AND Google Docs/Word files.
        """
        url = "https://www.googleapis.com/drive/v3/files"
        
        # 1. Update Query to include Google Docs and Word Files
        # application/vnd.google-apps.document = Native Google Doc
        # application/vnd.openxmlformats-officedocument.wordprocessingml.document = .docx
        query = (
            "(mimeType='application/pdf' or "
            "mimeType='application/vnd.google-apps.document' or "
            "mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document') "
            "and trashed=false"
        )

        params = {
            "q": query,
            "fields": "files(id, name, mimeType, size, webViewLink)", 
            "pageSize": 20
        }
        
        headers = DriveService.get_valid_headers(user)
        r = requests.get(url, headers=headers, params=params)

        # Handle 401 (Token Expired) Logic here (same as your existing code)
        if r.status_code == 401:
            new_token = DriveService.refresh_access_token(user)
            headers = {"Authorization": f"Bearer {new_token}"}
            r = requests.get(url, headers=headers, params=params)

        r.raise_for_status()
        return r.json().get("files", [])

    @staticmethod
    def download_file_content(user, file_id, mime_type=None):
        """
        Smart Download:
        - If Google Doc: EXPORT as PDF.
        - If Regular File: DOWNLOAD bytes.
        """
        headers = DriveService.get_valid_headers(user)
        
        # 1. Determine if this is a Native Google Doc that needs conversion
        google_docs_mimes = [
            'application/vnd.google-apps.document',
            'application/vnd.google-apps.presentation', # Slides
            'application/vnd.google-apps.spreadsheet'    # Sheets
        ]

        if mime_type in google_docs_mimes:
            # --- STRATEGY A: EXPORT (Convert to PDF) ---
            url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
            params = {"mimeType": "application/pdf"}
            r = requests.get(url, headers=headers, params=params, stream=True)
        else:
            # --- STRATEGY B: DOWNLOAD (Binary) ---
            # This handles .pdf and .docx stored as binary
            url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
            r = requests.get(url, headers=headers, stream=True)

        # Handle 401 Retry Logic
        if r.status_code == 401:
            new_token = DriveService.refresh_access_token(user)
            headers = {"Authorization": f"Bearer {new_token}"}
            # Retry the exact same request
            if mime_type in google_docs_mimes:
                r = requests.get(url, headers=headers, params=params, stream=True)
            else:
                r = requests.get(url, headers=headers, stream=True)
        
        r.raise_for_status()
        return r.content