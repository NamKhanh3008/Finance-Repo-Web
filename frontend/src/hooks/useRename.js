import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("authToken");

export const useRenameNode = (projectRootId) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries(['projectTree', projectRootId]);

  const renameFile = useMutation({
    mutationFn: ({ id, name }) => {
      const token = getToken();
      return axios.put(
        `${API_BASE}/file/${id}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: invalidate
  });

  const renameFolder = useMutation({
    mutationFn: ({ id, name }) => {
      const token = getToken();
      return axios.put(
        `${API_BASE}/folder/${id}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: invalidate
  });

  return { renameFile, renameFolder };
};
