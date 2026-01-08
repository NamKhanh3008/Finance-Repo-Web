import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  File,
  Trash2,
  ChevronRight,
  ChevronDown,
  Pencil
} from "lucide-react";

const FileTreeItem = ({
  node,
  selectedFolderId,
  onSelectFolder,
  onSelectFile,
  onDelete,
  onRenameFile,
  readOnly
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Inline rename state (folder)
  const [editingFolder, setEditingFolder] = useState(false);
  const [folderDraft, setFolderDraft] = useState(node.name);

  // Inline rename state (file)
  const [editingFileId, setEditingFileId] = useState(null);
  const [fileDraft, setFileDraft] = useState("");

  const isSelected = selectedFolderId === node.id;

  // Keep draft in sync if tree updates
  useEffect(() => {
    setFolderDraft(node.name);
  }, [node.name]);

  const handleFolderClick = (e) => {
    e.stopPropagation();
    onSelectFolder(node.id);
    setIsOpen((prev) => !prev);
  };

  const commitFolderRename = () => {
    const trimmed = folderDraft.trim();
    if (!trimmed || trimmed === node.name) {
      setFolderDraft(node.name);
      setEditingFolder(false);
      return;
    }

    onRenameFile?.(node.id, trimmed, "folder");
    setEditingFolder(false);
  };

  const commitFileRename = (file) => {
    const trimmed = fileDraft.trim();
    if (!trimmed || trimmed === file.name) {
      setEditingFileId(null);
      return;
    }

    onRenameFile?.(file.id, trimmed, "file");
    setEditingFileId(null);
  };

  return (
    <div className="ml-3 border-l border-gray-700 pl-2 mt-1">
      {/* FOLDER ROW */}
      <div
        onClick={handleFolderClick}
        className={`group flex justify-between items-center cursor-pointer px-2 py-1 text-sm rounded-sm transition-colors
          ${isSelected ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}
      >
        <div className="flex items-center overflow-hidden gap-1.5">
          <span className="text-gray-500">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>

          <span className={`${isSelected ? "text-white" : "text-yellow-500"}`}>
            {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
          </span>

          {editingFolder ? (
            <input
              value={folderDraft}
              autoFocus
              onChange={(e) => setFolderDraft(e.target.value)}
              onBlur={commitFolderRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitFolderRename();
                if (e.key === "Escape") {
                  setFolderDraft(node.name);
                  setEditingFolder(false);
                }
              }}
              className="bg-gray-800 text-white text-sm px-1 rounded w-full"
            />
          ) : (
            <span className="truncate ml-1">{node.name}</span>
          )}
        </div>

        {!readOnly && (
          <div className="hidden group-hover:flex items-center gap-1 px-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingFolder(true);
              }}
              className="text-gray-400 hover:text-blue-400"
              title="Rename"
            >
              <Pencil size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id, "folder");
              }}
              className="text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* CHILDREN */}
      {isOpen && (
        <div className="flex flex-col">
          {node.children?.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onSelectFile={onSelectFile}
              onDelete={onDelete}
              onRenameFile={onRenameFile}
              readOnly={readOnly}
            />
          ))}

          {node.files?.map((file) => (
            <div key={file.id} className="ml-3 border-l border-gray-700 pl-2 mt-1">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFile(file);
                }}
                className="group flex justify-between items-center cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 text-sm py-1 rounded-sm px-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-blue-400">
                    <File size={16} />
                  </span>

                  {editingFileId === file.id ? (
                    <input
                      value={fileDraft}
                      autoFocus
                      onChange={(e) => setFileDraft(e.target.value)}
                      onBlur={() => commitFileRename(file)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitFileRename(file);
                        if (e.key === "Escape") setEditingFileId(null);
                      }}
                      className="bg-gray-800 text-white text-sm px-1 rounded"
                    />
                  ) : (
                    <span className="truncate">{file.name}</span>
                  )}
                </div>

                {!readOnly && (
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFileId(file.id);
                        setFileDraft(file.name);
                      }}
                      className="text-gray-500 hover:text-blue-400"
                      title="Rename"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(file.id, "file");
                      }}
                      className="text-gray-500 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeItem;
