"use client";

import { useState } from "react";

const RabView = ({ onBack }) => {
  const [selectedRab, setSelectedRab] = useState(null);

  // Sample RAB data
  const rabData = [
    {
      id: 1,
      nama: "Renovasi Toko Sudirman",
      tanggal: "2024-01-15",
      status: "approved",
      total: "Rp 25.000.000",
      items: [
        { nama: "Cat Tembok", qty: 10, satuan: "kaleng", harga: 150000 },
        { nama: "Keramik Lantai", qty: 50, satuan: "m²", harga: 85000 },
        { nama: "Lampu LED", qty: 20, satuan: "pcs", harga: 75000 },
      ],
    },
    {
      id: 2,
      nama: "Perbaikan AC Central",
      tanggal: "2024-01-20",
      status: "pending",
      total: "Rp 15.500.000",
      items: [
        { nama: "Freon R410A", qty: 5, satuan: "tabung", harga: 850000 },
        { nama: "Filter AC", qty: 8, satuan: "pcs", harga: 125000 },
        { nama: "Jasa Teknisi", qty: 3, satuan: "hari", harga: 500000 },
      ],
    },
    {
      id: 3,
      nama: "Upgrade Sistem POS",
      tanggal: "2024-01-25",
      status: "draft",
      total: "Rp 12.000.000",
      items: [
        { nama: "Hardware POS", qty: 2, satuan: "unit", harga: 4500000 },
        { nama: "Software License", qty: 1, satuan: "tahun", harga: 3000000 },
      ],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "draft":
        return "#757575";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "pending":
        return "Menunggu";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  if (selectedRab) {
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
              onClick={() => setSelectedRab(null)}
              className="btn btn-outline"
              style={{ padding: "8px 16px" }}
            >
              ← Kembali ke Daftar
            </button>
            <h2 style={{ color: "var(--alfamart-red)" }}>Detail RAB</h2>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--alfamart-red)", marginBottom: "16px" }}>
              {selectedRab.nama}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <strong>Tanggal:</strong> {selectedRab.tanggal}
              </div>
              <div>
                <strong>Status:</strong>
                <span
                  style={{
                    color: getStatusColor(selectedRab.status),
                    marginLeft: "8px",
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(selectedRab.status)}
                </span>
              </div>
              <div>
                <strong>Total:</strong>
                <span
                  style={{
                    color: "var(--alfamart-red)",
                    marginLeft: "8px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {selectedRab.total}
                </span>
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
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
                  <th style={{ padding: "12px", textAlign: "left" }}>Item</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>
                    Satuan
                  </th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Harga</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedRab.items.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid var(--gray-300)",
                      backgroundColor:
                        index % 2 === 0 ? "var(--white)" : "var(--gray-100)",
                    }}
                  >
                    <td style={{ padding: "12px" }}>{item.nama}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {item.satuan}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      Rp {item.harga.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      Rp {(item.qty * item.harga).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
          <button
            onClick={onBack}
            className="btn btn-outline"
            style={{ padding: "8px 16px" }}
          >
            ← Kembali
          </button>
          <h2 style={{ color: "var(--alfamart-red)" }}>
            Daftar RAB (Rencana Anggaran Biaya)
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {rabData.map((rab) => (
            <div
              key={rab.id}
              className="card"
              style={{
                cursor: "pointer",
                border: "2px solid var(--gray-300)",
                transition: "all 0.3s ease",
              }}
              onClick={() => setSelectedRab(rab)}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "var(--alfamart-red)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "var(--gray-300)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "var(--alfamart-red)",
                      marginBottom: "8px",
                      fontSize: "18px",
                    }}
                  >
                    {rab.nama}
                  </h3>
                  <p style={{ color: "var(--gray-600)", marginBottom: "8px" }}>
                    Tanggal: {rab.tanggal}
                  </p>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--white)",
                      backgroundColor: getStatusColor(rab.status),
                    }}
                  >
                    {getStatusText(rab.status)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "var(--alfamart-red)",
                    }}
                  >
                    {rab.total}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--gray-600)",
                      marginTop: "4px",
                    }}
                  >
                    {rab.items.length} item
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RabView;
