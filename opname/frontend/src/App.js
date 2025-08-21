// src/App.js

import React from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header"; // 1. IMPORT KOMPONEN HEADER
import "./styles/theme.css";

function App() {
  const { user } = useAuth();

  // Kita tidak perlu menampilkan loading di sini jika sudah ditangani di context
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // src/App.js

  return (
    <div className="App">
      {user ? (
        // Tampilkan ini jika user ADA
        <>
          <Header />
          <Dashboard />
        </>
      ) : (
        // Tampilkan ini jika user TIDAK ADA (null)
        <Login />
      )}
    </div>
  );
}

export default App;
