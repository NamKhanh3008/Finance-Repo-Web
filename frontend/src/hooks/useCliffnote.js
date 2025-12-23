import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000/api";

export function useCliffnote(fileId, readOnly) {
  const [cliffnote, setCliffnote] = useState("");
  const isHydratingRef = useRef(false);
  const lastSavedRef = useRef("");

  /* Reset on file change */
  useEffect(() => {
    if (!fileId) {
      setCliffnote("");
      lastSavedRef.current = "";
      return;
    }

    isHydratingRef.current = true;
    setCliffnote("");
  }, [fileId]);

  /* Hydrate from backend */
  useEffect(() => {
    if (!fileId) return;

    const fetchContent = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/file/content/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const content = res.data?.content ?? "";
        setCliffnote(content);
        lastSavedRef.current = content;
        isHydratingRef.current = false;
      } catch (err) {
        console.error("Failed to load cliffnote", err);
      }
    };

    fetchContent();
  }, [fileId]);

  /* Autosave */
  useEffect(() => {
    if (!fileId || readOnly) return;
    if (isHydratingRef.current) return;
    if (cliffnote === lastSavedRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        await axios.post(
          `${API_BASE}/file/content/${fileId}`,
          { content: cliffnote },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        lastSavedRef.current = cliffnote;
      } catch (err) {
        console.error("Failed to autosave cliffnote", err);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [cliffnote, fileId, readOnly]);

  return {
    cliffnote,
    setCliffnote,
  };
}
