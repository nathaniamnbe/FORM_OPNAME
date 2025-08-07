// src/components/FinalOpnameView.js - Versi Final yang Lebih Rapi

"use client";

import { useState, useEffect } from "react";
// 1. Impor fungsi yang baru kita buat
import { generateFinalOpnamePDF } from "../utils/pdfGenerator";

const FinalOpnameView = ({ onBack, selectedStore }) => {
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

  // 2. Fungsi generatePDF sekarang menjadi sangat sederhana
  const handleDownloadPDF = () => {
    // Cukup panggil fungsi dari file terpisah dengan memberikan data yang dibutuhkan
    generateFinalOpnamePDF(submissionsByDate, selectedStore);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center" }}>
        <h3>Loading data opname...</h3>
      </div>
    );
  }

  const dates = Object.keys(submissionsByDate);

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={onBack}
              className="btn btn-outline"
              style={{ padding: "8px 16px" }}
            >
              ← Kembali
            </button>
            <h2 style={{ color: "var(--alfamart-red)", margin: 0 }}>
              Riwayat Opname Final - {selectedStore.kode_toko}
            </h2>
          </div>
          {dates.length > 0 && (
            // 3. Tombol ini sekarang memanggil handleDownloadPDF
            <button onClick={handleDownloadPDF} className="btn btn-primary">
              Download PDF
            </button>
          )}
        </div>

        {/* ... Sisa dari kode JSX untuk menampilkan tabel tidak berubah ... */}
        {dates.length === 0 ? (
          <p>Belum ada data opname yang di-approve untuk toko ini.</p>
        ) : (
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
