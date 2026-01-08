import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const getToken = () => localStorage.getItem("authToken");

export const useRenameNode = (projectRootId) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries(['projectTree', projectRootId]);

  const renameFile = useMutation({
    mutationFn: ({ id, name }) => {
      const token = getToken();
      return axios.put(
        `http://127.0.0.1:5000/api/file/${id}`,
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
        `http://127.0.0.1:5000/api/folder/${id}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: invalidate
  });

  return { renameFile, renameFolder };
};
