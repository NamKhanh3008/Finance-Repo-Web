// hooks/useFileUpload.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/file";

export const useFileUpload = (fileId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      if (!file || !fileId) {
        throw new Error("Missing file or fileId");
      }

      const formData = new FormData();
      formData.append("file", file); // MUST be "file"

      return axios.post(
        `${BASE_URL}/upload/${fileId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            // ❗ DO NOT set Content-Type
          },
        }
      );
    },

    onSuccess: () => {
      // 🔄 Refresh file metadata + stream
      queryClient.invalidateQueries(["fileDetails", fileId]);
      queryClient.invalidateQueries(["fileContent", fileId]);
    },

    onError: (err) => {
      console.error("File upload failed:", err?.response?.data || err);
    },
  });
};
