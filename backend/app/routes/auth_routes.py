# app/routes/auth_routes.py
from flask import Blueprint, request, redirect, current_app, jsonify
from ..services.auth_service import AuthService
from flask_jwt_extended import jwt_required, get_jwt_identity # <--- ADD THIS
from ..models import User

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")
#worked but didn't put token into the URL
# -------------------------------------------------
# Redirect user to Google login
# -------------------------------------------------
@auth_bp.route("/login")
def login():
    # BASIC LOGIN: No Drive scope, no forced consent. Quick and easy.
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={current_app.config['GOOGLE_CLIENT_ID']}&"
        "response_type=code&"
        f"redirect_uri={current_app.config['GOOGLE_REDIRECT_URI']}&"
        "scope=openid email profile&"   # <--- REMOVED drive.readonly
        "access_type=online"            # <--- CHANGED to online (no refresh token needed yet)
    )
    return redirect(google_auth_url)

# -------------------------------------------------
# Callback after Google login
# -------------------------------------------------

# app/routes/auth_routes.py

@auth_bp.route("/callback")
def auth_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    # 1. Exchange code for user info AND TOKENS
    google_user_data = AuthService.get_google_user_info(
        auth_code=code,
        redirect_uri=current_app.config["GOOGLE_REDIRECT_URI"],
        client_id=current_app.config["GOOGLE_CLIENT_ID"],
        client_secret=current_app.config["GOOGLE_CLIENT_SECRET"]
    )

    if not google_user_data:
        return jsonify({"error": "Failed to fetch Google user data"}), 400

    # 2. Pass the WHOLE dictionary (contains refresh_token), not just email
    user = AuthService.get_or_create_user(google_user_data) 

    # 3. Generate JWT
    access_token = AuthService.generate_jwt(user)
    
    # 4. Determine Frontend URL (Safety Fallback)
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
    
    # 5. Redirect to Frontend
    # we add 'drive_connected=true' to force the frontend to realize something changed
    return redirect(f"{frontend_url}/login-success?token={str(access_token)}&drive_connected=true")
#--------------------------------------------------
#google drive route
#----------------------------------------------------
@auth_bp.route("/connect-drive")
@jwt_required()
def connect_drive():
    user_id = get_jwt_identity()

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={current_app.config['GOOGLE_CLIENT_ID']}&"
        "response_type=code&"
        f"redirect_uri={current_app.config['GOOGLE_REDIRECT_URI']}&"
        "scope=openid email profile https://www.googleapis.com/auth/drive.readonly&"
        "access_type=offline&"
        "prompt=consent&"
        f"state={user_id}"
    )
    
    # CHANGE: Return JSON, do not redirect!
    return jsonify({"url": google_auth_url})

@auth_bp.route("/disconnect-drive", methods=["POST"])
@jwt_required()
def disconnect_drive():
    user_id = get_jwt_identity()
    
    # Call a service method to wipe the columns (We will update service next)
    success = AuthService.disconnect_drive(user_id)
    
    if success:
        return jsonify({"message": "Drive disconnected successfully"}), 200
    return jsonify({"error": "User not found"}), 404
#------------------------------
#check status
#-------------------------------

@auth_bp.route("/me")
@jwt_required()
def me():
    # 1. Get the User ID from the token
    user_id = get_jwt_identity()
    
    # 2. Query the LIVE Database (Crucial Step!)
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # 3. Return the fresh status
    return jsonify({
        "id": user.id,
        "email": user.email,
        "is_drive_connected": user.is_drive_connected  # <--- MUST BE HERE
    })