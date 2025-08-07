// src/components/FinalOpnameView.js - Versi Final Diperbarui

"use client";

import { useState, useEffect } from "react";

const FinalOpnameView = ({ onBack, selectedStore }) => {
  // Inisialisasi state sebagai objek kosong, karena kita mengharapkan objek
  const [submissionsByDate, setSubmissionsByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedStore?.kode_toko) {
      setLoading(true);
      fetch(`/api/opname/final?kode_toko=${selectedStore.kode_toko}`)
        .then((res) => res.json())
        .then((data) => {
          setSubmissionsByDate(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal mengambil data opname final:", err);
          setLoading(false);
        });
    }
  }, [selectedStore]);

  if (loading) {
    return (
      <div
        className="container"
        style={{ paddingTop: "20px", textAlign: "center" }}
      >
        <h3>Loading data opname...</h3>
      </div>
    );
  }

  // Ambil semua tanggal dari keys objek
  const dates = Object.keys(submissionsByDate);

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
            Riwayat Opname Final - {selectedStore.kode_toko}
          </h2>
        </div>

        {/* Ubah pengecekan dari .length menjadi Object.keys().length */}
        {dates.length === 0 ? (
          <p>Belum ada data opname yang di-approve untuk toko ini.</p>
        ) : (
          // Lakukan map pada setiap tanggal (keys dari objek)
          dates.map((date) => (
            <div
              key={date}
              className="card"
              style={{ marginBottom: "20px", background: "#fafafa" }}
            >
              <h4
                style={{
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "10px",
                }}
              >
                Tanggal Pengajuan: {date}
              </h4>
              <div style={{ overflowX: "auto", marginTop: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#e9ecef" }}>
                      <th style={{ padding: "12px" }}>Kategori</th>
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
                      <th style={{ padding: "12px", textAlign: "center" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Lakukan map lagi pada setiap item di dalam tanggal tersebut */}
                    {submissionsByDate[date].map((item, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid #ddd" }}
                      >
                        <td style={{ padding: "12px" }}>
                          {item.kategori_pekerjaan}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {item.jenis_pekerjaan}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {item.vol_rab} {item.satuan}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {item.volume_akhir}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {item.selisih}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "12px",
                              background: "#28a745",
                              color: "white",
                              fontSize: "12px",
                            }}
                          >
                            {item.approval_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FinalOpnameView;
