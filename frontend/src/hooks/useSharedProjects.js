import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/file";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const useSharedProjects = () => {
  return useQuery({
    queryKey: ["sharedProjects"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/shared`, getAuthHeaders());

      console.log("Shared Projects Response:", res.data); // 🔥 LOG HERE

      return Array.isArray(res.data) ? res.data : [];
    },
    initialData: [],
    enabled: !!localStorage.getItem("authToken"),
  });
};


