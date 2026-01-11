# app/services/file_service.py



from ..models import Folder, File, ProjectShare

from ..db.database import db





class FileService:

    @staticmethod
    def get_tree(user_id):
        """
        Returns only the user's owned folders and files as a nested tree.
        Shared projects are NOT included here.
        """
        # Owned root folders
        owned_roots = Folder.query.filter_by(parent_id=None, user_id=user_id).all()
        owned_tree = [FileService.build_tree_node(root) for root in owned_roots]

        # Owned root files (no parent)
        root_files = File.query.filter_by(parent_id=None, user_id=user_id).all()
        files_tree = [
            {"id": f.id, "name": f.name, "supabase_url": f.supabase_url}
            for f in root_files
        ]

        return {"folders": owned_tree, "files": files_tree}
    @staticmethod
    def get_shared_tree(user_id):
        shared_results = (
            db.session.query(Folder, ProjectShare.role)
            .join(ProjectShare, Folder.id == ProjectShare.project_id)
            .filter(ProjectShare.user_id == user_id)
            .all()
        )

        shared_tree = []
        for folder, role in shared_results:
            folder.permission_role = role
            shared_tree.append(
                FileService.build_tree_node(folder, include_shared=True)
            )
        print("Shared folder tree:", shared_tree)

        return {
            "folders": shared_tree,
            "files": []
        }


    # -----------------------------

    # Create a new Folder

    # -----------------------------

    @staticmethod

    def create_folder(name, parent_id=None, user_id=None):

        folder = Folder(name=name, parent_id=parent_id, user_id=user_id)

        db.session.add(folder)

        db.session.commit()

        return FileService.get_tree(user_id=user_id)



    # -----------------------------

    # Create a new File (notes + upload)

    # -----------------------------

    @staticmethod

    def create_file(name, parent_id, content="", user_id=None):

        file = File(

            name=name,

            parent_id=parent_id,

            content=content,

            user_id=user_id,

            supabase_url=None   # new column defaults to null

        )

        db.session.add(file)

        db.session.commit()

        return FileService.get_tree(user_id=user_id)



    # -----------------------------

    # Rename a File

    # -----------------------------

    @staticmethod

    def rename_file(file_id, new_name, user_id):

        file = File.query.filter_by(id=file_id, user_id=user_id).first()

        if not file:

            return None

       

        file.name = new_name

        db.session.commit()

        return FileService.get_tree(user_id=user_id)



    # -----------------------------

    # Save text content / notes

    # -----------------------------

    @staticmethod

    def save_file_content(file_id, content, user_id):

        file = File.query.filter_by(id=file_id, user_id=user_id).first()

        if not file:

            return None



        file.content = content

        db.session.commit()

        return file.to_dict()



    # -----------------------------

    # Fetch notes for a file

    # -----------------------------

    @staticmethod
    def get_file_content(file_id, user_id):
        # Try to find file owned by the user
        file = File.query.filter_by(id=file_id, user_id=user_id).first()

        # If not owned, check shared access via ProjectShare
        if not file:
            file = db.session.query(File)\
                .join(ProjectShare, File.parent_id == ProjectShare.project_id)\
                .filter(File.id == file_id, ProjectShare.user_id == user_id)\
                .first()

        if not file:
            return None

        return file.to_dict()



    # -----------------------------

    # Save uploaded file URL (Supabase)

    # -----------------------------

    @staticmethod

    def save_uploaded_file(file_id, filename, supabase_url, user_id):

        # supabase_url is the storage path or signed URL

        file = File.query.filter_by(id=file_id, user_id=user_id).first()

        if not file:

            return None



        file.supabase_url = supabase_url

        file.name = filename # Optional: Update name to match file

        db.session.commit()



        return file.to_dict()



    # -----------------------------

    # Return uploaded file info

    # -----------------------------

    @staticmethod
    def get_uploaded_file(file_id, user_id):
        # Owned file
        file = File.query.filter_by(id=file_id, user_id=user_id).first()

        # Shared file
        if not file:
            file = db.session.query(File)\
                .join(ProjectShare, File.parent_id == ProjectShare.project_id)\
                .filter(File.id == file_id, ProjectShare.user_id == user_id)\
                .first()

        if not file:
            return None

        return {
            "name": file.name,
            "supabase_url": file.supabase_url
        }




    # -----------------------------

    # Build folder tree for frontend

    # -----------------------------

    @staticmethod
    def build_tree_node(folder, include_shared=False):
        """
        Recursively build folder node.
        """
        node = {
            "id": folder.id,
            "name": folder.name,
            "children": [FileService.build_tree_node(child, include_shared) for child in folder.children],
            "files": [
                {
                    "id": f.id,
                    "name": f.name,
                    "supabase_url": f.supabase_url
                }
                for f in folder.files
            ]
        }

        if include_shared and hasattr(folder, 'permission_role'):
            node["is_shared"] = True
            node["permission_role"] = folder.permission_role
            node["name"] = f"🔗 {folder.name}"

        return node

    # -----------------------------
    # Get full tree: owned + shared
    # -----------------------------
    @staticmethod
    def get_full_tree(user_id):
        """
        Returns a nested tree of user's folders/files including shared projects.
        """
        # 1. Owned root folders
        owned_roots = Folder.query.filter_by(parent_id=None, user_id=user_id).all()
        owned_tree = [FileService.build_tree_node(root) for root in owned_roots]

        # 2. Owned root files (no parent)
        root_files = File.query.filter_by(parent_id=None, user_id=user_id).all()
        files_tree = [
            {
                "id": f.id,
                "name": f.name,
                "supabase_url": f.supabase_url
            }
            for f in root_files
        ]

        # 3. Shared root folders
        shared_results = db.session.query(Folder, ProjectShare.role)\
            .join(ProjectShare, Folder.id == ProjectShare.project_id)\
            .filter(ProjectShare.user_id == user_id).all()

        shared_tree = []
        for folder, role in shared_results:
            # mark the folder as shared
            folder.permission_role = role
            shared_tree.append(FileService.build_tree_node(folder, include_shared=True))

        # 4. Combine everything
        full_tree = {
            "folders": owned_tree + shared_tree,
            "files": files_tree
        }

        return full_tree


        # Return both

        return {

            "folders": folder_data,

            "files": file_data

        }



    # -----------------------------

    # Delete a File

    # -----------------------------

    @staticmethod

    def delete_file(file_id, user_id):

        file = File.query.filter_by(id=file_id, user_id=user_id).first()

        if file:

            # Optional: Add logic to delete from Supabase storage here if needed

            db.session.delete(file)

            db.session.commit()

           

        return FileService.get_tree(user_id)



    # -----------------------------

    # Delete a Folder (and children)

    # -----------------------------

    @staticmethod

    def delete_folder(folder_id, user_id):

        folder = Folder.query.filter_by(id=folder_id, user_id=user_id).first()

        if folder:

            db.session.delete(folder)

            db.session.commit()

           

        return FileService.get_tree(user_id)



    # -----------------------------

    # NEW: Get File Metadata for Streaming

    # -----------------------------

    @staticmethod
    def get_file_metadata(file_id, user_id):
        # Owned file
        file = File.query.filter_by(id=file_id, user_id=user_id).first()

        # Shared file
        if not file:
            file = db.session.query(File)\
                .join(ProjectShare, File.parent_id == ProjectShare.project_id)\
                .filter(File.id == file_id, ProjectShare.user_id == user_id)\
                .first()

        if not file:
            return None

        return file
    @staticmethod
    def get_shared_projects(user_id):
        shared_results = db.session.query(Folder, ProjectShare.role)\
            .join(ProjectShare, Folder.id == ProjectShare.project_id)\
            .filter(ProjectShare.user_id == user_id).all()

        return [
            {"id": folder.id, "name": folder.name, "permission_role": role, "is_shared": True}
            for folder, role in shared_results
        ]
