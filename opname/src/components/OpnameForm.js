"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const OpnameForm = ({ onBack, selectedStore }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dummy data untuk kategori dan jenis pekerjaan yang akan di-opname
  // Ini akan otomatis terisi, bukan dipilih user
  const [opnameItems, setOpnameItems] = useState([
    {
      id: 1,
      kategori_pekerjaan: "Instalasi",
      jenis_pekerjaan: "Mengganti Lampu",
      vol_rab: 90,
      satuan: "unit",
      volume_akhir: "",
      selisih: "",
      nama_pic_penginput: user ? user.name : "",
      approval: "pending",
    },
    {
      id: 2,
      kategori_pekerjaan: "Instalasi",
      jenis_pekerjaan: "Mengganti Kursi",
      vol_rab: 34,
      satuan: "unit",
      volume_akhir: "",
      selisih: "",
      nama_pic_penginput: user ? user.name : "",
      approval: "pending",
    },
    {
      id: 3,
      kategori_pekerjaan: "Perbaikan",
      jenis_pekerjaan: "Perbaikan Pintu",
      vol_rab: 10,
      satuan: "unit",
      volume_akhir: "",
      selisih: "",
      nama_pic_penginput: user ? user.name : "",
      approval: "pending",
    },
    {
      id: 4,
      kategori_pekerjaan: "Perbaikan",
      jenis_pekerjaan: "Perbaikan Jendela",
      vol_rab: 15,
      satuan: "unit",
      volume_akhir: "",
      selisih: "",
      nama_pic_penginput: user ? user.name : "",
      approval: "pending",
    },
  ]);

  const [keteranganUmum, setKeteranganUmum] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVolumeAkhirChange = (id, value) => {
    setOpnameItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const volAkhir = Number.parseFloat(value) || 0;
          const selisih = volAkhir - item.vol_rab;
          return {
            ...item,
            volume_akhir: value,
            selisih: selisih.toString(),
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulasi save data
    console.log("Opname data:", {
      kode_toko: selectedStore.id,
      nama_toko: selectedStore.name,
      tanggal: new Date().toISOString().split("T")[0],
      jam_input: currentTime.toLocaleTimeString(),
      opname_details: opnameItems,
      keterangan_umum: keteranganUmum,
      user_penginput: user ? user.name : "Unknown",
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onBack(); // Kembali ke halaman pemilihan toko atau dashboard
    }, 2000);
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
          <h2 style={{ color: "var(--alfamart-red)" }}>Input Opname Harian</h2>
        </div>

        {success && (
          <div className="alert alert-success">
            Data opname berhasil disimpan! Menunggu approval dari mandor.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Kode Toko</label>
            <input
              type="text"
              className="form-input"
              value={`${selectedStore.id} - ${selectedStore.name}`}
              readOnly
              style={{ backgroundColor: "var(--gray-100)" }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal & Jam</label>
            <input
              type="text"
              className="form-input"
              value={`${new Date().toLocaleDateString()} ${currentTime.toLocaleTimeString()}`}
              readOnly
              style={{ backgroundColor: "var(--gray-100)" }}
            />
          </div>
        </div>

        <h3 style={{ color: "var(--alfamart-red)", marginBottom: "16px" }}>
          Detail Pekerjaan
        </h3>
        <div style={{ overflowX: "auto", marginBottom: "20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "var(--white)",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--alfamart-red)",
                  color: "var(--white)",
                }}
              >
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    minWidth: "150px",
                  }}
                >
                  Kategori Pekerjaan
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    minWidth: "180px",
                  }}
                >
                  Jenis Pekerjaan
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    minWidth: "100px",
                  }}
                >
                  Vol RAB
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
                    textAlign: "left",
                    minWidth: "150px",
                  }}
                >
                  Nama PIC Penginput
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    minWidth: "120px",
                  }}
                >
                  Approval
                </th>
              </tr>
            </thead>
            <tbody>
              {opnameItems.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid var(--gray-300)",
                    backgroundColor:
                      index % 2 === 0 ? "var(--white)" : "var(--gray-100)",
                  }}
                >
                  <td style={{ padding: "12px" }}>{item.kategori_pekerjaan}</td>
                  <td style={{ padding: "12px" }}>{item.jenis_pekerjaan}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.vol_rab} {item.satuan}
                  </td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <input
                      type="number"
                      className="form-input"
                      value={item.volume_akhir}
                      onChange={(e) =>
                        handleVolumeAkhirChange(item.id, e.target.value)
                      }
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "14px",
                      }}
                      required
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span
                      style={{
                        color:
                          item.selisih < 0
                            ? "#F44336"
                            : item.selisih > 0
                            ? "#4CAF50"
                            : "inherit",
                        fontWeight: "bold",
                      }}
                    >
                      {item.selisih ? `${item.selisih} ${item.satuan}` : ""}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{item.nama_pic_penginput}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor:
                          item.approval === "pending"
                            ? "var(--alfamart-yellow)"
                            : item.approval === "approved"
                            ? "#4CAF50"
                            : "#F44336",
                        color:
                          item.approval === "pending"
                            ? "var(--gray-800)"
                            : "var(--white)",
                      }}
                    >
                      {item.approval === "pending"
                        ? "Pending"
                        : item.approval === "approved"
                        ? "Approved"
                        : "Not Approved"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan Umum</label>
          <textarea
            name="keterangan_umum"
            className="form-input"
            value={keteranganUmum}
            onChange={(e) => setKeteranganUmum(e.target.value)}
            placeholder="Keterangan tambahan untuk seluruh opname ini (opsional)"
            rows="3"
            style={{ resize: "vertical" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "32px",
            justifyContent: "flex-end",
          }}
        >
          <button type="button" onClick={onBack} className="btn btn-outline">
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Opname
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpnameForm;
