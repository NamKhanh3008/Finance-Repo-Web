import { GitFork } from "lucide-react";
import { useForkProject } from "../../hooks/useForkProjects"; // import the hook

export function SharedWithMe({ sharedRepos = [], onOpen, onNewProject }) {
  const { forkProject, loadingId } = useForkProject();

  const handleFork = async (folderId) => {
    const newProject = await forkProject(folderId);
    if (newProject) {
      onNewProject && onNewProject(newProject);
      onOpen && onOpen(newProject);
    }
  };

  if (!sharedRepos.length) {
    return (
      <div className="mt-4 bg-[#1F2937] border border-dashed border-gray-700 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-500">No shared projects yet</p>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-[#1F2937] border border-gray-700 rounded-xl overflow-hidden">
      {sharedRepos.map((item, index) => (
        <div
          key={item.id}
          onClick={() => onOpen && onOpen(item)}
          className={`p-4 flex items-center justify-between hover:bg-gray-800/50 transition cursor-pointer group ${
            index !== sharedRepos.length - 1 ? "border-b border-gray-700" : ""
          }`}
        >
          <div className="flex items-start gap-3 overflow-hidden">
            <GitFork
              size={16}
              className="text-gray-500 group-hover:text-blue-400 transition mt-1"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-gray-200 truncate">
                {item.name}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {item.desc || "Shared project"}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFork(item.id);
            }}
            className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-xs px-3 py-1.5 rounded-md font-medium transition"
            disabled={loadingId === item.id}
          >
            {loadingId === item.id ? "Forking..." : "Fork"}
          </button>
        </div>
      ))}
    </div>
  );
}
