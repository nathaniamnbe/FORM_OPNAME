// src/components/OpnameForm.js - Versi Final Stateful

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const OpnameForm = ({ onBack, selectedStore }) => {
  const { user } = useAuth();

  const [opnameItems, setOpnameItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data gabungan dari backend
  useEffect(() => {
    if (selectedStore?.kode_toko) {
      setLoading(true);
      // API ini sudah diubah di backend untuk mengembalikan data yang sudah tersimpan
      fetch(`/api/opname?kode_toko=${selectedStore.kode_toko}`)
        .then((res) => res.json())
        .then((data) => {
          // Data dari API sudah berisi status `isSubmitted`, `volume_akhir` yg tersimpan, dll.
          const items = data.map((task, index) => ({
            ...task,
            id: index + 1, // ID lokal untuk UI
            isSubmitting: false, // Untuk loading per item
            nama_pic_penginput: user ? user.name : "", // Nama PIC
          }));
          setOpnameItems(items);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal mengambil detail pekerjaan:", err);
          setLoading(false);
        });
    }
  }, [selectedStore, user]);

  const handleVolumeAkhirChange = (id, value) => {
    setOpnameItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && !item.isSubmitted) {
          const volAkhir = Number.parseFloat(value) || 0;
          const selisih = volAkhir - item.vol_rab;
          return { ...item, volume_akhir: value, selisih: selisih.toString() };
        }
        return item;
      })
    );
  };

  const handleItemSubmit = async (itemId) => {
    const itemToSubmit = opnameItems.find((item) => item.id === itemId);

    if (!itemToSubmit.volume_akhir) {
      alert("Volume akhir harus diisi sebelum menyimpan.");
      return;
    }

    setOpnameItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isSubmitting: true } : item
      )
    );

    const submissionData = {
      kode_toko: selectedStore.kode_toko,
      nama_toko: selectedStore.nama_toko,
      pic_username: user.username,
      kategori_pekerjaan: itemToSubmit.kategori_pekerjaan,
      jenis_pekerjaan: itemToSubmit.jenis_pekerjaan,
      vol_rab: itemToSubmit.vol_rab,
      satuan: itemToSubmit.satuan,
      volume_akhir: itemToSubmit.volume_akhir,
      selisih: itemToSubmit.selisih,
    };

    try {
      const response = await fetch("/api/opname/item/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // Update UI setelah berhasil menyimpan
      setOpnameItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isSubmitting: false,
                isSubmitted: true,
                approval_status: "Pending",
                submissionTime: result.tanggal_submit,
                item_id: result.item_id,
              }
            : item
        )
      );
    } catch (error) {
      alert(`Error: ${error.message}`);
      setOpnameItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isSubmitting: false } : item
        )
      );
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
          <button type="button" onClick={onBack} className="btn btn-outline">
            ← Kembali
          </button>
          <h2 style={{ color: "var(--alfamart-red)" }}>Input Opname Harian</h2>
        </div>

        <h3 style={{ color: "var(--alfamart-red)", marginBottom: "16px" }}>
          Detail Pekerjaan
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--alfamart-red)",
                  color: "var(--white)",
                }}
              >
                <th style={{ padding: "12px" }}>Jenis Pekerjaan</th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Vol RAB
                </th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Volume Akhir
                </th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Selisih
                </th>
                <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {opnameItems.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    background: item.isSubmitted ? "#f0fff0" : "transparent",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <td style={{ padding: "12px" }}>{item.jenis_pekerjaan}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.vol_rab} {item.satuan}
                  </td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: "100px" }}
                      value={item.volume_akhir}
                      onChange={(e) =>
                        handleVolumeAkhirChange(item.id, e.target.value)
                      }
                      disabled={item.isSubmitted}
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.selisih} {item.satuan}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span
                      className={`badge ${
                        item.approval_status === "Pending"
                          ? "badge-warning"
                          : item.approval_status === "Approved"
                          ? "badge-success"
                          : "badge-light"
                      }`}
                    >
                      {item.approval_status}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.isSubmitted ? (
                      <div style={{ fontSize: "12px", color: "green" }}>
                        <strong>Tersimpan</strong>
                        <br />
                        <small>{item.submissionTime}</small>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleItemSubmit(item.id)}
                        disabled={item.isSubmitting || !item.volume_akhir}
                      >
                        {item.isSubmitting ? "..." : "Simpan"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpnameForm;
