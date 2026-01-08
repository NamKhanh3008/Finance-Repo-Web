import React from "react";
import { StickyNote, Trash2 } from "lucide-react";

function RightNotesPanel({
  cliffnote,
  onCliffnoteChange,

  activeNote,
  noteDraft,
  onNoteDraftChange,
  onDeleteNote,

  readOnly,
}) {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* HEADER */}
      <div className="h-14 border-b border-gray-700 flex items-center px-6 bg-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <StickyNote size={22} className="text-yellow-400" />
          <div className="font-semibold">Notes</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* CLIFFNOTES */}
        <div className="space-y-2">
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">
            Cliffnotes
          </label>
          <textarea
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300 focus:border-blue-500 text-sm resize-y"
            value={cliffnote}
            onChange={(e) => onCliffnoteChange(e.target.value)}
            readOnly={readOnly}
            placeholder="High-level summary of this document..."
          />
        </div>

        {/* ACTIVE NOTE */}
        <div className="space-y-2">
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">
            Highlight Details
          </label>

          <div className="w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {activeNote ? (
              <div className="flex flex-col">
                {/* META BAR */}
                <div className="bg-gray-700/50 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                  <span className="text-[10px] text-blue-400 font-mono font-bold">
                    PAGE {activeNote.page_number}
                  </span>

                  {!readOnly && (
                    <button
                      onClick={() => onDeleteNote(activeNote.id)}
                      className="flex items-center gap-1 text-red-400 text-[10px] hover:underline font-bold uppercase"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>

                {/* EDITOR */}
                <textarea
                  className="w-full h-28 bg-transparent p-4 text-sm text-gray-200 focus:outline-none resize-none"
                  value={noteDraft}
                  readOnly={readOnly}
                  onChange={(e) =>
                    onNoteDraftChange(activeNote.id, e.target.value)
                  }
                  placeholder="Type notes for this highlight..."
                />
              </div>
            ) : (
              <div className="p-8 text-center text-gray-600 text-xs italic">
                Select a highlight in the document to view or edit notes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightNotesPanel;
