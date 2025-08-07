"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mengecek apakah user sudah login dari session sebelumnya
    try {
      const savedUser = localStorage.getItem("alfamart_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Gagal memuat data user dari localStorage", error);
      localStorage.removeItem("alfamart_user");
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const foundUser = await response.json();
        setUser(foundUser);
        localStorage.setItem("alfamart_user", JSON.stringify(foundUser));
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
      return {
        success: false,
        message: "Tidak dapat terhubung ke server. Cek koneksi internet Anda.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("alfamart_user");
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
