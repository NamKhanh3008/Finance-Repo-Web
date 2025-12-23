import React, { useState } from "react";
import { X } from "lucide-react";

function PDFCanvas({
  pageNumber,
  annotations,
  activeNoteId,
  drawingColor,
  setDrawingColor,
  onAddNote,
  onNoteClick,
  onDeleteNote,
  readOnly,
}) {
  /* ---------------- DRAWING STATE ---------------- */
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [previewRect, setPreviewRect] = useState(null);

  /* ---------------- MOUSE HANDLERS ---------------- */
  const handleMouseDown = (e) => {
    if (!drawingColor || readOnly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setIsDrawing(true);
    setStartPos({ x, y });
    setPreviewRect({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPos || readOnly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setPreviewRect({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      w: Math.abs(x - startPos.x),
      h: Math.abs(y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !previewRect || readOnly) return;

    // Prevent tiny accidental boxes
    if (previewRect.w > 0.01 && previewRect.h > 0.01) {
      onAddNote({
        page_number: pageNumber,
        x: previewRect.x,
        y: previewRect.y,
        width: previewRect.w,
        height: previewRect.h,
        color: drawingColor,
        content: "",
      });
    }

    setIsDrawing(false);
    setStartPos(null);
    setPreviewRect(null);
    setDrawingColor(null);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div
      className={`absolute inset-0 z-50 ${
        drawingColor && !readOnly ? "cursor-crosshair" : "cursor-default"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* PREVIEW RECT (IMMEDIATE FEEDBACK) */}
      {isDrawing && previewRect && (
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 pointer-events-none"
          style={{
            left: `${previewRect.x * 100}%`,
            top: `${previewRect.y * 100}%`,
            width: `${previewRect.w * 100}%`,
            height: `${previewRect.h * 100}%`,
          }}
        />
      )}

      {/* SAVED ANNOTATIONS */}
      {annotations
        .filter((n) => n.page_number === pageNumber)
        .map((note) => (
          <div
            key={note.id}
            onClick={(e) => {
              e.stopPropagation();
              onNoteClick(note.id);
            }}
            className={`absolute cursor-pointer transition-all
              ${activeNoteId === note.id ? "ring-2 ring-blue-500 z-40" : "z-30"}
            `}
            style={{
              left: `${note.x * 100}%`,
              top: `${note.y * 100}%`,
              width: `${note.width * 100}%`,
              height: `${note.height * 100}%`,
              backgroundColor:
                note.color === "yellow"
                  ? "rgba(253,224,71,0.4)"
                  : note.color === "green"
                  ? "rgba(134,239,172,0.4)"
                  : "rgba(252,165,165,0.4)",
              mixBlendMode: "multiply",
            }}
          >
            {/* DELETE ONLY WHEN SELECTED */}
            {!readOnly && activeNoteId === note.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
    </div>
  );
}

export default PDFCanvas;
