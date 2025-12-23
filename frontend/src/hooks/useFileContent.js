import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = "http://127.0.0.1:5000/api/file"; 

const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const useFileContent = (fileId) => {
    return useQuery({
        queryKey: ['fileContent', fileId],
        queryFn: async () => {
            if (!fileId) return null;
            
            // Fetch as a BLOB (Binary Large Object)
            const res = await axios.get(`${BASE_URL}/stream/${fileId}`, { 
                ...getAuthHeaders(),
                responseType: 'blob' 
            });
            return res.data;
        },
        // --- CACHING SETTINGS ---
        enabled: !!fileId,       
        staleTime: Infinity,      // Keep data "fresh" forever until reload
        cacheTime: 1000 * 60 * 30, // Keep in memory for 30 mins even if unused
        refetchOnWindowFocus: false, 
        retry: false
    });
};