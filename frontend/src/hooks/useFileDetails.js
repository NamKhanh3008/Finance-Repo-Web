import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useFileDetails = (fileId) => {
  return useQuery({
    queryKey: ["fileDetails", fileId],
    queryFn: async () => {
      if (!fileId) return null;

      const [contentRes, notesRes] = await Promise.all([
        axios.get(`${BASE_URL}/file/content/${fileId}`, getAuthHeaders()),
        axios.get(`${BASE_URL}/annotation/${fileId}`, getAuthHeaders()),
      ]);

      const normalizedAnnotations = notesRes.data.map((note) => ({
        ...note,

        // 🔑 Coordinate normalization (THE FIX)
        x: note.x ?? note.x_position,
        y: note.y ?? note.y_position,
        width: note.width,
        height: note.height,

        // 🔑 Content normalization
        content: note.content ?? note.text ?? "",
      }));

      return {
        content: contentRes.data.content,
        annotations: normalizedAnnotations,
      };
    },
    enabled: !!fileId && !!localStorage.getItem("authToken"),
  });
};
