# app/services/fork_service.py
from ..db.database import db
from ..models import Folder, File, Annotation

class ForkService:

    @staticmethod
    def fork_project(original_folder_id, new_owner_id):
        """
        Deepcopy a shared project (folder) and all its files/annotations
        and assign the copies to the new owner.
        """
        original_folder = Folder.query.get(original_folder_id)
        if not original_folder:
            return None

        # Recursive helper to copy folders
        def copy_folder(folder, parent_id=None):
            new_folder = Folder(
                name=folder.name,
                parent_id=parent_id,
                user_id=new_owner_id
            )
            db.session.add(new_folder)
            db.session.flush()  # Get ID of new folder

            # Copy files in this folder
            for f in folder.files:
                new_file = File(
                    name=f.name,
                    content=f.content,
                    parent_id=new_folder.id,
                    user_id=new_owner_id,
                    supabase_url=f.supabase_url
                )
                db.session.add(new_file)
                db.session.flush()

                # Copy annotations
                for a in f.annotations:
                    new_annotation = Annotation(
                        file_id=new_file.id,
                        user_id=new_owner_id,
                        page_number=a.page_number,
                        x_position=a.x_position,
                        y_position=a.y_position,
                        width=a.width,
                        height=a.height,
                        content=a.content,
                        color=a.color
                    )
                    db.session.add(new_annotation)

            # Recursively copy child folders
            for child in folder.children:
                copy_folder(child, parent_id=new_folder.id)

            return new_folder

        try:
            new_root = copy_folder(original_folder)
            db.session.commit()
            return new_root.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e
