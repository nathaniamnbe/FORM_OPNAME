// src/components/StoreSelectionPage.js - Versi Final Dinamis

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const StoreSelectionPage = ({ onSelectStore, onBack, type }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationCounts, setNotificationCounts] = useState({});

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let storeApiUrl = "";
    // Tentukan API mana yang akan dipanggil berdasarkan peran pengguna dan tipe halaman
    if (type === "opname" && user.role === "pic") {
      storeApiUrl = `/api/toko?username=${user.username}`;
    } else if (type === "approval" && user.role === "kontraktor") {
      storeApiUrl = `/api/toko_kontraktor?username=${user.username}`;
    } else {
      setLoading(false);
      return;
    }

    // Ambil daftar toko
    fetch(storeApiUrl)
      .then((res) => res.json())
      .then((data) => {
        setStores(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil daftar toko:", err);
        setLoading(false);
      });

    // Jika kontraktor, ambil juga jumlah notifikasi pending
    if (user.role === "kontraktor" && type === "approval") {
      fetch(`/api/opname/pending/counts?username=${user.username}`)
        .then((res) => res.json())
        .then((counts) => setNotificationCounts(counts));
    }
  }, [type, user]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center" }}>
        <h3>Loading...</h3>
      </div>
    );
  }

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
            Pilih Toko untuk {type === "approval" ? "Persetujuan" : "Opname"}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {stores.map((toko) => (
            <button
              key={toko.kode_toko}
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
                position: "relative",
              }}
            >
              <span style={{ fontSize: "28px" }}>🏪</span>
              <div>
                <strong>{toko.kode_toko}</strong>
              </div>
              <div style={{ fontSize: "14px" }}>{toko.nama_toko}</div>
              {user.role === "kontraktor" &&
                notificationCounts[toko.kode_toko] > 0 && (
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
                    {notificationCounts[toko.kode_toko]}
                  </span>
                )}
            </button>
          ))}
          {stores.length === 0 && (
            <p>Tidak ada toko yang ditugaskan untuk Anda.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreSelectionPage;
