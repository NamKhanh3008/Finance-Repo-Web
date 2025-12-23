import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Upload,
  ShieldCheck,
} from "lucide-react";
import PDFCanvas from "../Components/PDFCanvas";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs";

function PDFViewer({
  fileUrl,
  annotations,
  activeNoteId,
  drawingColor,
  setDrawingColor,
  onNoteClick,
  onAddNote,
  onDeleteNote,
  onFileUpload,
  isUploading,
  readOnly,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 overflow-hidden">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-2 bg-gray-800 text-white h-14">
        <div className="flex items-center gap-2">
          <button onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}>
            <ZoomOut size={18} />
          </button>
          <span className="text-xs w-10 text-center">
            {(scale * 100).toFixed(0)}%
          </span>
          <button onClick={() => setScale((s) => Math.min(s + 0.2, 3))}>
            <ZoomIn size={18} />
          </button>
        </div>

        {!readOnly ? (
          <div className="flex gap-2">
            <button onClick={() => setDrawingColor(null)}>
              <MousePointer2 size={16} />
            </button>
            {["yellow", "green", "red"].map((c) => (
              <button
                key={c}
                onClick={() => setDrawingColor(c)}
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        ) : (
          <ShieldCheck size={16} />
        )}

        <div className="flex items-center gap-2">
          <button onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}>
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs">
            {pageNumber} / {numPages || "-"}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
          >
            <ChevronRight size={18} />
          </button>

          {!readOnly && (
            <label className="cursor-pointer">
              <Upload size={16} />
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={onFileUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* PDF */}
      <div className="flex-1 flex justify-center overflow-auto p-6 relative">
        {fileUrl && (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <div className="relative">
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />

              <PDFCanvas
                pageNumber={pageNumber}
                scale={scale}
                annotations={annotations}
                activeNoteId={activeNoteId}
                drawingColor={drawingColor}
                setDrawingColor={setDrawingColor}
                onAddNote={onAddNote}
                onNoteClick={onNoteClick}
                onDeleteNote={onDeleteNote}
                readOnly={readOnly}
              />
            </div>
          </Document>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;
