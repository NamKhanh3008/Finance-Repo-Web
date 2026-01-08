import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = "http://127.0.0.1:5000/api/file";

const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
};

// We pass the rootId to the fetcher to make the cache key unique per project
const fetchProjectTree = async () => {
    const res = await axios.get(`${BASE_URL}/tree`, getAuthHeaders());
    // Backend returns a unified list of your projects + shared ones
    return Array.isArray(res.data) ? res.data : (res.data.folders || []);
};

export const useProjectTree = (projectRootId) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        // Unique key for this specific project's tree
        queryKey: ['projectTree', projectRootId], 
        queryFn: fetchProjectTree,
        staleTime: 1000 * 60, 
        enabled: !!localStorage.getItem("authToken") && !!projectRootId, 
    });

    const invalidate = () =>
+   queryClient.invalidateQueries(['projectTree', projectRootId]);
    // ... (Mutation logic stays the same)
    const createFolder = useMutation({
        mutationFn: ({ name, parentId }) => 
            axios.post(`${BASE_URL}/folder`, { name, parent_id: parentId }, getAuthHeaders()),
        onSuccess: invalidate
    });

    const createFile = useMutation({
        mutationFn: ({ name, parentId }) => 
            axios.post(`${BASE_URL}/`, { name, parent_id: parentId }, getAuthHeaders()),
        onSuccess: invalidate
    });

    const deleteNode = useMutation({
        mutationFn: ({ id, type }) => {
            const endpoint = type === 'folder' ? `${BASE_URL}/folder/${id}` : `${BASE_URL}/${id}`;
            return axios.delete(endpoint, getAuthHeaders());
        },
        onSuccess: invalidate
    });

    // --- FILTER LOGIC ---
    // Look for the specific folder we entered from the dashboard
    const allFolders = query.data || [];
    const activeProject = allFolders.find(f => f.id === projectRootId);

    // If we found the folder, that's our tree. Otherwise, empty.
    const finalTree = activeProject 
        ? { folders: [activeProject], files: [] } 
        : { folders: [], files: [] };

    return { 
        tree: finalTree, 
        isLoading: query.isLoading,
        createFolder, 
        createFile, 
        deleteNode 
    };
};