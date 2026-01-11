import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function useForkProject() {
  const [loadingId, setLoadingId] = useState(null);
  const token = localStorage.getItem("authToken");

  const forkProject = async (folderId) => {
    if (!token) return null;
    setLoadingId(folderId);

    try {
      const response = await axios.post(
        `${API_BASE}/fork/${folderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      console.error(err.response?.data?.error || "Failed to fork project");
      return null;
    } finally {
      setLoadingId(null);
    }
  };

  return { forkProject, loadingId };
}
