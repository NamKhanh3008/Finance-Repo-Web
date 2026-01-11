# src/app/routes/FileSaveRoutes/file_save_routes.py

from flask import Blueprint, request, jsonify
from ...services.file_service import FileService
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from supabase import create_client, Client
import os

# --- Blueprint setup ---
file_bp = Blueprint('file_bp', __name__, url_prefix="/api/file")

# --- Supabase client ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")  # service role key for uploads
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Upload configuration ---
ALLOWED_EXTENSIONS = {"pdf", "docx", "xlsx"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# -------------------------------------------------
# 1. Save notes for a file
# -------------------------------------------------
@file_bp.route("/content/<int:file_id>", methods=["POST"])
@jwt_required()
def save_file_content(file_id):
    data = request.get_json()
    content = data.get("content", "")
    user_id = get_jwt_identity()

    updated_file = FileService.save_file_content(file_id, content, user_id)
    return jsonify(updated_file), 200

# -------------------------------------------------
# 2. Fetch notes for a file
# -------------------------------------------------
@file_bp.route("/content/<int:file_id>", methods=["GET"])
@jwt_required()
def get_file_content(file_id):
    user_id = get_jwt_identity()
    file_data = FileService.get_file_content(file_id, user_id)
    return jsonify(file_data), 200

# -------------------------------------------------
# 3. Upload an actual file to Supabase (private bucket)
# -------------------------------------------------
@file_bp.route("/upload/<int:file_id>", methods=["POST"])
@jwt_required()
def upload_file(file_id):
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    user_id = get_jwt_identity()

    # Private bucket and storage path
    bucket = "user-files"  # make sure this bucket exists in Supabase
    storage_path = f"user_{user_id}/{filename}"

    # Upload file to Supabase
    try:
        res = supabase.storage.from_(bucket).upload(storage_path, file)
        if res.get("error"):
            return jsonify({"error": res["error"]["message"]}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Save storage path in DB (supabase_url can be null until download is requested)
    updated_file = FileService.save_uploaded_file(file_id, filename, storage_path, user_id)
    return jsonify(updated_file), 200

# -------------------------------------------------
# 4. Download / preview file from Supabase (private signed URL)
# -------------------------------------------------
@file_bp.route("/download/<int:file_id>", methods=["GET"])
@jwt_required()
def download_file(file_id):
    user_id = get_jwt_identity()
    file_data = FileService.get_uploaded_file(file_id, user_id)

    if not file_data or not file_data.get("storage_path"):
        return jsonify({"error": "File not found"}), 404

    bucket = "user-files"
    storage_path = file_data["storage_path"]

    # Generate a signed URL for private access (expires in 1 hour)
    try:
        signed_url_data = supabase.storage.from_(bucket).create_signed_url(storage_path, 3600)
        if signed_url_data.get("error"):
            return jsonify({"error": signed_url_data["error"]["message"]}), 500
        url = signed_url_data["signedURL"]
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"url": url}), 200
