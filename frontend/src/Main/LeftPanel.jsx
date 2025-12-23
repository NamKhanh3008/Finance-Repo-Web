import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeftPanelMenu from "./LeftPanelMenu";
import FileTreeItem from "./FileTreeItem";
import { useProjectTree } from "../hooks/useProjectTree";
import { clearPDFCache } from "../Services/cacheService";

function LeftPanel({ onSelectFile, onLogout, projectRoot, readOnly, onOpenShare }) {
  const navigate = useNavigate();
  const [selectedFolderId, setSelectedFolderId] = useState(projectRoot?.id);

  // The hook now receives the specific projectRootId
  const { tree, createFolder, createFile, deleteNode } = useProjectTree(projectRoot?.id);

  const handleLogout = async () => {
    await clearPDFCache();
    if (onLogout) onLogout();
  };

  const handleCreateFile = () => {
    if (readOnly) return; // Guard clause
    const name = prompt("File Name:");
    if (name) createFile.mutate({ name, parentId: selectedFolderId || projectRoot.id });
  };

  const handleCreateFolder = () => {
    if (readOnly) return; // Guard clause
    const name = prompt("Folder Name:");
    if (name) createFolder.mutate({ name, parentId: selectedFolderId || projectRoot.id });
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900" onClick={() => setSelectedFolderId(projectRoot?.id)}>
      <LeftPanelMenu 
        projectName={projectRoot?.name} 
        onBack={() => navigate("/dashboard")}
        // Only pass handlers if NOT readOnly
        onAddFolder={!readOnly ? handleCreateFolder : null}
        onAddFile={!readOnly ? handleCreateFile : null}
        onLogout={handleLogout}
        // New: Pass the share handler down to the menu
        onOpenShare={!readOnly ? onOpenShare : null} 
        isReadOnly={readOnly}
      />
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700">
        {tree.folders.map(rootNode => (
             <FileTreeItem 
                key={rootNode.id} 
                node={rootNode}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onSelectFile={onSelectFile}
                // Hide delete option for Viewers
                onDelete={!readOnly ? (id, type) => deleteNode.mutate({id, type}) : null}
                readOnly={readOnly}
             />
        ))}
      </div>
    </div>
  );
}

export default LeftPanel;