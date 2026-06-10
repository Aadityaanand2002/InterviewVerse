import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },
  endSession: async ({ id, data }) => {
    const res = await axiosInstance.post(`/sessions/${id}/end`, data);
    return res.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
  updateSessionProblem: async (id, data) => {
    const response = await axiosInstance.put(`/sessions/${id}/problem`, data);
    return response.data;
  },
  updateSessionNotes: async (id, data) => {
    const response = await axiosInstance.put(`/sessions/${id}/notes`, data);
    return response.data;
  },
  askToJoin: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/ask`);
    return response.data;
  },
  admitParticipant: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/admit`);
    return response.data;
  },
  denyParticipant: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/deny`);
    return response.data;
  },
};
