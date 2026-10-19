import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFarmer: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear any legacy persistent storage so previously logged in user (e.g. muthu.farmer@gmail.com)
  // does not persist across closing and reopening the website
  const [token, setToken] = useState<string | null>(() => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return sessionStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    try {
      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user", JSON.stringify(newUser));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      console.warn("Could not save session:", e);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      console.warn("Could not clear session:", e);
    }
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (e) {
      console.warn("Could not update session:", e);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "ADMIN";
  const isFarmer = user?.role === "FARMER";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: false,
        isAuthenticated,
        isAdmin,
        isFarmer,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
