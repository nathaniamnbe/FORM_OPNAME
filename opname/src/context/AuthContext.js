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

  // Simulasi data user (nanti bisa diganti dengan API)
  const users = [
    {
      id: 1,
      username: "pic001",
      password: "pic123",
      name: "Ahmad Sutanto",
      role: "pic",
      store: "Alfamart Sudirman",
    },
    {
      id: 2,
      username: "kontraktor001",
      password: "kontraktor123",
      name: "Budi Santoso",
      role: "kontraktor",
      company: "PT Konstruksi Jaya",
    },
  ];

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("alfamart_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      localStorage.setItem(
        "alfamart_user",
        JSON.stringify(userWithoutPassword)
      );
      return { success: true };
    }

    return { success: false, message: "Username atau password salah" };
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
