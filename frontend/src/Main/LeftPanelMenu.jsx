// src/Main/LeftPanelMenu.jsx
import React from "react";
import { ArrowLeft, Folder, File, Share2, ShieldCheck } from "lucide-react";

function LeftPanelMenu({ 
  onAddFolder, 
  onAddFile, 
  projectName, 
  onBack, 
  onOpenShare, 
  isReadOnly 
}) {
  return (
    <div className="flex flex-col border-b border-gray-700 bg-gray-800 p-4 shrink-0">
      
      {/* Header Row: Back Button + Title + Share */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-gray-200 min-w-0">
          {/* BACK BUTTON */}
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-1.5 rounded transition-all shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          
          {/* PROJECT NAME */}
          <h2 className="text-sm font-bold uppercase tracking-wider truncate select-none" title={projectName}>
            {projectName || "EXPLORER"}
          </h2>
        </div>

        {/* SHARE BUTTON: Only show if NOT Read Only (Owner/Editor) */}
        {!isReadOnly && (
          <button
            onClick={onOpenShare}
            className="text-blue-400 hover:bg-blue-900/30 p-1.5 rounded transition-all shrink-0"
            title="Share Project"
          >
            <Share2 size={18} />
          </button>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-2">
        {isReadOnly ? (
          /* VIEW ONLY BADGE */
          <div className="flex-1 flex items-center justify-center gap-2 bg-gray-900/50 text-gray-500 text-[10px] uppercase tracking-widest py-2 rounded border border-gray-700">
            <ShieldCheck size={14} /> View Only Mode
          </div>
        ) : (
          /* CRUD BUTTONS */
          <>
            <button
              onClick={onAddFolder}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-xs text-white py-2 rounded transition border border-gray-600 shadow-sm"
              title="Create New Folder"
            >
              <Folder size={14} /> Folder
            </button>

            <button
              onClick={onAddFile}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-xs text-white py-2 rounded transition shadow-sm"
              title="Create New File"
            >
              <File size={14} /> File
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default LeftPanelMenu;