"use client";

import { useState, useEffect } from "react";
import { dummyHistory } from "../data/dummyData"; // Updated import

const HistoryView = ({ onBack, selectedStore }) => {
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    if (selectedStore) {
      const filtered = dummyHistory.filter(
        (item) => item.storeId === selectedStore.id
      );
      setHistoryItems(filtered);
    }
  }, [selectedStore]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
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
          }}
        >
          <button
            onClick={onBack}
            className="btn btn-outline"
            style={{ padding: "8px 16px" }}
          >
            ← Kembali ke Pilihan Toko
          </button>
          <h2 style={{ color: "var(--alfamart-red)" }}>
            Histori Opname ({selectedStore?.name})
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          {historyItems.length > 0 ? (
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
                      minWidth: "120px",
                    }}
                  >
                    Tanggal
                  </th>
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
                    Vol Akhir
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
                    PIC Penginput
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      minWidth: "120px",
                    }}
                  >
                    Status Approval
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--gray-300)",
                      backgroundColor:
                        index % 2 === 0 ? "var(--white)" : "var(--gray-100)",
                    }}
                  >
                    <td style={{ padding: "12px" }}>{item.details.tanggal}</td>
                    <td style={{ padding: "12px" }}>
                      {item.details.kategori_pekerjaan}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {item.details.jenis_pekerjaan}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {item.details.vol_rab}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {item.details.volume_akhir}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span
                        style={{
                          color:
                            item.details.selisih < 0
                              ? "#F44336"
                              : item.details.selisih > 0
                              ? "#4CAF50"
                              : "inherit",
                          fontWeight: "bold",
                        }}
                      >
                        {item.details.selisih}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {item.details.nama_pic_penginput}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "var(--white)",
                          backgroundColor: getStatusColor(item.status),
                        }}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--gray-600)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📜</div>
              <h3>Tidak ada histori opname untuk toko ini.</h3>
              <p>Belum ada opname yang disetujui atau ditolak.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
