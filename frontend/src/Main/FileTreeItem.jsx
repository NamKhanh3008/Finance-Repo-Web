import React, { useState } from "react";
import { Folder, FolderOpen, File, Trash2, ChevronRight, ChevronDown } from "lucide-react";

const FileTreeItem = ({ node, selectedFolderId, onSelectFolder, onSelectFile, onDelete, readOnly }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSelected = selectedFolderId === node.id;

    const handleFolderClick = (e) => {
        e.stopPropagation();
        onSelectFolder(node.id);
        setIsOpen(!isOpen);
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
                    <span className="text-gray-500">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span className={`${isSelected ? "text-white" : "text-yellow-500"}`}>{isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}</span>
                    <span className="truncate ml-1">{node.name}</span>
                </div>
                
                {/* Delete button only if NOT ReadOnly */}
                {!readOnly && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(node.id, 'folder'); }} className="hidden group-hover:block text-gray-400 hover:text-red-500 px-2">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* RECURSIVE CHILDREN */}
            {isOpen && (
                <div className="flex flex-col">
                    {node.children?.map(child => (
                        <FileTreeItem key={child.id} node={child} selectedFolderId={selectedFolderId} onSelectFolder={onSelectFolder} onSelectFile={onSelectFile} onDelete={onDelete} readOnly={readOnly} />
                    ))}
                    {node.files?.map(file => (
                        <div key={file.id} className="ml-3 border-l border-gray-700 pl-2 mt-1">
                            <div onClick={(e) => { e.stopPropagation(); onSelectFile(file); }} className="group flex justify-between items-center cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 text-sm py-1 rounded-sm px-2">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-blue-400"><File size={16} /></span>
                                    <span className="truncate">{file.name}</span>
                                </div>
                                {!readOnly && (
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(file.id, 'file'); }} className="hidden group-hover:block text-gray-500 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
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