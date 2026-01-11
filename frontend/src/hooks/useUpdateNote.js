import { useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function useUpdateNote({ readOnly }) {
  const timeoutRef = useRef(null);

  const updateNote = (noteId, content) => {
    if (readOnly || !noteId) return;

    // debounce
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        await axios.put(
          `${API_BASE}/annotation/${noteId}`,
          { content },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
      } catch (err) {
        console.error("Failed to update note", err);
      }
    }, 300);
  };

  return updateNote;
}
