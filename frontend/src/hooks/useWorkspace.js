import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearPDFCache } from "../Services/cacheService";

export const useWorkspace = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- 1. SESSION RECOVERY ---
    const [projectRoot, setProjectRoot] = useState(() => {
        const navState = location.state?.projectRoot;
        const savedState = localStorage.getItem("activeProject");
        return navState || (savedState ? JSON.parse(savedState) : null);
    });

    // --- 2. PERMISSION LOGIC ---
    // A professional "Computed Property"
    // We are read-only if the role is explicitly 'VIEWER'
    const isReadOnly = projectRoot?.permission_role === 'VIEWER';

    useEffect(() => {
        if (projectRoot) {
            localStorage.setItem("activeProject", JSON.stringify(projectRoot));
        }
    }, [projectRoot]);

    // --- 3. TAB MANAGEMENT STATE ---
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);

    const activeFile = openFiles.find(f => f.id === activeFileId);

    // --- 4. ACTIONS ---
    const openFile = (file) => {
        if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles(prev => [...prev, file]);
        }
        setActiveFileId(file.id);
    };

    const closeTab = (fileId) => {
        const newFiles = openFiles.filter(f => f.id !== fileId);
        setOpenFiles(newFiles);
        if (activeFileId === fileId) {
            if (newFiles.length > 0) {
                setActiveFileId(newFiles[newFiles.length - 1].id);
            } else {
                setActiveFileId(null);
            }
        }
    };

    const logout = async () => {
        await clearPDFCache();
        localStorage.removeItem("authToken");
        localStorage.removeItem("activeProject");
        navigate("/login");
    };

    return {
        projectRoot,
        isReadOnly, // <--- Exported to the UI
        openFiles,
        activeFileId,
        activeFile,
        setActiveFileId,
        openFile,
        closeTab,
        logout,
        navigate 
    };
};