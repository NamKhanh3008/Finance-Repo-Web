import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";

import MiddlePanelUI from "./MiddlePanelUI";
import { useFileDetails } from "../hooks/useFileDetails";
import { useFileContent } from "../hooks/useFileContent";
import { useDriveImport } from "../hooks/useDriveImport";
import { useCliffnote } from "../hooks/useCliffnote";
import { useDrawingTools } from "../hooks/useDrawingTools";

const API_BASE = "http://127.0.0.1:5000/api";

function MiddlePanel({ selectedFile, readOnly }) {
  const fileId = selectedFile?.id ?? null;

  const { data: fileData, refetch: refetchMeta } = useFileDetails(fileId);
  const {
    data: fileBlob,
    isLoading: isContentLoading,
    refetch: refetchContent,
  } = useFileContent(fileId);

  const { cliffnote, setCliffnote } = useCliffnote(fileId, readOnly);
  const { drawingColor, setDrawingColor } = useDrawingTools(readOnly);

  const previewUrl = useMemo(() => {
    if (!fileBlob) return null;
    return URL.createObjectURL(fileBlob);
  }, [fileBlob]);

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  /* ------------------------------------------------------------
     🔥 OPTIMISTIC ANNOTATIONS STATE (INSTANT DRAW FIX)
  ------------------------------------------------------------ */
  const [optimisticAnnotations, setOptimisticAnnotations] = useState([]);

  // Initialize draft when active note changes
  useEffect(() => {
    const active = fileData?.annotations?.find((n) => n.id === activeNoteId);
    setNoteDraft(active?.content ?? "");
  }, [activeNoteId, fileData]);

  const drive = useDriveImport(
    localStorage.getItem("authToken"),
    () => {
      refetchMeta();
      refetchContent();
    }
  );

  /* ------------------------------------------------------------
     NOTE HANDLERS
  ------------------------------------------------------------ */

  const handleNoteClick = (noteId) => setActiveNoteId(noteId);

  // ✅ OPTIMISTIC ADD NOTE (INSTANT BOX DRAW)
  const handleAddNote = async (noteData) => {
    if (readOnly || !fileId) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticNote = {
      id: tempId,
      ...noteData,
    };

    // 1️⃣ Draw instantly
    setOptimisticAnnotations((prev) => [...prev, optimisticNote]);

    try {
      // 2️⃣ Save to backend
      await axios.post(
        `${API_BASE}/annotation/${fileId}`,
        { ...noteData, file_id: fileId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // 3️⃣ Sync with backend
      setOptimisticAnnotations([]);
      refetchMeta();
    } catch (err) {
      console.error("Failed to add note", err);

      // ❌ Rollback optimistic note
      setOptimisticAnnotations((prev) =>
        prev.filter((n) => n.id !== tempId)
      );
    }
  };

  // Save draft immediately + debounce backend
  const handleUpdateNoteDraft = (noteId, content) => {
    setNoteDraft(content);
    if (readOnly || !noteId) return;

    clearTimeout(window.noteSaveTimeout);
    window.noteSaveTimeout = setTimeout(async () => {
      try {
        await axios.put(
          `${API_BASE}/annotation/${noteId}`,
          { content },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        refetchMeta();
      } catch (err) {
        console.error("Failed to save note", err);
      }
    }, 300);
  };

  const handleDeleteNote = async (noteId) => {
    if (readOnly) return;
    if (!window.confirm("Delete this highlight?")) return;

    try {
      await axios.delete(`${API_BASE}/annotation/${noteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      refetchMeta();
      if (activeNoteId === noteId) setActiveNoteId(null);
    } catch (err) {
      alert("Failed to delete note");
    }
  };

  /* ------------------------------------------------------------
     MERGED ANNOTATIONS (SERVER + OPTIMISTIC)
  ------------------------------------------------------------ */

  const serverAnnotations = Array.isArray(fileData?.annotations)
    ? fileData.annotations
    : [];

  const annotations = [...optimisticAnnotations, ...serverAnnotations];

  const activeNote =
    annotations.find((n) => n.id === activeNoteId) || null;

  return (
    <>
      <MiddlePanelUI
        selectedFile={selectedFile}
        currentFileName={selectedFile?.name}
        content={cliffnote}
        onContentChange={setCliffnote}
        previewUrl={previewUrl}
        isLoading={isContentLoading}
        annotations={annotations}
        activeNote={activeNote}
        noteDraft={noteDraft}
        onNoteDraftChange={handleUpdateNoteDraft}
        activeNoteId={activeNoteId}
        readOnly={readOnly}
        drawingColor={drawingColor}
        onSetDrawingColor={setDrawingColor}
        onNoteClick={handleNoteClick}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onOpenDrive={drive.fetchDriveFiles}
      />

      {drive.showModal && !readOnly && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] h-[400px] flex flex-col shadow-xl">
            <h3 className="font-bold mb-4 text-gray-800">
              Import from Google Drive
            </h3>
            <div className="flex-1 overflow-y-auto border border-gray-100 rounded">
              {drive.driveFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 border-b border-gray-100"
                >
                  <span className="truncate w-3/4 text-sm text-gray-700">
                    {f.name}
                  </span>
                  <button
                    onClick={() => drive.importFile(f, fileId)}
                    className="text-white bg-blue-600 px-3 py-1 rounded text-xs"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => drive.setShowModal(false)}
              className="mt-4 w-full py-2 bg-gray-100 text-gray-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MiddlePanel;
