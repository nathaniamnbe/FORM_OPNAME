"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Fungsi bantu untuk format mata uang
const formatRupiah = (number) => {
  const numericValue = Number(number) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numericValue);
};

const OpnameForm = ({ onBack, selectedStore }) => {
  const { user } = useAuth();
  const [opnameItems, setOpnameItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedStore?.kode_toko) {
      setLoading(true);
      fetch(`/api/opname?kode_toko=${selectedStore.kode_toko}`)
        .then((res) => res.json())
        .then((data) => {
          const items = data.map((task, index) => {
            const volAkhir = parseFloat(task.volume_akhir) || 0;
            const hargaMaterial = parseFloat(task.harga_material) || 0;
            const hargaUpah = parseFloat(task.harga_upah) || 0;

            return {
              ...task,
              id: index + 1,
              isSubmitting: false,
              isUploading: false,
              foto_url: task.isSubmitted ? task.foto_url : null,
              total_harga: volAkhir * (hargaMaterial + hargaUpah),
            };
          });
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
          const hargaMaterial = parseFloat(item.harga_material) || 0;
          const hargaUpah = parseFloat(item.harga_upah) || 0;
          const total_harga = volAkhir * (hargaMaterial + hargaUpah);
          return {
            ...item,
            volume_akhir: value,
            selisih: selisih.toString(),
            total_harga,
          };
        }
        return item;
      })
    );
  };

  const handleFileUpload = async (itemId, file) => {
    if (!file) return;
    setOpnameItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isUploading: true } : item
      )
    );
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setOpnameItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isUploading: false, foto_url: result.link }
            : item
        )
      );
    } catch (error) {
      alert(`Gagal upload foto: ${error.message}`);
      setOpnameItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isUploading: false } : item
        )
      );
    }
  };

  const handleItemSubmit = async (itemId) => {
    const itemToSubmit = opnameItems.find((item) => item.id === itemId);
    if (
      !itemToSubmit.volume_akhir ||
      String(itemToSubmit.volume_akhir).trim() === ""
    ) {
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
      foto_url: itemToSubmit.foto_url,
      total_harga_akhir: itemToSubmit.total_harga,
    };
    try {
      const response = await fetch("/api/opname/item/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
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
      <div
        className="container"
        style={{ paddingTop: "20px", textAlign: "center" }}
      >
        <h3>Memuat detail pekerjaan...</h3>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingTop: "20px", maxWidth: "1500px" }}
    >
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
            type="button"
            onClick={onBack}
            className="btn btn-outline"
            style={{ padding: "8px 16px" }}
          >
            ← Kembali
          </button>
          <h2 style={{ color: "var(--alfamart-red)" }}>Input Opname Harian</h2>
        </div>

        <h3 style={{ color: "var(--alfamart-red)", marginBottom: "16px" }}>
          Detail Pekerjaan
        </h3>
        <div style={{ overflowX: "auto", marginBottom: "20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--alfamart-red)",
                  color: "var(--white)",
                }}
              >
                <th style={{ padding: "12px", minWidth: "150px" }}>
                  Jenis Pekerjaan
                </th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Vol RAB
                </th>
                <th style={{ padding: "12px", textAlign: "center" }}>Satuan</th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    minWidth: "120px",
                  }}
                >
                  Harga Material
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    minWidth: "120px",
                  }}
                >
                  Harga Upah
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    minWidth: "120px",
                  }}
                >
                  Volume Akhir
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    minWidth: "100px",
                  }}
                >
                  Selisih
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    minWidth: "130px",
                  }}
                >
                  Total Harga
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    minWidth: "110px",
                  }}
                >
                  Foto
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
                    {item.vol_rab}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.satuan}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {formatRupiah(item.harga_material)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {formatRupiah(item.harga_upah)}
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
                      placeholder="0"
                      disabled={item.isSubmitted}
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span
                      style={{
                        color:
                          item.selisih < 0
                            ? "red"
                            : item.selisih > 0
                            ? "green"
                            : "black",
                      }}
                    >
                      {item.selisih || "0"} {item.satuan}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {formatRupiah(item.total_harga)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {!item.isSubmitted && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id={`file-${item.id}`}
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(item.id, e.target.files[0])
                          }
                          disabled={item.isUploading}
                        />
                        <label
                          htmlFor={`file-${item.id}`}
                          className={`btn btn-outline btn-sm ${
                            item.isUploading ? "disabled" : ""
                          }`}
                        >
                          {item.isUploading ? "..." : "Pilih Foto"}
                        </label>
                      </div>
                    )}
                    {item.foto_url && (
                      <a
                        href={item.foto_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat Foto
                      </a>
                    )}
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
