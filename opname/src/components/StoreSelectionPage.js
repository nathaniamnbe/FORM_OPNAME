// src/components/StoreSelectionPage.js - Versi Final Lengkap dengan Filter

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const StoreSelectionPage = ({ onSelectStore, onBack, type }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationCounts, setNotificationCounts] = useState({});

  // State untuk menyimpan teks dari kolom pencarian
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let storeApiUrl = "";

    // Tentukan API mana yang akan dipanggil berdasarkan peran pengguna dan tujuan halaman
    if ((type === "opname" || type === "final-opname") && user.role === "pic") {
      storeApiUrl = `/api/toko?username=${user.username}`;
    } else if (
      (type === "approval" || type === "history") &&
      user.role === "kontraktor"
    ) {
      storeApiUrl = `/api/toko_kontraktor?username=${user.username}`;
    } else {
      setLoading(false);
      return;
    }

    // Ambil daftar toko dari API yang sesuai
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

    // Jika kontraktor, ambil juga jumlah notifikasi pending untuk badge
    if (user.role === "kontraktor" && type === "approval") {
      fetch(`/api/opname/pending/counts?username=${user.username}`)
        .then((res) => res.json())
        .then((counts) => setNotificationCounts(counts));
    }
  }, [type, user]);

  // Logika untuk memfilter daftar toko berdasarkan input di kolom pencarian
  const filteredStores = stores.filter((store) =>
    store.kode_toko.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        className="container"
        style={{ paddingTop: "20px", textAlign: "center" }}
      >
        <h3>Memuat data toko...</h3>
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
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onBack}
            className="btn btn-outline"
            style={{ padding: "8px 16px" }}
          >
            ← Kembali
          </button>
          <h2 style={{ color: "var(--alfamart-red)", margin: 0 }}>
            Pilih Toko untuk {type === "approval" ? "Persetujuan" : "Opname"}
          </h2>
        </div>

        {/* Kolom Filter Pencarian */}
        <div className="form-group" style={{ marginBottom: "24px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari berdasarkan Kode Toko (contoh: A001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Gunakan `filteredStores` untuk me-render tombol */}
          {filteredStores.map((toko) => (
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
                type === "approval" &&
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
        </div>

        {/* Tampilkan pesan jika filter tidak menemukan hasil */}
        {filteredStores.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            <p>
              {stores.length > 0
                ? `Toko dengan kode "${searchTerm}" tidak ditemukan.`
                : `Tidak ada toko yang ditugaskan untuk Anda.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSelectionPage;
