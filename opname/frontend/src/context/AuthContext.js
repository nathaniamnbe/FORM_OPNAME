// src/context/AuthContext.js

"use client";

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // 1. Saat dimuat, baca data user dari sessionStorage.
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("user"); // <-- GANTI KE sessionStorage
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Gagal parse user dari sessionStorage", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
    const apiUrl = process.env.REACT_APP_API_URL;
    const response = await fetch(`${apiUrl}/api/login`, {
      method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});

      if (response.ok) {
        const foundUser = await response.json();

        // 2. Simpan user ke state DAN sessionStorage.
        setUser(foundUser);
        sessionStorage.setItem("user", JSON.stringify(foundUser)); // <-- GANTI KE sessionStorage

        return { success: true };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Username atau password salah",
        };
      }
    } catch (error) {
      console.error("Error saat fetch ke API login:", error);
      return { success: false, message: "Tidak dapat terhubung ke server." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // 3. Hapus user dari state DAN sessionStorage.
    setUser(null);
    sessionStorage.removeItem("user"); // <-- GANTI KE sessionStorage
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
