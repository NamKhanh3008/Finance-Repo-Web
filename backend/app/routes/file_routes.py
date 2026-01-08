# app/routes/file_routes.py

from flask import Blueprint, request, jsonify, Response, stream_with_context, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from supabase import create_client, Client
import os
import requests

from app.services.file_service import FileService
from app.services.drive_service import DriveService
from app.models import User, File, Folder, ProjectShare  # <--- Added ProjectShare, Folder
from app.db.database import db
from app.routes.middleware import require_permission  # <--- Added Middleware

# -------------------------------------------------------------------
# 1. BLUEPRINT & CONFIGURATION
# -------------------------------------------------------------------

file_bp = Blueprint('file_bp', __name__, url_prefix="/api/file")

# Supabase Setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("WARNING: Supabase keys not found. Uploads will fail.")
    supabase = None

ALLOWED_EXTENSIONS = {"pdf", "docx", "xlsx", "png", "jpg", "jpeg", "csv", "xls"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def get_mime_type(filename):
    lower = filename.lower()
    if lower.endswith('.xlsx'): return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if lower.endswith('.xls'): return 'application/vnd.ms-excel'
    if lower.endswith('.csv'): return 'text/csv'
    if lower.endswith('.pdf'): return 'application/pdf'
    if lower.endswith('.png'): return 'image/png'
    if lower.endswith(('jpg', 'jpeg')): return 'image/jpeg'
    return 'application/octet-stream'

# -------------------------------------------------------------------
# 2. TREE & FOLDER ROUTES
# -------------------------------------------------------------------

@file_bp.route("/tree", methods=["GET"])
@jwt_required()
def get_tree():
    """
    Returns a unified nested tree of the user's projects + shared projects.
    """
    user_id = get_jwt_identity()
    
    # Get full tree including owned and shared folders/files
    tree = FileService.get_full_tree(user_id)
    print("Full tree for user", user_id, ":", tree)
    return jsonify(tree), 200

@file_bp.route("/tree/shared", methods=["GET"])
@jwt_required()
def get_shared_tree():
    """
    Returns a nested tree of projects shared with the current user.
    """
    user_id = get_jwt_identity()

    # Fetch all projects shared with the user
    shared_results = db.session.query(Folder, ProjectShare.role)\
        .join(ProjectShare, Folder.id == ProjectShare.project_id)\
        .filter(ProjectShare.user_id == user_id).all()

    shared_projects = []
    for folder, role in shared_results:
        folder.permission_role = role
        folder_data = FileService.build_tree_node(folder, include_shared=True)
        shared_projects.append(folder_data)

    print(f"Shared tree for user {user_id}:", shared_projects)
    return jsonify(shared_projects), 200




@file_bp.route("/folder", methods=["POST"])
@jwt_required()
def create_folder_route():
    data = request.get_json()
    name = data.get("name")
    parent_id = data.get("parent_id")
    user_id = get_jwt_identity()
    updated_tree = FileService.create_folder(name=name, parent_id=parent_id, user_id=user_id)
    return jsonify(updated_tree), 201


# -------------------------------------------------------------------
# 3. FILE CRUD ROUTES
# -------------------------------------------------------------------

@file_bp.route("/", methods=["POST"])
@jwt_required()
def create_file():
    data = request.get_json()
    name = data.get("name")
    parent_id = data.get("parent_id")
    user_id = get_jwt_identity()
    updated_tree = FileService.create_file(name, parent_id, user_id=user_id)
    return jsonify(updated_tree), 201


@file_bp.route("/<int:file_id>", methods=["PUT"])
@jwt_required()
@require_permission(access='OWNER') # <--- Protected
def rename_file(file_id):
    data = request.get_json()
    new_name = data.get("name")
    user_id = get_jwt_identity()
    updated_tree = FileService.rename_file(file_id, new_name, user_id=user_id)
    return jsonify(updated_tree), 200


@file_bp.route("/<int:file_id>", methods=["DELETE"])
@jwt_required()
@require_permission(access='OWNER') # <--- Protected
def delete_file(file_id):
    user_id = get_jwt_identity()
    updated_tree = FileService.delete_file(file_id, user_id=user_id)
    return jsonify(updated_tree), 200


@file_bp.route("/folder/<int:folder_id>", methods=["DELETE"])
@jwt_required()
@require_permission(access='OWNER') # <--- Protected
def delete_folder(folder_id):
    user_id = get_jwt_identity()
    updated_tree = FileService.delete_folder(folder_id, user_id=user_id)
    return jsonify(updated_tree), 200


# -------------------------------------------------------------------
# 4. CONTENT ROUTES
# -------------------------------------------------------------------

@file_bp.route("/content/<int:file_id>", methods=["GET"])
@jwt_required()
@require_permission(access='VIEW') # <--- Protected
def get_file_content(file_id):
    user_id = get_jwt_identity()
    file_data = FileService.get_file_content(file_id, user_id)
    if not file_data:
        return jsonify({"error": "File not found"}), 404
    return jsonify(file_data), 200


@file_bp.route("/content/<int:file_id>", methods=["POST"])
@jwt_required()
@require_permission(access='OWNER') # <--- Protected
def save_file_content(file_id):
    data = request.get_json()
    content = data.get("content", "")
    user_id = get_jwt_identity()
    updated_file = FileService.save_file_content(file_id, content, user_id)
    if not updated_file:
         return jsonify({"error": "File not found"}), 404
    return jsonify(updated_file), 200


# -------------------------------------------------------------------
# 5. UPLOAD & DOWNLOAD ROUTES (Supabase)
# -------------------------------------------------------------------

@file_bp.route("/upload/<int:file_id>", methods=["POST"])
@jwt_required()
@require_permission(access='OWNER') # <--- Protected
def upload_file(file_id):
    if not supabase: return jsonify({"error": "Server storage not configured"}), 500
    if "file" not in request.files: return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    user_id = get_jwt_identity()
    bucket = "invetment-repo-db"
    storage_path = f"user_{user_id}/{file_id}_{filename}"
    

    try:
        file_content = file.read()
        supabase.storage.from_(bucket).upload(
            file=file_content,
            path=storage_path,
            file_options={"upsert": "true", "content-type": file.content_type}
        )
        updated_file = FileService.save_uploaded_file(file_id, filename, storage_path, user_id)
        return jsonify(updated_file), 200
    except Exception as e:
        print(f"Upload Error: {e}")
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------------
# 6. STREAMING ROUTE
# -------------------------------------------------------------------
@file_bp.route("/stream/<int:file_id>", methods=["GET"])
@jwt_required()
@require_permission(access='VIEW') # <--- Protected
def stream_file(file_id):
    if not supabase: return jsonify({"error": "Server storage not configured"}), 500
    user_id = get_jwt_identity()
    
    file_record = FileService.get_file_metadata(file_id, user_id)
    if not file_record or not file_record.supabase_url:
        return jsonify({"error": "File not found or empty"}), 404

    filename = file_record.name
    storage_path = file_record.supabase_url
    
    updated_str = str(file_record.updated_at) if hasattr(file_record, 'updated_at') else "v1"
    file_etag = f'"{file_id}-{updated_str}"'
    request_etag = request.headers.get('If-None-Match')
    
    if request_etag == file_etag:
        response = Response(status=304)
        response.headers['ETag'] = file_etag
        response.headers['Cache-Control'] = 'private, must-revalidate, max-age=0'
        return response

    try:
        bucket = "invetment-repo-db"
        signed_url_res = supabase.storage.from_(bucket).create_signed_url(storage_path, 60)
        
        source_url = None
        if isinstance(signed_url_res, dict) and "signedURL" in signed_url_res:
            source_url = signed_url_res["signedURL"]
        elif isinstance(signed_url_res, str):
            source_url = signed_url_res
        
        if not source_url: return jsonify({"error": "Could not generate source URL"}), 500

        upstream_req = requests.get(source_url, stream=True)
        if upstream_req.status_code != 200: return jsonify({"error": "Upstream storage error"}), 502

        def generate():
            for chunk in upstream_req.iter_content(chunk_size=4096):
                yield chunk

        response = Response(stream_with_context(generate()), content_type=get_mime_type(filename))
        response.headers['Content-Disposition'] = f'inline; filename="{filename}"'
        response.headers['ETag'] = file_etag
        response.headers['Cache-Control'] = 'private, must-revalidate, max-age=0'
        return response

    except Exception as e:
        print(f"Stream Error: {e}")
        return jsonify({'message': 'Error streaming file'}), 500


# -------------------------------------------------------------------
# 7. GOOGLE DRIVE ROUTES
# -------------------------------------------------------------------

@file_bp.route("/drive/list", methods=["GET"])
@jwt_required()
def list_drive_files():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user: return jsonify({"error": "User not found"}), 404
    if not user.is_drive_connected: return jsonify({"error": "Drive not connected"}), 400

    try:
        files = DriveService.list_files(user)
        return jsonify(files), 200
    except Exception as e:
        print(f"Drive List Error: {e}")
        return jsonify({"error": str(e)}), 500

@file_bp.route("/drive/import", methods=["POST"])
@jwt_required()
def import_drive_file():
    

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.json
    google_file_id = data.get("file_id")
    original_name = data.get("name")
    mime_type = data.get("mime_type")
    
    target_file_id = data.get("target_file_id")
    parent_id = data.get("parent_id")
    print("=== DRIVE IMPORT START ===")
    print("User ID:", user_id)
    print("Google File ID:", google_file_id)
    print("Mime Type:", mime_type)
    print("Target File ID:", target_file_id)
    print("Parent ID:", parent_id)
    if not google_file_id or not original_name:
        return jsonify({"error": "Missing file_id or name"}), 400

    try:
        final_name = original_name
        upload_content_type = "application/pdf"
        
        google_formats = [
            'application/vnd.google-apps.document',
            'application/vnd.google-apps.spreadsheet',
            'application/vnd.google-apps.presentation'
        ]
        
        if mime_type in google_formats:
            base_name = os.path.splitext(original_name)[0]
            final_name = f"{base_name}.pdf"
        elif mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            upload_content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        elif mime_type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            upload_content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        file_node = None
        if target_file_id:
            file_node = File.query.filter_by(id=target_file_id, user_id=user.id).first()
            if not file_node: return jsonify({"error": "Target file not found"}), 404
            file_node.name = final_name
        else:
            file_node = File(
                name=final_name,
                user_id=user.id,
                parent_id=parent_id,
                supabase_url=None
            )
            db.session.add(file_node)
        
        db.session.commit()
        print("→ Calling DriveService.download_file_content")

        file_content_bytes = DriveService.download_file_content(user, google_file_id, mime_type)
        if not file_content_bytes:
            print("❌ DriveService returned EMPTY content")
            return jsonify({"error": "Empty file received from Drive"}), 400
        print("✅ File downloaded from Drive. Size:", len(file_content_bytes))

        bucket = "invetment-repo-db"
        storage_path = f"user_{user_id}/{file_node.id}_{secure_filename(final_name)}"
        
        supabase.storage.from_(bucket).upload(
            file=file_content_bytes,
            path=storage_path,
            file_options={"upsert": "true", "content-type": upload_content_type}
        )

        file_node.supabase_url = storage_path
        db.session.commit()

        return jsonify(file_node.to_dict()), 201

    except Exception as e:
        print(f"Drive Import Error: {e}")
        db.session.rollback()
        

        return jsonify({"error": "Failed to import file"}), 500


# -------------------------------------------------------------------
# 8. SHARING ROUTES (NEW)
# -------------------------------------------------------------------

@file_bp.route('/share/<int:folder_id>', methods=['POST'])
@jwt_required()
def share_project(folder_id):
    current_user_id = int(get_jwt_identity())

    data = request.json or {}
    target_email = data.get('email')

    project = Folder.query.get(folder_id)

    print("=== SHARE PERMISSION CHECK ===")
    print("folder_id:", folder_id)
    print("jwt user:", current_user_id)
    print("project exists:", bool(project))
    if project:
        print("folder.user_id:", project.user_id)
        print("folder.parent_id:", project.parent_id)

    if not target_email:
        return jsonify({"error": "Email is required"}), 400

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if project.user_id != current_user_id:
        return jsonify({"error": "Only the owner can share this project"}), 403

    target_user = User.query.filter_by(email=target_email).first()
    if not target_user:
        return jsonify({"error": "User email not found"}), 404

    if target_user.id == current_user_id:
        return jsonify({"error": "You cannot share with yourself"}), 400

    existing = ProjectShare.query.filter_by(
        project_id=folder_id,
        user_id=target_user.id
    ).first()

    if existing:
        return jsonify({"msg": "User already has access"}), 200

    new_share = ProjectShare(
        project_id=folder_id,
        user_id=target_user.id,
        role='VIEWER'
    )

    db.session.add(new_share)
    db.session.commit()

    return jsonify({"msg": f"Project shared with {target_email}"}), 200

@file_bp.route('/share/<int:folder_id>', methods=['GET'])
@jwt_required()
def list_project_shares(folder_id):
    current_user_id = int(get_jwt_identity())

    project = Folder.query.get(folder_id)

    print("=== SHARE PERMISSION CHECK ===")
    print("folder_id:", folder_id)
    print("jwt user:", current_user_id)
    print("project exists:", bool(project))
    if project:
        print("folder.user_id:", project.user_id)
        print("folder.parent_id:", project.parent_id)

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if project.user_id != current_user_id:
        return jsonify({"error": "Access denied"}), 403

    shares = ProjectShare.query.filter_by(project_id=folder_id).all()

    return jsonify([
        {
            "user_id": s.user_id,
            "email": s.recipient.email,
            "role": s.role,
            "shared_at": s.created_at.isoformat()
        }
        for s in shares
    ]), 200
@file_bp.route("/shared", methods=["GET"])
@jwt_required()
def get_shared_projects():
    """
    Returns a list of projects shared with the current user.
    Only basic info is needed for display (name, id, role).
    """
    user_id = get_jwt_identity()

    # Fetch all projects shared with the user
    shared_results = db.session.query(Folder, ProjectShare.role)\
        .join(ProjectShare, Folder.id == ProjectShare.project_id)\
        .filter(ProjectShare.user_id == user_id).all()

    shared_projects = []
    for folder, role in shared_results:
        folder_data = {
            "id": folder.id,
            "name": folder.name,
            "permission_role": role,
            "is_shared": True
        }
        shared_projects.append(folder_data)

    return jsonify(shared_projects), 200
@file_bp.route("/tree/owned", methods=["GET"])
@jwt_required()
def get_owned_tree():
    """
    Returns a nested tree of only the user's owned projects.
    """
    user_id = get_jwt_identity()
    tree = FileService.get_tree(user_id)  # owned-only
    print("Owned tree for user", user_id, ":", tree)
    return jsonify(tree), 200




#--------------------------------------------------
#FORKING ROUTE
#----------------------------------------------------
@file_bp.route('/fork/<int:folder_id>', methods=['POST'])
@jwt_required()
def fork_project(folder_id):
    current_user_id = get_jwt_identity()

    # 1. Fetch original project
    original = Folder.query.get(folder_id)
    if not original:
        return jsonify({"error": "Project not found"}), 404

    # 2. Permission check: must be owner OR shared with
    if original.user_id != current_user_id:
        share = ProjectShare.query.filter_by(
            project_id=folder_id,
            user_id=current_user_id
        ).first()

        if not share:
            return jsonify({"error": "Access denied"}), 403

    # 3. Recursive deep copy helpers
    def clone_folder(folder, new_parent_id=None):
        cloned = Folder(
            name=folder.name,
            user_id=current_user_id,
            parent_id=new_parent_id
        )
        db.session.add(cloned)
        db.session.flush()  # ensures cloned.id exists

        # Clone files
        for f in folder.files:
            cloned_file = File(
                name=f.name,
                content=f.content,
                parent_id=cloned.id,
                user_id=current_user_id,
                supabase_url=f.supabase_url
            )
            db.session.add(cloned_file)
            db.session.flush()

            # Clone annotations
            for a in f.annotations:
                db.session.add(Annotation(
                    file_id=cloned_file.id,
                    user_id=current_user_id,
                    page_number=a.page_number,
                    x_position=a.x_position,
                    y_position=a.y_position,
                    width=a.width,
                    height=a.height,
                    content=a.content,
                    color=a.color
                ))

        # Clone subfolders
        for child in folder.children:
            clone_folder(child, cloned.id)

        return cloned

    # 4. Create fork root
    forked_root = clone_folder(original)

    db.session.commit()

    return jsonify({
        "message": "Project forked successfully",
        "new_project_id": forked_root.id
    }), 201
