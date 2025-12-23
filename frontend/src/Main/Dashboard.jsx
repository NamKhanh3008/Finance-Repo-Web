import React from "react";
import { Folder, GitFork, LogOut, Plus, ArrowRight, Trash2, Cloud } from "lucide-react";
import { DriveToggle } from "../Components/DriveToggle";
import { useDashboard } from "../hooks/useDashboard"; // <--- Import the new hook
import { SharedWithMe } from "../Components/dashboard/SharedWithMe";
import { useSharedProjects } from "../hooks/useSharedProjects";


function Dashboard() {
  // Use the hook to get logic
  const { 
    myRepos, 
    handleCreateProject, 
    handleDeleteProject, 
    enterWorkspace, 
    logout 
  } = useDashboard();

  // Mock Data (Static)
  
  const { data: sharedRepos = [] } = useSharedProjects();

  return (
    <div className="min-h-screen bg-[#111827] text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-[#111827] px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">F</div>
          <span className="text-xl font-bold tracking-tight">FinanceRepo</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
             ME
           </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-400 transition" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* GRID */}
      <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PROJECTS */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-white">My Projects</h2>
                <p className="text-gray-400 text-sm mt-1">Select a project to enter your workspace</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* NEW PROJECT CARD */}
            <div
                className="border border-dashed border-gray-700 bg-transparent rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 cursor-pointer transition group h-[180px]"
                onClick={handleCreateProject}
            >
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition">
                    <Plus size={20} />
                </div>
                <span className="font-medium">New Project</span>
            </div>

            {/* PROJECT CARDS */}
            {myRepos.length > 0 ? (
                myRepos.map((folder) => (
                    <div key={folder.id} className="bg-[#1F2937] border border-gray-700 rounded-xl p-5 flex flex-col justify-between hover:border-gray-500 transition shadow-sm h-[180px] group relative">
                        
                        {/* DELETE BUTTON */}
                        <button
                            onClick={(e) => handleDeleteProject(e, folder.id)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100 z-10 p-1 rounded hover:bg-gray-800"
                            title="Delete Project"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="bg-blue-900/30 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-900/50 uppercase tracking-wider">
                                    Project
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Folder className="text-blue-500" size={20} />
                                <h3 className="font-bold text-lg text-white leading-tight truncate pr-8">{folder.name}</h3>
                            </div>
                            <p className="text-gray-400 text-xs mt-2 line-clamp-2">
                                Financial analysis workspace.
                            </p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-[10px] text-gray-500">Workspace Ready</span>
                            <button
                                onClick={() => enterWorkspace(folder)}
                                className="bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-blue-900/20 flex items-center gap-2"
                            >
                                Open <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                /* FALLBACK */
                <div className="bg-[#1F2937] border border-dashed border-gray-700 rounded-xl p-5 flex flex-col justify-center items-center h-[180px] text-center">
                    <div>
                         <h3 className="font-bold text-lg text-white">No Projects Yet</h3>
                         <p className="text-gray-400 text-xs mt-2 mb-4">Create your first workspace to start.</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INTEGRATIONS & SHARED */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
            
            {/* INTEGRATIONS */}
            <div>
                <h2 className="text-xl font-bold text-white">Integrations</h2>
                <p className="text-gray-400 text-sm mt-1">Connect external data sources</p>
                
                <div className="mt-4 bg-[#1F2937] border border-gray-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                             <Cloud size={20} />
                         </div>
                         <div>
                             <h4 className="font-semibold text-gray-200 text-sm">Google Drive</h4>
                             <p className="text-xs text-gray-500">Sync your files</p>
                         </div>
                    </div>
                    <DriveToggle />
                </div>
            </div>
            
            {/* SHARED WITH ME */}
                <SharedWithMe
                    sharedRepos={sharedRepos}
                    onFork={(id) => console.log("Fork project", id)}
                    onOpen={enterWorkspace} // <-- pass the function
                />


        </div>

      </div>
    </div>
  );
}

export default Dashboard;