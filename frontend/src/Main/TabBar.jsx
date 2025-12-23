// src/Main/TabBar.jsx
import React from 'react';
import { X } from 'lucide-react'; // Make sure you have lucide-react or use a simple "x" string

const TabBar = ({ openFiles, activeFileId, onActivate, onClose }) => {
  return (
    <div className="flex items-center bg-gray-900 border-b border-gray-700 overflow-x-auto no-scrollbar h-9">
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId;
        return (
          <div
            key={file.id}
            onClick={() => onActivate(file.id)}
            className={`
              group flex items-center gap-2 px-3 h-full min-w-[120px] max-w-[200px] text-xs cursor-pointer select-none border-r border-gray-800
              ${isActive ? 'bg-gray-800 text-white border-t-2 border-t-blue-500' : 'text-gray-400 hover:bg-gray-800'}
            `}
          >
            {/* File Icon */}
            <span className="text-blue-400">📄</span>
            
            {/* Filename (Truncated) */}
            <span className="truncate flex-1">{file.name}</span>

            {/* Close Button (Hidden unless hovered or active) */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Stop click from activating the tab
                onClose(file.id);
              }}
              className={`p-0.5 rounded-sm hover:bg-gray-700 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;