import React, { useState, useEffect } from "react";
import LeftPanel from "./LeftPanel";
import MiddlePanel from "./MiddlePanel";
import StockPanel from "./StockPanel";
import ShareModal from "../Components/ShareModal";
import RightNotesPanel from "./RightNotesPanel";

import { useWorkspace } from "../hooks/useWorkspace";
import { useCliffnote } from "../hooks/useCliffnote";
import { useFileDetails } from "../hooks/useFileDetails";
import { useUpdateNote } from "../hooks/useUpdateNote";

const API_BASE = import.meta.env.VITE_API_BASE_URL;


function Workspace() {
  const {
    projectRoot,
    isReadOnly,
    openFiles,
    activeFileId,
    activeFile,
    setActiveFileId,
    openFile,
    closeTab,
    logout,
    navigate,
  } = useWorkspace();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  /* ------------------------------------------------------------
     🔥 SHARED NOTES STATE (SOURCE OF TRUTH)
  ------------------------------------------------------------ */
  const fileId = activeFile?.id ?? null;

  const { data: fileData, refetch: refetchMeta } =
    useFileDetails(fileId);

  const { cliffnote, setCliffnote } =
    useCliffnote(fileId, isReadOnly);

  const annotations = Array.isArray(fileData?.annotations)
    ? fileData.annotations
    : [];

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const activeNote =
    annotations.find((n) => n.id === activeNoteId) || null;

  // Sync draft when active note changes
  useEffect(() => {
    setNoteDraft(activeNote?.content ?? "");
  }, [activeNoteId, activeNote?.content]);

  


  /* ------------------------------------------------------------
     NOTE HANDLERS (USED BY RIGHT PANEL)
  ------------------------------------------------------------ */

  const handleUpdateNoteDraft = (noteId, content) => {
    setNoteDraft(content);
  };

  const handleDeleteNote = async (noteId) => {
    if (isReadOnly || !noteId) return;
    if (!window.confirm("Delete this highlight?")) return;

    try {
      await fetch(`${API_BASE}/annotation/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      refetchMeta();
      if (noteId === activeNoteId) setActiveNoteId(null);
    } catch {
      alert("Failed to delete note");
    }
  };
  const updateNote = useUpdateNote({ readOnly: isReadOnly });

const handleNoteDraftChange = (noteId, content) => {
  setNoteDraft(content);
  updateNote(noteId, content);
};


  // --- SAFETY GUARD ---
  if (!projectRoot) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">⚠️ No Project Selected</h1>
        <p className="text-gray-400 mb-8">
          Please select a project from the dashboard.
        </p>
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
          readOnly={isReadOnly}
          onOpenShare={() => setIsShareModalOpen(true)}
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
          readOnly={isReadOnly}

          annotations={annotations}
          activeNoteId={activeNoteId}
          onNoteClick={setActiveNoteId}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 shrink-0 border-l border-gray-700 bg-gray-800">
        <RightNotesPanel
          cliffnote={cliffnote}
          onCliffnoteChange={setCliffnote}
          activeNote={activeNote}
          noteDraft={noteDraft}
          onNoteDraftChange={handleNoteDraftChange}
          onDeleteNote={handleDeleteNote}
          readOnly={isReadOnly}
        />
      </div>

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
