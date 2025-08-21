"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NotificationPanel = ({ onBack }) => {
  const [allNotifications] = useState([
    {
      id: 1,
      type: "opname_approval",
      title: "Opname Menunggu Persetujuan",
      message:
        "Opname tanggal 2024-01-30 untuk kategori Makanan & Minuman perlu disetujui mandor.",
      date: "2024-01-30 14:30",
      status: "pending",
      details: {
        tanggal: "2024-01-30",
        shift: "siang",
        kategori: "Makanan & Minuman",
        item: "Indomie Goreng",
        stok_sistem: 50,
        stok_fisik: 47,
        selisih: -3,
        pic: "Ahmad Sutanto",
      },
    },
    {
      id: 2,
      type: "opname_approval",
      title: "Opname Menunggu Persetujuan",
      message:
        "Opname tanggal 2024-01-29 untuk kategori Rokok perlu disetujui mandor.",
      date: "2024-01-29 16:45",
      status: "pending",
      details: {
        tanggal: "2024-01-29",
        shift: "siang",
        kategori: "Rokok",
        item: "Marlboro Merah",
        stok_sistem: 100,
        stok_fisik: 98,
        selisih: -2,
        pic: "Ahmad Sutanto",
      },
    },
    {
      id: 3,
      type: "opname_approved",
      title: "Opname Disetujui",
      message: "Opname tanggal 2024-01-28 telah disetujui oleh mandor.",
      date: "2024-01-28 09:15",
      status: "approved",
    },
  ]);

  const { user } = useAuth();

  // Filter notifications based on user role
  const [notifications, setNotifications] = useState(
    user?.role === "kontraktor"
      ? allNotifications
      : allNotifications.filter(
          (notif) =>
            notif.type !== "opname_approval" || notif.status !== "pending"
        )
  );

  const handleApprove = (id) => {
    const updatedNotifications = allNotifications.map((notif) =>
      notif.id === id
        ? { ...notif, status: "approved", type: "opname_approved" }
        : notif
    );

    setNotifications(
      user?.role === "kontraktor"
        ? updatedNotifications
        : updatedNotifications.filter(
            (notif) =>
              notif.type !== "opname_approval" || notif.status !== "pending"
          )
    );
  };

  const handleReject = (id) => {
    const updatedNotifications = allNotifications.map((notif) =>
      notif.id === id
        ? { ...notif, status: "rejected", type: "opname_rejected" }
        : notif
    );

    setNotifications(
      user?.role === "kontraktor"
        ? updatedNotifications
        : updatedNotifications.filter(
            (notif) =>
              notif.type !== "opname_approval" || notif.status !== "pending"
          )
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
            ← Kembali
          </button>
          <h2 style={{ color: "var(--alfamart-red)" }}>Notifikasi</h2>
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
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="card"
              style={{
                border: `2px solid ${getNotificationColor(notification.type)}`,
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
                          <strong>PIC:</strong> {notification.details.pic}
                        </div>
                        <div>
                          <strong>Tanggal:</strong>{" "}
                          {notification.details.tanggal}
                        </div>
                        <div>
                          <strong>Shift:</strong> {notification.details.shift}
                        </div>
                        <div>
                          <strong>Kategori:</strong>{" "}
                          {notification.details.kategori}
                        </div>
                        <div>
                          <strong>Item:</strong> {notification.details.item}
                        </div>
                        <div>
                          <strong>Stok Sistem:</strong>{" "}
                          {notification.details.stok_sistem}
                        </div>
                        <div>
                          <strong>Stok Fisik:</strong>{" "}
                          {notification.details.stok_fisik}
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
          ))}
        </div>

        {notifications.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--gray-600)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <h3>
              {user?.role === "pic"
                ? "Tidak ada notifikasi untuk PIC"
                : "Tidak ada notifikasi"}
            </h3>
            <p>
              {user?.role === "pic"
                ? "Hanya kontraktor yang dapat melihat pending approval"
                : "Semua notifikasi sudah dibaca"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
