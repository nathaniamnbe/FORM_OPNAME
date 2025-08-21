// src/components/ApprovalPage.js - Versi DEBUG

"use client";

import { useState, useEffect } from "react";

const ApprovalPage = ({ onBack, selectedStore }) => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPendingItems = () => {
    if (!selectedStore?.kode_toko) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL; // Tambahkan ini
    fetch(`${apiUrl}/api/opname/pending?kode_toko=${selectedStore.kode_toko}`) // Ubah ini
      .then((res) => res.json())
      .then((data) => {
        // ===== DEBUG LOG 4 =====
        console.log("DEBUG: Data PENDING DITERIMA di frontend:", data);
        setPendingItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil data pending:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPendingItems();
  }, [selectedStore]);

  const handleApprove = async (itemId) => {
    // ===== DEBUG LOG 6 =====
    console.log("DEBUG: Tombol Approve DITEKAN dengan itemId:", itemId);
    console.log("DEBUG: Tipe data itemId:", typeof itemId);

    setMessage("");
    const originalItems = [...pendingItems];
    setPendingItems((prev) => prev.filter((item) => item.item_id !== itemId));

    try {
        const apiUrl = process.env.REACT_APP_API_URL; // Tambahkan ini
        const response = await fetch(`${apiUrl}/api/opname/approve`, {
          // Ubah ini
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: itemId }),
        });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      setMessage("Berhasil di-approve!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setPendingItems(originalItems); // Kembalikan state jika ada error
    }
  };

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
          <button onClick={onBack} className="btn btn-outline">
            ← Kembali
          </button>
          <h2 style={{ color: "var(--alfamart-red)" }}>
            Persetujuan Opname - {selectedStore.kode_toko}
          </h2>
        </div>

        {message && (
          <div
            className={`alert ${
              message.startsWith("Error") ? "alert-error" : "alert-success"
            }`}
          >
            {message}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ padding: "12px" }}>Jenis Pekerjaan</th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Volume Akhir
                </th>
                <th style={{ padding: "12px" }}>PIC</th>
                <th style={{ padding: "12px" }}>Waktu Submit</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.map((item) => (
                <tr
                  key={item.item_id || Math.random()}
                  style={{ borderBottom: "1px solid #ddd" }}
                >
                  <td style={{ padding: "12px" }}>{item.jenis_pekerjaan}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.volume_akhir}
                  </td>
                  <td style={{ padding: "12px" }}>{item.pic_username}</td>
                  <td style={{ padding: "12px" }}>{item.tanggal_submit}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprove(item.item_id)}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingItems.length === 0 && !loading && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              Tidak ada opname yang menunggu persetujuan untuk toko ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;
