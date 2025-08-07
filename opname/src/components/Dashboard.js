// src/components/Dashboard.js - Versi Final tanpa Header Duplikat

"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import OpnameForm from "./OpnameForm";
import StoreSelectionPage from "./StoreSelectionPage";
import FinalOpnameView from "./FinalOpnameView";
import ApprovalPage from "./ApprovalPage";

const Dashboard = () => {
  // Hook useAuth sekarang hanya mengambil 'user', karena 'logout' akan ada di header utama
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedStore, setSelectedStore] = useState(null);

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

  // Fungsi renderContent tidak berubah, hanya akan dipanggil di dalam return utama
  const renderContent = () => {
    switch (activeView) {
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

      default:
        return (
          <div className="container" style={{ paddingTop: "40px" }}>
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

  // Return sekarang HANYA merender konten utama, tanpa <header> atau <main>
  return renderContent();
};

export default Dashboard;
