"use client";

import { useEffect, useState } from "react";
import { dummyNotifications } from "../data/dummyData"; // Import dummy notifications

const StoreSelectionPage = ({ onSelectStore, onBack, type }) => {
  const dummyKodeToko = [
    { id: "A001", name: "Alfamart Sudirman" },
    { id: "A002", name: "Alfamart Thamrin" },
    { id: "A003", name: "Alfamart Gatot Subroto" },
    { id: "A004", name: "Alfamart Kebon Jeruk" },
    { id: "A005", name: "Alfamart Cilandak" },
  ];

  const [storeNotificationCounts, setStoreNotificationCounts] = useState({});

  useEffect(() => {
    if (type === "notifications") {
      const counts = {};
      dummyNotifications.forEach((notif) => {
        if (notif.status === "pending") {
          counts[notif.storeId] = (counts[notif.storeId] || 0) + 1;
        }
      });
      setStoreNotificationCounts(counts);
    }
  }, [type]);

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
          <h2 style={{ color: "var(--alfamart-red)" }}>
            Pilih Toko untuk{" "}
            {type === "notifications" ? "Notifikasi" : "Opname"}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {dummyKodeToko.map((toko) => (
            <button
              key={toko.id}
              onClick={() => onSelectStore(toko)}
              className="btn btn-secondary"
              style={{
                height: "100px",
                flexDirection: "column",
                fontSize: "18px",
                gap: "8px",
                textAlign: "center",
                backgroundColor: "var(--alfamart-yellow)",
                color: "var(--gray-800)",
              }}
            >
              <span style={{ fontSize: "28px" }}>🏪</span>
              <div>
                <strong>{toko.id}</strong>
              </div>
              <div style={{ fontSize: "14px" }}>{toko.name}</div>
              {type === "notifications" &&
                storeNotificationCounts[toko.id] > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "var(--alfamart-red)",
                      color: "var(--white)",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {storeNotificationCounts[toko.id]}
                  </span>
                )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreSelectionPage;
