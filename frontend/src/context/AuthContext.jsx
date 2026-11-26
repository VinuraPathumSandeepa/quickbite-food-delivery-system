import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { clearSession, isValidUser, readStoredSession, saveSession } from "./session";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const session = readStoredSession();
      if (!session) {
        if (active) { setCurrentUser(null); setAuthReady(true); }
        return;
      }
      try {
        const response = await api.get("/auth/me");
        if (!isValidUser(response.data) || response.data.id !== session.user.id ||
            response.data.role !== session.user.role) throw new Error("Session changed");
        if (active) setCurrentUser(response.data);
      } catch {
        clearSession();
        if (active) setCurrentUser(null);
      } finally {
        if (active) setAuthReady(true);
      }
    };
    const expire = () => { setCurrentUser(null); setAuthReady(true); };
    const pageShow = (event) => { if (event.persisted) void restore(); };
    window.addEventListener("quickbite:session-expired", expire);
    window.addEventListener("pageshow", pageShow);
    void restore();
    return () => {
      active = false;
      window.removeEventListener("quickbite:session-expired", expire);
      window.removeEventListener("pageshow", pageShow);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return undefined;
    const session = readStoredSession();
    if (!session) return undefined;
    const timer = window.setTimeout(() => {
      clearSession();
      setCurrentUser(null);
    }, Math.max(0, Date.parse(session.expiresAt) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [currentUser]);

  const registerUser = async (formData) => (await api.post("/auth/register", formData)).data;

  const loginUser = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const user = saveSession(response.data);
    setCurrentUser(user);
    setAuthReady(true);
    return user;
  };

  const updateCurrentUser = (updatedUser) => {
    const session = readStoredSession();
    if (!session || !isValidUser(updatedUser)) return;
    const user = { ...session.user, ...updatedUser };
    if (!isValidUser(user) || user.id !== session.user.id || user.role !== session.user.role) return;
    window.sessionStorage.setItem("quickbiteSession", JSON.stringify({ ...session, user }));
    setCurrentUser(user);
  };

  const logoutUser = () => { clearSession(); setCurrentUser(null); };

  return (
    <AuthContext.Provider value={{ currentUser, authReady, registerUser, loginUser,
      updateCurrentUser, logoutUser, isLoggedIn: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { return useContext(AuthContext); }
