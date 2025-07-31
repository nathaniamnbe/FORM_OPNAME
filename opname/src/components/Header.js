"use client";
import { useAuth } from "../context/AuthContext";
import alfaLogo from "../images/Alfamart-Emblem.png";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        backgroundColor: "var(--alfamart-red)",
        color: "var(--white)",
        padding: "12px 0",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="container">
        {/* Desktop Layout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
          className="desktop-header"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              src={alfaLogo} // ⬅️ Gunakan hasil import
              alt="Alfamart"
              style={{ height: "40px" }}
            />
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
              Sistem Opname
            </h1>
          </div>

          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "12px", opacity: "0.9" }}>
                  {user.role === "pic" ? user.store : user.company}
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{
                  borderColor: "var(--white)",
                  color: "var(--white)",
                  padding: "6px 12px",
                  fontSize: "12px",
                  minWidth: "auto",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="mobile-header" style={{ display: "none" }}>
          {/* Top Row: Logo + Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <img
              src={alfaLogo} // ⬅️ Gunakan hasil import
              alt="Alfamart"
              style={{ height: "40px" }}
            />
            <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
              Sistem Opname
            </h1>
          </div>

          {/* Bottom Row: User Info + Logout */}
          {user && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    marginBottom: "2px",
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: "11px", opacity: "0.9" }}>
                  {user.role === "pic" ? user.store : user.company}
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{
                  borderColor: "var(--white)",
                  color: "var(--white)",
                  padding: "6px 12px",
                  fontSize: "11px",
                  minWidth: "60px",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
