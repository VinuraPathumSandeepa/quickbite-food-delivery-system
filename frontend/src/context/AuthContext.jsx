import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { readStoredUser } from "./session";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  useEffect(() => {
    const restoreSession = (event) => {
      if (event.persisted) setCurrentUser(readStoredUser());
    };
    const syncStorage = (event) => {
      if (event.key === "foodUser") setCurrentUser(readStoredUser());
    };

    window.addEventListener("pageshow", restoreSession);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener("pageshow", restoreSession);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  const registerUser = async (formData) => {
    const response = await api.post("/auth/register", formData);
    return response.data;
  };

  const loginUser = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const userData = response.data;

    localStorage.setItem("foodUser", JSON.stringify(userData));
    setCurrentUser(userData);

    return userData;
  };

  const updateCurrentUser = (updatedUser) => {
    const newUserData = {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      vehicleType: updatedUser.vehicleType,
      vehicleNumber: updatedUser.vehicleNumber,
      message: "Profile updated",
    };

    localStorage.setItem("foodUser", JSON.stringify(newUserData));
    setCurrentUser(newUserData);
  };

  const logoutUser = () => {
    localStorage.removeItem("foodUser");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        registerUser,
        loginUser,
        updateCurrentUser,
        logoutUser,
        isLoggedIn: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
