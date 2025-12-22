# app/routes/annotation_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.annotation_service import AnnotationService
from app.routes.middleware import require_permission # <--- Import this

annotation_bp = Blueprint("annotation_bp", __name__)

# ---------------------------------------------------------
# 1. GET ANNOTATIONS (Viewers Allowed)
# ---------------------------------------------------------
@annotation_bp.route("/<int:file_id>", methods=["GET"])
@jwt_required()
@require_permission(access='VIEW') # <--- Safe for shared users
def get_annotations(file_id):
    user_id = get_jwt_identity()
    notes = AnnotationService.get_annotations(file_id, user_id)
    
    if notes is None:
        return jsonify({"error": "File not found or access denied"}), 404
        
    return jsonify(notes), 200

# ---------------------------------------------------------
# 2. ADD ANNOTATION (Editors/Owners Only)
# ---------------------------------------------------------
# CHANGE: Moved file_id to URL so Middleware can protect it
@annotation_bp.route("/<int:file_id>", methods=["POST"]) 
@jwt_required()
@require_permission(access='OWNER') # <--- BLOCKS Viewers from adding notes
def add_annotation(file_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Inject the file_id from the URL into the data dict 
    # so your Service doesn't break if it expects it there.
    data['file_id'] = file_id 

    try:
        new_note = AnnotationService.add_annotation(user_id, data)
        if not new_note:
             return jsonify({"error": "Invalid file"}), 404
        return jsonify(new_note), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# 3. UPDATE/DELETE (User must own the note)
# ---------------------------------------------------------
# Note: We don't use project middleware here because these actions 
# are specific to a single note ID. The Service handles checking 
# if "user_id" matches the note's owner.

@annotation_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required()
def update_annotation(note_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        updated_note = AnnotationService.update_annotation(note_id, user_id, data)
        if not updated_note:
            return jsonify({"error": "Note not found or access denied"}), 404
        return jsonify(updated_note), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@annotation_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_annotation(note_id):
    user_id = get_jwt_identity()
    
    try:
        success = AnnotationService.delete_annotation(note_id, user_id)
        if not success:
            return jsonify({"error": "Note not found or access denied"}), 404
        return jsonify({"message": "Deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500