import React from "react";
import PDFViewer from "../Components/PDFViewer";
import { FileText, Upload, Cloud, MousePointer2, Highlighter, FolderOpen } from "lucide-react";

function MiddlePanelUI({
  selectedFile,
  currentFileName,

  content,
  onContentChange,

  previewUrl,
  isLoading,

  annotations,
  activeNote,
  noteDraft,
  onNoteDraftChange,
  activeNoteId,

  readOnly,

  drawingColor,
  onSetDrawingColor,

  onNoteClick,
  onAddNote,
  onDeleteNote,

  onOpenDrive,
  onFileUpload,
}) {
  if (!selectedFile) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center text-gray-500">
        Select a file
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* HEADER */}
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-6 bg-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-red-500" />
          <div className="font-semibold">{currentFileName}</div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => onSetDrawingColor(null)}
              className={`p-1.5 rounded ${drawingColor === null ? "bg-blue-600" : "text-gray-400"}`}
            >
              <MousePointer2 size={16} />
            </button>

            <button
              onClick={() => onSetDrawingColor("yellow")}
              className={`p-1.5 rounded ${drawingColor === "yellow" ? "bg-yellow-500/20 text-yellow-400" : "text-gray-400"}`}
            >
              <Highlighter size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* CLIFFNOTES */}
        <div className="space-y-2">
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">Cliffnotes</label>
          <textarea
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300 focus:border-blue-500 text-sm resize-y"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            readOnly={readOnly}
            placeholder="Document summary..."
          />
        </div>

        {/* ACTIVE NOTE EDITOR */}
        <div className="space-y-2">
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">Highlight Details</label>
          <div className="w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {activeNote ? (
              <div className="flex flex-col">
                <div className="bg-gray-700/50 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                  <span className="text-[10px] text-blue-400 font-mono font-bold">PAGE {activeNote.page_number}</span>
                  {!readOnly && (
                    <button
                      onClick={() => onDeleteNote(activeNote.id)}
                      className="text-red-400 text-[10px] hover:underline font-bold uppercase"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <textarea
                  className="w-full h-24 bg-transparent p-4 text-sm text-gray-200 focus:outline-none resize-none"
                  value={noteDraft}
                  readOnly={readOnly}
                  onChange={(e) => onNoteDraftChange(activeNote.id, e.target.value)}
                  placeholder="Type notes for this highlight..."
                />
              </div>
            ) : (
              <div className="p-8 text-center text-gray-600 text-xs italic">
                Select a highlight to edit its notes.
              </div>
            )}
          </div>
        </div>

        {/* UPLOAD BUTTONS */}
        {!readOnly && (
          <div className="flex justify-end gap-4 pt-4">
            <input type="file" onChange={onFileUpload} className="hidden" id="file-upload-mid" />
            <label
              htmlFor="file-upload-mid"
              className="cursor-pointer text-gray-500 text-[11px] flex items-center gap-1.5 hover:text-white transition font-medium"
            >
              <Upload size={14} /> Computer
            </label>
            <button
              onClick={onOpenDrive}
              className="text-gray-500 text-[11px] flex items-center gap-1.5 hover:text-white transition font-medium"
            >
              <Cloud size={14} /> Google Drive
            </button>
          </div>
        )}

        {/* PDF VIEWER */}
        <div className="w-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden relative shadow-2xl min-h-[800px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">Loading...</div>
          ) : previewUrl ? (
            <PDFViewer
              fileUrl={previewUrl}
              annotations={annotations}
              activeNoteId={activeNoteId}
              drawingColor={drawingColor}
              setDrawingColor={onSetDrawingColor}
              onNoteClick={onNoteClick}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
              readOnly={readOnly}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-700 py-20">
              <FolderOpen size={48} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiddlePanelUI;
