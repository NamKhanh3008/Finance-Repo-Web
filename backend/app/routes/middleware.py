from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from ..models import File, Folder, ProjectShare


def require_permission(access='VIEW'):
    """
    access='VIEW'   -> Owner OR Shared Viewer
    access='OWNER'  -> Owner ONLY
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):

            # Allow CORS preflight
            if request.method == 'OPTIONS':
                return '', 200

            # Get user
            try:
                current_user_id = int(get_jwt_identity())
            except:
                return jsonify({"error": "Invalid token"}), 401

            file_id = kwargs.get('file_id')
            folder_id = kwargs.get('folder_id')

            resource = None
            owner_id = None
            project_id = None

            # -------------------------
            # FILE
            # -------------------------
            if file_id:
                resource = File.query.get(file_id)
                if not resource:
                    return jsonify({"error": "File not found"}), 404

                parent_folder = Folder.query.get(resource.parent_id)
                if not parent_folder:
                    return jsonify({"error": "Parent folder not found"}), 404

                owner_id = parent_folder.user_id
                project_id = parent_folder.id

            # -------------------------
            # FOLDER
            # -------------------------
            elif folder_id:
                resource = Folder.query.get(folder_id)
                if not resource:
                    return jsonify({"error": "Folder not found"}), 404

                owner_id = resource.user_id
                project_id = resource.id

            else:
                return jsonify({"error": "No resource specified"}), 400

            # -------------------------
            # OWNER
            # -------------------------
            if owner_id == current_user_id:
                return f(*args, **kwargs)

            # -------------------------
            # OWNER ONLY
            # -------------------------
            if access == 'OWNER':
                return jsonify({"error": "Owner permission required"}), 403

            # -------------------------
            # VIEW (SHARED)
            # -------------------------
            share = ProjectShare.query.filter_by(
                project_id=project_id,
                user_id=current_user_id
            ).first()

            if not share:
                return jsonify({"error": "Access denied"}), 403

            return f(*args, **kwargs)

        return wrapper
    return decorator
