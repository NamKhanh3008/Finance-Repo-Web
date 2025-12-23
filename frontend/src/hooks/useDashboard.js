import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from "axios";
import { clearPDFCache } from "../Services/cacheService";

const BASE_URL = "http://127.0.0.1:5000/api/file";

export const useDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = localStorage.getItem("authToken");

    // --- 1. FETCH PROJECTS ---
    const { data: myRepos = [], isLoading } = useQuery({
        queryKey: ['dashboardProjects'],
        queryFn: async () => {
            const res = await axios.get(`${BASE_URL}/tree`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // 1. Normalize the data to ensure we have an array
            let allProjects = [];
            
            if (res.data && res.data.folders) {
                allProjects = res.data.folders;
            } else if (Array.isArray(res.data)) {
                allProjects = res.data;
            }

            // 2. FILTER: Only keep projects that are NOT shared
            // This ensures "My Projects" only shows what you own.
            const ownedProjects = allProjects.filter(project => !project.is_shared);

            return ownedProjects;
        },
        enabled: !!token,
    });

    // --- 2. CREATE PROJECT ---
    const createProject = useMutation({
        mutationFn: async (name) => {
            return axios.post(`${BASE_URL}/folder`, 
                { name, parent_id: null }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => queryClient.invalidateQueries(['dashboardProjects'])
    });

    // --- 3. DELETE PROJECT ---
    const deleteProject = useMutation({
        mutationFn: async (folderId) => {
            return axios.delete(`${BASE_URL}/folder/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['dashboardProjects'])
    });

    // --- 4. ACTIONS ---
    const handleCreateProject = async () => {
        const name = prompt("Enter Project Name:");
        if (name) createProject.mutate(name);
    };

    const handleDeleteProject = async (e, folderId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure?")) deleteProject.mutate(folderId);
    };

    const enterWorkspace = (folder) => {
        const userRole = folder.is_shared ? folder.permission_role : 'OWNER';
        
        navigate("/workspace", { 
            state: { 
                projectRoot: folder,
                role: userRole 
            } 
        });
    };

    const logout = async () => {
        await clearPDFCache();
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return {
        myRepos,
        isLoading,
        handleCreateProject,
        handleDeleteProject,
        enterWorkspace,
        logout,
        navigate 
    };
};