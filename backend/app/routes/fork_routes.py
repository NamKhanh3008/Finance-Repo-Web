# app/routes/fork_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.fork_service import ForkService

fork_bp = Blueprint("fork_bp", __name__)

@fork_bp.route("/<int:folder_id>", methods=["POST"])
@jwt_required()
def fork_project(folder_id):
    user_id = get_jwt_identity()
    try:
        new_project = ForkService.fork_project(folder_id, user_id)
        if not new_project:
            return jsonify({"error": "Original project not found"}), 404
        return jsonify(new_project), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
