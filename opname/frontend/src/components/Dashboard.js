// src/components/Dashboard.js - Versi Final tanpa Header Duplikat

"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import OpnameForm from "./OpnameForm";
import StoreSelectionPage from "./StoreSelectionPage";
import FinalOpnameView from "./FinalOpnameView";
import ApprovalPage from "./ApprovalPage";

const Dashboard = () => {
  // Hook useAuth hanya mengambil 'user', karena logout diasumsikan ada di header utama
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedStore, setSelectedStore] = useState(null);

  // Tampilkan loading jika data user belum siap
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Loading data pengguna...</h2>
      </div>
    );
  }

  const handleSelectStore = (store, nextView) => {
    setSelectedStore(store);
    setActiveView(nextView);
  };

  // Fungsi untuk merender konten berdasarkan 'activeView'
  const renderContent = () => {
    switch (activeView) {
      // --- Rute untuk Peran PIC ---
      case "store-selection-pic":
        return (
          <StoreSelectionPage
            onSelectStore={(store) => handleSelectStore(store, "opname")}
            onBack={() => setActiveView("dashboard")}
            type="opname"
          />
        );

      case "opname":
        return (
          <OpnameForm
            onBack={() => setActiveView("store-selection-pic")}
            selectedStore={selectedStore}
          />
        );

      case "final-opname-selection":
        return (
          <StoreSelectionPage
            onSelectStore={(store) =>
              handleSelectStore(store, "final-opname-detail")
            }
            onBack={() => setActiveView("dashboard")}
            type="opname"
          />
        );

      case "final-opname-detail":
        return (
          <FinalOpnameView
            onBack={() => setActiveView("final-opname-selection")}
            selectedStore={selectedStore}
          />
        );

      // --- Rute untuk Peran Kontraktor ---
      case "store-selection-kontraktor":
        return (
          <StoreSelectionPage
            onSelectStore={(store) =>
              handleSelectStore(store, "approval-detail")
            }
            onBack={() => setActiveView("dashboard")}
            type="approval"
          />
        );

      case "approval-detail":
        return (
          <ApprovalPage
            onBack={() => setActiveView("store-selection-kontraktor")}
            selectedStore={selectedStore}
          />
        );

      case "history-selection-kontraktor":
        return (
          <StoreSelectionPage
            onSelectStore={(store) =>
              handleSelectStore(store, "history-detail-kontraktor")
            }
            onBack={() => setActiveView("dashboard")}
            type="approval"
          />
        );

      case "history-detail-kontraktor":
        return (
          <FinalOpnameView
            onBack={() => setActiveView("history-selection-kontraktor")}
            selectedStore={selectedStore}
          />
        );

      // Halaman utama Dashboard
      default:
        return (
          <div
            className="container"
            style={{ paddingTop: "40px", maxWidth: "900px" }}
          >
            <div className="card">
              <h2 style={{ color: "var(--alfamart-red)", textAlign: "center" }}>
                Selamat Datang, {user.name}!
              </h2>
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  marginBottom: "32px",
                }}
              >
                {user.role === "pic"
                  ? `PIC: ${user.store}`
                  : `Kontraktor: ${user.company}`}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* Tombol untuk PIC */}
                {user.role === "pic" && (
                  <>
                    <button
                      onClick={() => setActiveView("store-selection-pic")}
                      className="btn btn-primary"
                      style={{
                        height: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>📝</span>
                      Input Opname Harian
                    </button>
                    <button
                      onClick={() => setActiveView("final-opname-selection")}
                      className="btn btn-success"
                      style={{
                        height: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>📄</span>
                      Lihat Opname Final
                    </button>
                  </>
                )}

                {/* Tombol untuk Kontraktor */}
                {user.role === "kontraktor" && (
                  <>
                    <button
                      onClick={() =>
                        setActiveView("store-selection-kontraktor")
                      }
                      className="btn btn-info"
                      style={{
                        height: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>🔔</span>
                      Persetujuan Opname
                    </button>
                    <button
                      onClick={() =>
                        setActiveView("history-selection-kontraktor")
                      }
                      className="btn btn-secondary"
                      style={{
                        height: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>📜</span>
                      Histori Opname
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  // Komponen ini HANYA merender konten, tidak lagi menyertakan <header>
  return renderContent();
};

export default Dashboard;
