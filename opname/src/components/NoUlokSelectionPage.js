// src/components/NoUlokSelectionPage.js - Komponen Baru untuk Pemilihan No Ulok

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const NoUlokSelectionPage = ({
  selectedStore,
  onSelectNoUlok,
  onBack,
  type,
}) => {
  const { user } = useAuth();
  const [noUlokList, setNoUlokList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!selectedStore || !user) return;

    setLoading(true);
    const apiUrl = `/api/no-ulok?kode_toko=${selectedStore.kode_toko}&username=${user.username}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setNoUlokList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil daftar no ulok:", err);
        setLoading(false);
      });
  }, [selectedStore, user]);

  const filteredNoUlok = noUlokList.filter((item) =>
    item.no_ulok.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        className="container"
        style={{ paddingTop: "20px", textAlign: "center" }}
      >
        <h3>Memuat data no ulok...</h3>
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
            Pilih No Ulok - {selectedStore.kode_toko}
          </h2>
        </div>

        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <strong>Toko Terpilih:</strong> {selectedStore.kode_toko} -{" "}
          {selectedStore.nama_toko}
        </div>

        {/* Kolom Filter Pencarian */}
        <div className="form-group" style={{ marginBottom: "24px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari berdasarkan No Ulok..."
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
          {filteredNoUlok.map((item) => (
            <button
              key={item.no_ulok}
              onClick={() => onSelectNoUlok(item)}
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
              <span style={{ fontSize: "28px" }}>📋</span>
              <div>
                <strong>{item.no_ulok}</strong>
              </div>
              <div style={{ fontSize: "14px" }}>{item.nama_toko}</div>
            </button>
          ))}
        </div>

        {filteredNoUlok.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            <p>
              {noUlokList.length > 0
                ? `No Ulok dengan kode "${searchTerm}" tidak ditemukan.`
                : `Tidak ada no ulok yang tersedia untuk toko ini.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoUlokSelectionPage;
