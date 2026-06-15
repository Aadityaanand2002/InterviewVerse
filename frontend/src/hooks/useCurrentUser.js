import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useUser as useClerkUser } from "@clerk/clerk-react";

export const useCurrentUser = () => {
  const { isSignedIn } = useClerkUser();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/me");
      return res.data.user;
    },
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
