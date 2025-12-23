import React, { useState } from "react";
import LeftPanel from "./LeftPanel";
import MiddlePanel from "./MiddlePanel";
import StockPanel from "./StockPanel";
import ShareModal from "../Components/ShareModal"; // We will create this next
import { useWorkspace } from "../hooks/useWorkspace";

function Workspace() {
  const { 
    projectRoot, 
    isReadOnly, // <--- New logic from hook
    openFiles, 
    activeFileId, 
    activeFile,
    setActiveFileId, 
    openFile, 
    closeTab, 
    logout,
    navigate
  } = useWorkspace();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // --- SAFETY GUARD ---
  if (!projectRoot) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">⚠️ No Project Selected</h1>
        <p className="text-gray-400 mb-8">Please select a project from the dashboard.</p>
        <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500 transition"
        >
            Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex bg-gray-900 text-white overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
        <LeftPanel
            projectRoot={projectRoot}
            onSelectFile={openFile}
            onLogout={logout}
            readOnly={isReadOnly} // <--- Pass to hide "Add/Delete" buttons
            onOpenShare={() => setIsShareModalOpen(true)} // Owner can trigger share
        />
      </div>

      {/* MIDDLE PANEL */}
      <div className="flex-1 flex flex-col min-w-0">
        <MiddlePanel
            openFiles={openFiles}
            activeFileId={activeFileId}
            selectedFile={activeFile}
            onTabClick={setActiveFileId}
            onTabClose={closeTab}
            readOnly={isReadOnly} // <--- Pass to disable editing/saving
        />
      </div>

      {/* RIGHT PANEL */}
      <StockPanel />

      {/* SHARING MODAL */}
      {isShareModalOpen && (
        <ShareModal 
          projectId={projectRoot.id} 
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}

    </div>
  );
}

export default Workspace;