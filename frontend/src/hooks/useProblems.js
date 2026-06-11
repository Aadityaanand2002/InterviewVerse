import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useProblems = () => {
  return useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const res = await axiosInstance.get("/problems");
      return res.data;
    },
  });
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/problems", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["problems"]);
      toast.success("Problem created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create problem");
    },
  });
};

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.put(`/problems/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["problems"]);
      toast.success("Problem updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update problem");
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/problems/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["problems"]);
      toast.success("Problem deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete problem");
    },
  });
};
export const useImportLeetCode = () => {
  return useMutation({
    mutationFn: async (slug) => {
      const res = await axiosInstance.post("/import/leetcode", { slug });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Problem imported successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to import problem");
    },
  });
};
