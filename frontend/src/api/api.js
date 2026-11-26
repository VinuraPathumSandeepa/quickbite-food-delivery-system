import axios from "axios";
import { clearSession, getAuthorizationHeader } from "../context/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const authorization = getAuthorizationHeader();
  if (authorization) config.headers.Authorization = authorization;
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 &&
      !/\/auth\/(login|register)$/.test(error.config?.url ?? "")) {
    clearSession();
    window.dispatchEvent(new Event("quickbite:session-expired"));
  }
  return Promise.reject(error);
});

export default api;
