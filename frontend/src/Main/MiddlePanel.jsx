import React, { useMemo, useState } from "react";
import axios from "axios";

import MiddlePanelUI from "./MiddlePanelUI";
import { useFileDetails } from "../hooks/useFileDetails";
import { useFileContent } from "../hooks/useFileContent";
import { useDriveImport } from "../hooks/useDriveImport";
import { useDrawingTools } from "../hooks/useDrawingTools";
import { useFileUpload } from "../hooks/useFileUpload";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function MiddlePanel({
  selectedFile,
  readOnly,

  // 🔽 NOW CONTROLLED BY WORKSPACE
  annotations,
  activeNoteId,
  onNoteClick,
  onAddNote,
}) {
  const fileId = selectedFile?.id ?? null;

  const { refetch: refetchMeta } = useFileDetails(fileId);
  const {
    data: fileBlob,
    isLoading: isContentLoading,
    refetch: refetchContent,
  } = useFileContent(fileId);

  const { drawingColor, setDrawingColor } = useDrawingTools(readOnly);

  const previewUrl = useMemo(() => {
    if (!fileBlob) return null;
    return URL.createObjectURL(fileBlob);
  }, [fileBlob]);

  /* ------------------------------------------------------------
     OPTIMISTIC DRAW STATE (STAYS HERE)
  ------------------------------------------------------------ */
  const [optimisticAnnotations, setOptimisticAnnotations] = useState([]);

  const drive = useDriveImport(
    localStorage.getItem("authToken"),
    () => {
      refetchMeta();
      refetchContent();
    }
  );

  // ✅ OPTIMISTIC ADD NOTE (DRAWING ONLY)
  const handleAddNoteOptimistic = async (noteData) => {
    if (readOnly || !fileId) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticNote = {
      id: tempId,
      ...noteData,
    };

    setOptimisticAnnotations((prev) => [...prev, optimisticNote]);

    try {
      await axios.post(
        `${API_BASE}/annotation/${fileId}`,
        { ...noteData, file_id: fileId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setOptimisticAnnotations([]);
      refetchMeta();

      // 🔁 notify Workspace if needed
      onAddNote?.();
    } catch (err) {
      console.error("Failed to add note", err);
      setOptimisticAnnotations((prev) =>
        prev.filter((n) => n.id !== tempId)
      );
    }
  };

  const mergedAnnotations = [
    ...optimisticAnnotations,
    ...(Array.isArray(annotations) ? annotations : []),
  ];

  const uploadMutation = useFileUpload(fileId);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  return (
    <>
      <MiddlePanelUI
        selectedFile={selectedFile}
        currentFileName={selectedFile?.name}
        previewUrl={previewUrl}
        isLoading={isContentLoading}

        annotations={mergedAnnotations}
        activeNoteId={activeNoteId}
        onNoteClick={onNoteClick}
        onAddNote={handleAddNoteOptimistic}

        readOnly={readOnly}
        drawingColor={drawingColor}
        onSetDrawingColor={setDrawingColor}

        onOpenDrive={drive.fetchDriveFiles}
        onFileUpload={handleFileUpload}
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
