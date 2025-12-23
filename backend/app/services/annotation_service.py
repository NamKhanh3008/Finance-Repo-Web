# app/services/annotation_service.py
from app.db.database import db
from app.models import Annotation, File

class AnnotationService:
    
    @staticmethod
    def get_annotations(file_id, user_id):
        # ONLY check that file exists
        file = File.query.filter_by(id=file_id).first()
        if not file:
            return None

        notes = (
            Annotation.query
            .filter_by(file_id=file_id)
            .order_by(Annotation.page_number)
            .all()
        )
        return [note.to_dict() for note in notes]


    @staticmethod
    def add_annotation(user_id, data):
        file_id = data.get("file_id")
        
        # Check ownership
        file = File.query.filter_by(id=file_id, user_id=user_id).first()
        if not file:
            return None
            
        new_note = Annotation(
            file_id=file_id,
            user_id=user_id,
            page_number=data.get("page_number"),
            x_position=data.get("x"),
            y_position=data.get("y"),
            # --- NEW: Width and Height ---
            width=data.get("width", 0.15),  # Default to 0.15 if missing
            height=data.get("height", 0.05), # Default to 0.05 if missing
            content=data.get("content", ""),
            color=data.get("color", "yellow")
        )

        try:
            db.session.add(new_note)
            db.session.commit()
            return new_note.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def update_annotation(note_id, user_id, data):
        note = Annotation.query.filter_by(id=note_id, user_id=user_id).first()
        if not note:
            return None

        if "content" in data:
            note.content = data["content"]
        if "x" in data:
            note.x_position = data["x"]
        if "y" in data:
            note.y_position = data["y"]
        if "color" in data:
            note.color = data["color"]
            
        # --- NEW: Width and Height Updates ---
        if "width" in data:
            note.width = data["width"]
        if "height" in data:
            note.height = data["height"]

        try:
            db.session.commit()
            return note.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_annotation(note_id, user_id):
        note = Annotation.query.filter_by(id=note_id, user_id=user_id).first()
        if not note:
            return False

        try:
            db.session.delete(note)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    