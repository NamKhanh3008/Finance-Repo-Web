import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function useShareProject(projectId, isOpen) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShares = useCallback(async () => {
    if (!projectId || !isOpen) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${API_BASE}/file/share/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔒 HARD GUARANTEE: shares is always an array
      setShares(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch shares failed:", err);
      setShares([]);
      setError("Failed to load shared users");
    } finally {
      setLoading(false);
    }
  }, [projectId, isOpen]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const shareProject = async (email, role = "VIEWER") => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE}/file/share/${projectId}`,
        { email, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh collaborators list
      await fetchShares();

      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.msg ||
        "Share failed";

      console.error("Share project failed:", err);
      setError(msg);

      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    shares,     // always []
    loading,
    error,
    shareProject,
  };
}
