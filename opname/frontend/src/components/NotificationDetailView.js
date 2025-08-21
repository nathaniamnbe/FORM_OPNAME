"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dummyNotifications } from "../data/dummyData"; // Updated import

const NotificationDetailView = ({ onBack, selectedStore }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (selectedStore) {
      // Filter notifications for the selected store and only show pending for kontraktor
      const filtered = dummyNotifications.filter(
        (notif) =>
          notif.storeId === selectedStore.id &&
          (user?.role === "kontraktor" ? notif.status === "pending" : true) // PIC doesn't see pending here
      );
      setNotifications(filtered);
    }
  }, [selectedStore, user]);

  const handleApprove = (id) => {
    const updatedNotifications = dummyNotifications.map((notif) =>
      notif.id === id
        ? { ...notif, status: "approved", type: "opname_approved" }
        : notif
    );
    // Update dummy data for persistence (in a real app, this would be an API call)
    // For now, just update local state to reflect change
    setNotifications((prev) => prev.filter((notif) => notif.id !== id)); // Remove from pending list
    console.log(
      "Approved notification:",
      id,
      updatedNotifications.find((n) => n.id === id)
    );
  };

  const handleReject = (id) => {
    const updatedNotifications = dummyNotifications.map((notif) =>
      notif.id === id
        ? { ...notif, status: "rejected", type: "opname_rejected" }
        : notif
    );
    // Update dummy data for persistence
    setNotifications((prev) => prev.filter((notif) => notif.id !== id)); // Remove from pending list
    console.log(
      "Rejected notification:",
      id,
      updatedNotifications.find((n) => n.id === id)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "opname_approval":
        return "⏳";
      case "opname_approved":
        return "✅";
      case "opname_rejected":
        return "❌";
      default:
        return "📋";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "opname_approval":
        return "var(--alfamart-yellow)";
      case "opname_approved":
        return "#4CAF50";
      case "opname_rejected":
        return "#F44336";
      default:
        return "var(--gray-300)";
    }
  };

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            gap: "16px",
          }}
        >
          <button
            onClick={onBack}
            className="btn btn-outline"
            style={{ padding: "8px 16px" }}
          >
            ← Kembali ke Pilihan Toko
          </button>
          <h2 style={{ color: "var(--alfamart-red)" }}>
            Notifikasi Opname ({selectedStore?.name})
          </h2>
          <span
            style={{
              backgroundColor: "var(--alfamart-red)",
              color: "var(--white)",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {notifications.filter((n) => n.status === "pending").length}
          </span>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="card"
                style={{
                  border: `2px solid ${getNotificationColor(
                    notification.type
                  )}`,
                  backgroundColor:
                    notification.status === "pending"
                      ? "var(--alfamart-light-yellow)"
                      : "var(--white)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      minWidth: "40px",
                      textAlign: "center",
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        color: "var(--alfamart-red)",
                        marginBottom: "8px",
                        fontSize: "16px",
                      }}
                    >
                      {notification.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--gray-800)",
                        marginBottom: "8px",
                        lineHeight: "1.5",
                      }}
                    >
                      {notification.message}
                    </p>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--gray-600)",
                        marginBottom: "16px",
                      }}
                    >
                      {notification.date}
                    </div>

                    {notification.details && (
                      <div
                        style={{
                          backgroundColor: "var(--white)",
                          padding: "16px",
                          borderRadius: "8px",
                          marginBottom: "16px",
                          border: "1px solid var(--gray-300)",
                        }}
                      >
                        <h4
                          style={{
                            color: "var(--alfamart-red)",
                            marginBottom: "12px",
                            fontSize: "14px",
                          }}
                        >
                          Detail Opname:
                        </h4>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: "8px",
                            fontSize: "14px",
                          }}
                        >
                          <div>
                            <strong>PIC:</strong>{" "}
                            {notification.details.nama_pic_penginput}
                          </div>
                          <div>
                            <strong>Tanggal:</strong>{" "}
                            {notification.details.tanggal}
                          </div>
                          <div>
                            <strong>Jam:</strong> {notification.details.jam}
                          </div>
                          <div>
                            <strong>Kategori:</strong>{" "}
                            {notification.details.kategori_pekerjaan}
                          </div>
                          <div>
                            <strong>Jenis:</strong>{" "}
                            {notification.details.jenis_pekerjaan}
                          </div>
                          <div>
                            <strong>Vol RAB:</strong>{" "}
                            {notification.details.vol_rab}
                          </div>
                          <div>
                            <strong>Vol Akhir:</strong>{" "}
                            {notification.details.volume_akhir}
                          </div>
                          <div>
                            <strong>Selisih:</strong>
                            <span
                              style={{
                                color:
                                  notification.details.selisih < 0
                                    ? "#F44336"
                                    : "#4CAF50",
                                fontWeight: "bold",
                                marginLeft: "4px",
                              }}
                            >
                              {notification.details.selisih}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {notification.status === "pending" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => handleApprove(notification.id)}
                          className="btn btn-primary"
                          style={{ padding: "8px 16px", fontSize: "14px" }}
                        >
                          ✅ Setujui
                        </button>
                        <button
                          onClick={() => handleReject(notification.id)}
                          className="btn btn-outline"
                          style={{
                            padding: "8px 16px",
                            fontSize: "14px",
                            borderColor: "#F44336",
                            color: "#F44336",
                          }}
                        >
                          ❌ Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--gray-600)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <h3>Tidak ada notifikasi pending untuk toko ini.</h3>
              <p>Semua opname sudah disetujui atau ditolak.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailView;
