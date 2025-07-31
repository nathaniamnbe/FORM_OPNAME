"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useAuth } from "../context/AuthContext";
import OpnameForm from "./OpnameForm";
import RabView from "./RabView";
import NotificationDetailView from "./NotificationDetailView";
import StoreSelectionPage from "./StoreSelectionPage";
import HistoryView from "./HistoryView";
import { dummyNotifications } from "../data/dummyData"; // Import dummy notifications

const Dashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedStore, setSelectedStore] = useState(null);

  // Calculate pending notifications count dynamically from dummy data
  const [pendingNotificationsCount, setPendingNotificationsCount] = useState(0);

  useEffect(() => {
    if (user?.role === "kontraktor") {
      const count = dummyNotifications.filter(
        (notif) => notif.status === "pending"
      ).length;
      setPendingNotificationsCount(count);
    }
  }, [user]);

  const handleSelectStore = (store, nextView) => {
    setSelectedStore(store);
    setActiveView(nextView);
  };

  const renderContent = () => {
    switch (activeView) {
      case "store-selection": // For PIC's opname input
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
            onBack={() => setActiveView("store-selection")}
            selectedStore={selectedStore}
          />
        );
      case "rab":
        return <RabView onBack={() => setActiveView("dashboard")} />;
      case "notification-store-selection": // For Kontraktor's notification
        return (
          <StoreSelectionPage
            onSelectStore={(store) =>
              handleSelectStore(store, "notification-detail")
            }
            onBack={() => setActiveView("dashboard")}
            type="notifications" // Pass type to StoreSelectionPage
            notificationsData={dummyNotifications} // Pass dummy notifications data
          />
        );
      case "notification-detail":
        return (
          <NotificationDetailView
            onBack={() => setActiveView("notification-store-selection")}
            selectedStore={selectedStore}
          />
        );
      case "history-store-selection": // For Kontraktor's history
        return (
          <StoreSelectionPage
            onSelectStore={(store) =>
              handleSelectStore(store, "history-detail")
            }
            onBack={() => setActiveView("dashboard")}
            type="history"
          />
        );
      case "history-detail":
        return (
          <HistoryView
            onBack={() => setActiveView("history-store-selection")}
            selectedStore={selectedStore}
          />
        );
      default:
        return (
          <div className="container" style={{ paddingTop: "40px" }}>
            <div className="card">
              <h2
                style={{
                  color: "var(--alfamart-red)",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                Selamat Datang, {user.name}!
              </h2>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--gray-600)",
                  marginBottom: "32px",
                }}
              >
                {user.role === "pic"
                  ? `PIC ${user.store}`
                  : `Kontraktor ${user.company}`}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginTop: "32px",
                }}
              >
                {user.role === "pic" && (
                  <>
                    <button
                      onClick={() => setActiveView("store-selection")}
                      className="btn btn-primary"
                      style={{
                        height: "120px",
                        flexDirection: "column",
                        fontSize: "18px",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>📝</span>
                      Input Opname Harian
                    </button>

                    <button
                      onClick={() => setActiveView("rab")}
                      className="btn btn-secondary"
                      style={{
                        height: "120px",
                        flexDirection: "column",
                        fontSize: "18px",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>📊</span>
                      Lihat RAB
                    </button>
                  </>
                )}

                {user.role === "kontraktor" && (
                  <>
                    <button
                      onClick={() =>
                        setActiveView("notification-store-selection")
                      }
                      className="btn btn-info" /* Changed to btn-info */
                      style={{
                        height: "120px",
                        flexDirection: "column",
                        fontSize: "18px",
                        gap: "12px",
                        position: "relative", // Ensure badge positioning
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>🔔</span>
                      Notifikasi
                      {pendingNotificationsCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "var(--alfamart-red)",
                            color: "var(--white)",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                          }}
                        >
                          {pendingNotificationsCount}
                        </span>
                      )}
                      <div
                        style={{
                          fontSize: "12px",
                          opacity: "0.8",
                          marginTop: "4px",
                        }}
                      >
                        Pending Approval
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveView("history-store-selection")}
                      className="btn btn-secondary"
                      style={{
                        height: "120px",
                        flexDirection: "column",
                        fontSize: "18px",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>📜</span>
                      Histori Opname
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginTop: "32px",
              }}
            >
              {user.role === "kontraktor" ? (
                <>
                  <div className="card" style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--alfamart-red)" }}>
                      Pending Approval
                    </h3>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginTop: "8px",
                        color: "var(--alfamart-yellow)",
                      }}
                    >
                      {pendingNotificationsCount}
                    </div>
                  </div>

                  <div className="card" style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--alfamart-red)" }}>Total RAB</h3>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginTop: "8px",
                      }}
                    >
                      8
                    </div>
                  </div>
                  <div className="card" style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--alfamart-red)" }}>
                      Opname Disetujui
                    </h3>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginTop: "8px",
                        color: "#4CAF50",
                      }}
                    >
                      5
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="card" style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--alfamart-red)" }}>
                      Opname Bulan Ini
                    </h3>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginTop: "8px",
                      }}
                    >
                      12
                    </div>
                  </div>
                  <div className="card" style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--alfamart-red)" }}>
                      Opname Disetujui
                    </h3>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginTop: "8px",
                        color: "#4CAF50",
                      }}
                    >
                      9
                    </div>
                  </div>

                  <div className="card" style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--alfamart-red)" }}>Total RAB</h3>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginTop: "8px",
                      }}
                    >
                      8
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
    }
  };

  return <div>{renderContent()}</div>;
};

export default Dashboard;
