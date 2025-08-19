"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import OpnameForm from "./OpnameForm";
import FinalOpnameView from "./FinalOpnameView";
import UlokSelector from "./UlokSelector";

const PICDashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState("store-list"); // store-list, ulok-list, opname-form, final-view
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedUlok, setSelectedUlok] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.username) {
      setLoading(true);
      fetch(`/api/toko?username=${user.username}`)
        .then((res) => res.json())
        .then((data) => {
          setStores(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal mengambil daftar toko:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setView("ulok-list");
  };

  const handleUlokSelect = (ulok) => {
    setSelectedUlok(ulok);
    setView("opname-form");
  };

  const handleBackToStoreList = () => {
    setView("store-list");
    setSelectedStore(null);
    setSelectedUlok(null);
  };

  const handleBackToUlokList = () => {
    setView("ulok-list");
    setSelectedUlok(null);
  };

  const handleViewFinal = (store, ulok) => {
    setSelectedStore(store);
    setSelectedUlok(ulok);
    setView("final-view");
  };

  const filteredStores = stores.filter(
    (store) =>
      store.kode_toko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.nama_toko.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        className="container"
        style={{ paddingTop: "20px", textAlign: "center" }}
      >
        <h3>Memuat daftar toko...</h3>
      </div>
    );
  }

  // Render based on current view
  if (view === "opname-form") {
    return (
      <OpnameForm
        onBack={handleBackToStoreList}
        onBackToUlok={handleBackToUlokList}
        selectedStore={selectedStore}
        selectedUlok={selectedUlok}
      />
    );
  }

  if (view === "final-view") {
    return (
      <FinalOpnameView
        onBack={handleBackToStoreList}
        onBackToUlok={handleBackToUlokList}
        selectedStore={selectedStore}
        selectedUlok={selectedUlok}
      />
    );
  }

  if (view === "ulok-list") {
    return (
      <UlokSelector
        onBack={handleBackToStoreList}
        selectedStore={selectedStore}
        onSelectUlok={handleUlokSelect}
      />
    );
  }

  // Default view: store-list
  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h2 style={{ color: "var(--alfamart-red)", margin: 0 }}>
            Dashboard PIC - {user.name}
          </h2>
          <button onClick={logout} className="btn btn-outline">
            Logout
          </button>
        </div>

        <h3 style={{ color: "var(--alfamart-red)", marginBottom: "16px" }}>
          Pilih Cabang untuk Opname
        </h3>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Cari berdasarkan Kode Toko (contoh: A001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>

        {filteredStores.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "16px", color: "#666" }}>
              {searchTerm
                ? "Tidak ada toko yang cocok dengan pencarian."
                : "Tidak ada toko yang ditugaskan untuk Anda."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            {filteredStores.map((store) => (
              <div
                key={store.kode_toko}
                className="card"
                style={{
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div
                    style={{
                      backgroundColor: "var(--alfamart-yellow)",
                      color: "var(--alfamart-red)",
                      padding: "8px",
                      borderRadius: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {store.kode_toko}
                    </h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
                      {store.nama_toko}
                    </p>
                  </div>

                  {store.no_ulok && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "12px",
                      }}
                    >
                      No. Ulok: {store.no_ulok}
                    </div>
                  )}

                  {store.link_pdf && (
                    <div style={{ marginBottom: "16px" }}>
                      <a
                        href={store.link_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--alfamart-red)",
                          textDecoration: "none",
                          fontSize: "12px",
                        }}
                      >
                        📄 Lihat PDF RAB
                      </a>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => handleStoreSelect(store)}
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      Input Opname
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStore(store);
                        setView("ulok-list");
                      }}
                      className="btn btn-outline"
                      style={{ width: "100%" }}
                    >
                      Lihat Riwayat Opname
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PICDashboard;
