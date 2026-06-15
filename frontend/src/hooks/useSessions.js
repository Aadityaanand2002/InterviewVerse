import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => {
      toast.success("Session created successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create room"),
  });

  return result;
};

export const useActiveSessions = () => {
  const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

  return result;
};

export const useSessionById = (id) => {
  const result = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 3000, // refetch every 3 seconds to detect session status changes & waiting participants
  });

  return result;
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => {
      toast.success("Joined session successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to join session"),
  });

  return result;
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: ({ id, data }) => sessionApi.endSession({ id, data }),
    onSuccess: () => {
      toast.success("Session ended successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to end session"),
  });

  return result;
};

export const useUpdateSessionProblem = () => {
  const result = useMutation({
    mutationKey: ["updateSessionProblem"],
    mutationFn: ({ id, data }) => sessionApi.updateSessionProblem(id, data),
    onSuccess: () => toast.success("Problem updated successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update problem"),
  });

  return result;
};

export const useUpdateSessionNotes = () => {
  const result = useMutation({
    mutationKey: ["updateSessionNotes"],
    mutationFn: ({ id, data }) => sessionApi.updateSessionNotes(id, data),
    onSuccess: () => toast.success("Notes saved!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to save notes"),
  });

  return result;
};

export const useAskToJoin = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["askToJoin"],
    mutationFn: sessionApi.askToJoin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to ask to join"),
  });

  return result;
};

export const useAdmitParticipant = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["admitParticipant"],
    mutationFn: sessionApi.admitParticipant,
    onSuccess: () => {
      toast.success("Participant admitted!");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to admit participant"),
  });

  return result;
};

export const useDenyParticipant = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["denyParticipant"],
    mutationFn: sessionApi.denyParticipant,
    onSuccess: () => {
      toast.success("Participant denied!");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to deny participant"),
  });

  return result;
};

export const useUpdateSessionScore = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["updateSessionScore"],
    mutationFn: ({ id, data }) => sessionApi.updateSessionScore(id, data),
    onSuccess: () => {
      toast.success("Score saved!");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to save score"),
  });

  return result;
};

export const useAddTimelineEvent = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["addTimelineEvent"],
    mutationFn: ({ id, data }) => sessionApi.addTimelineEvent(id, data),
    onSuccess: () => {
      // Opt not to show toast to avoid spamming the user during tab switches
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => console.error(error.response?.data?.message || "Failed to add timeline event"),
  });

  return result;
};

export const useAddCodeSnapshot = () => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationKey: ["addCodeSnapshot"],
    mutationFn: ({ id, data }) => sessionApi.addCodeSnapshot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => console.error(error.response?.data?.message || "Failed to add code snapshot"),
  });

  return result;
};
