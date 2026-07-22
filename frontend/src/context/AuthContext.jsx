import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("foodUser");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
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