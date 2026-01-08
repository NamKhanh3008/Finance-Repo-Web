import React from "react";
import {
  Folder,
  GitFork,
  LogOut,
  Plus,
  Trash2,
  Cloud,
} from "lucide-react";
import { DriveToggle } from "../Components/DriveToggle";
import { useDashboard } from "../hooks/useDashboard";
import { SharedWithMe } from "../Components/dashboard/SharedWithMe";
import { useSharedProjects } from "../hooks/useSharedProjects";

function Dashboard() {
  const {
    myRepos,
    handleCreateProject,
    handleDeleteProject,
    enterWorkspace,
    logout,
  } = useDashboard();

  const { data: sharedRepos = [] } = useSharedProjects();

  return (
    <div className="min-h-screen bg-[#111827] text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-[#111827] px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">
            FinanceRepo
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
            ME
          </div>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-400 transition"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* GRID */}
      <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-white">
                My Projects
              </h2>
              
            </div>
          </div>

          {/* NEW PROJECT BUTTON */}
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <Plus size={16} />
            New Project
          </button>

          {/* PROJECT LIST (SharedWithMe style) */}
          <div className="bg-[#1F2937] border border-gray-700 rounded-xl overflow-hidden">
            {myRepos.length > 0 ? (
              myRepos.map((folder, index) => (
                <div
                  key={folder.id}
                  onClick={() => enterWorkspace(folder)}
                  className={`p-4 flex items-center justify-between hover:bg-gray-800/50 transition cursor-pointer group ${
                    index !== myRepos.length - 1
                      ? "border-b border-gray-700"
                      : ""
                  }`}
                >
                  {/* LEFT */}
                  <div className="flex items-start gap-3 overflow-hidden">
                    <Folder
                      size={16}
                      className="text-gray-500 group-hover:text-blue-400 transition mt-1"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-200 truncate">
                        {folder.name}
                      </h4>
                      
                    </div>
                  </div>

                  {/* RIGHT ACTIONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enterWorkspace(folder);
                      }}
                      className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-xs px-3 py-1.5 rounded-md font-medium transition"
                    >
                      Open
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(e, folder.id);
                      }}
                      className="text-gray-500 hover:text-red-400 transition p-1 rounded hover:bg-gray-800"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">
                  No projects yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* INTEGRATIONS */}
          <div>
            <h2 className="text-xl font-bold text-white">
              Integrations
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Connect external data sources
            </p>

            <div className="mt-4 bg-[#1F2937] border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                  <Cloud size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200 text-sm">
                    Google Drive
                  </h4>
                  <p className="text-xs text-gray-500">
                    Sync your files
                  </p>
                </div>
              </div>
              <DriveToggle />
            </div>
          </div>

          {/* SHARED WITH ME */}
          <SharedWithMe
            sharedRepos={sharedRepos}
            onOpen={enterWorkspace}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
