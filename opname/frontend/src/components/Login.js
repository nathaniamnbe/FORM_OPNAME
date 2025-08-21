"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import alfaLogo from "../images/Alfamart-Emblem.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(username, password);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F2F2F2",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src={alfaLogo} // ⬅️ Gunakan hasil import
            alt="Alfamart"
            style={{ height: "40px" }}
          />
          <h2 style={{ color: "black", marginBottom: "8px" }}>
            Sistem Opname Alfamart
          </h2>
          <p style={{ color: "var(--gray-600)" }}>
            Silakan login untuk melanjutkan
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "16px" }}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default Login;
