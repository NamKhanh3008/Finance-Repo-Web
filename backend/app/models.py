from .db.database import db
from datetime import datetime

# --- 1. NEW TABLE: ProjectShare ---
class ProjectShare(db.Model):
    __tablename__ = 'project_shares'

    id = db.Column(db.Integer, primary_key=True)
    
    # Who is it shared with?
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Which project (folder) is shared?
    project_id = db.Column(db.Integer, db.ForeignKey('folders.id'), nullable=False)
    
    # Permission Level ('VIEWER' or 'EDITOR')
    role = db.Column(db.String(20), default='VIEWER', nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Ensure a user can't be shared the same project twice
    __table_args__ = (db.UniqueConstraint('project_id', 'user_id', name='_project_user_uc'),)

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)

    # Google Drive Columns
    google_access_token = db.Column(db.Text, nullable=True)
    google_refresh_token = db.Column(db.Text, nullable=True)
    is_drive_connected = db.Column(db.Boolean, default=False)

    # Relationships
    folders = db.relationship("Folder", backref="user", lazy=True, cascade="all, delete-orphan")
    files = db.relationship("File", backref="user", lazy=True, cascade="all, delete-orphan")
    annotations = db.relationship("Annotation", backref="user", lazy=True, cascade="all, delete-orphan")

    # --- NEW: Relationship to see what is shared with this user ---
    # This allows: user.shared_projects
    shared_projects = db.relationship("ProjectShare", backref="recipient", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "is_drive_connected": self.is_drive_connected
        }


class Folder(db.Model):
    __tablename__ = "folders"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("folders.id"), nullable=True)

    children = db.relationship(
        "Folder",
        backref=db.backref("parent", remote_side=[id]),
        lazy=True,
        cascade="all, delete-orphan"
    )
    
    files = db.relationship("File", backref="folder", lazy=True, cascade="all, delete-orphan")

    # --- NEW: Relationship to track who has access to this folder ---
    # This allows: folder.shares (returns list of users who have access)
    shares = db.relationship("ProjectShare", backref="project", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "parent_id": self.parent_id,
            "children": [c.to_dict() for c in self.children],
            "files": [f.to_dict() for f in self.files],
            # Optional: Include share count in the response
            "shared_count": len(self.shares) 
        }

# ... (File and Annotation classes remain exactly the same as your code) ...
class File(db.Model):
    __tablename__ = "files"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, default="")
    parent_id = db.Column(db.Integer, db.ForeignKey("folders.id"), nullable=True)
    supabase_url = db.Column(db.String(500), nullable=True)
    annotations = db.relationship("Annotation", backref="file", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "content": self.content,
            "parent_id": self.parent_id,
            "supabase_url": self.supabase_url
        }

class Annotation(db.Model):
    __tablename__ = 'annotations'
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('files.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    page_number = db.Column(db.Integer, nullable=False)
    x_position = db.Column(db.Float, nullable=False)
    y_position = db.Column(db.Float, nullable=False)
    width = db.Column(db.Float, default=0.15)
    height = db.Column(db.Float, default=0.05)
    content = db.Column(db.Text, default="")
    color = db.Column(db.String(20), default="yellow")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'file_id': self.file_id,
            'user_id': self.user_id,
            'page_number': self.page_number,
            'x_position': self.x_position,
            'y_position': self.y_position,
            'width': self.width,
            'height': self.height,
            'content': self.content,
            'color': self.color,
            'updated_at': self.updated_at.isoformat()
        }