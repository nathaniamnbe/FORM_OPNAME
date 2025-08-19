// src/utils/pdfGenerator.js - Versi Final Lengkap (Semua Fitur)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- PENGATURAN TEKS ---
const companyName = "PT. SUMBER ALFARIA TRIJAYA, Tbk";
const branch = "CABANG: HEAD OFFICE";
const reportTitle = "BERITA ACARA OPNAME PEKERJAAN";
const logoUrl =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Alfamart_logo.svg/1280px-Alfamart_logo.svg.png";

// Fungsi bantu untuk format mata uang Rupiah
const formatRupiah = (number) => {
  const numericValue = Number(number) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numericValue);
};

// Fungsi bantu untuk mengambil gambar dan mengubahnya ke Base64
const toBase64 = async (url) => {
  try {
    if (!url) return null;
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok)
      throw new Error(
        `Network response was not ok, status: ${response.status}`
      );
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Gagal mengubah gambar ke Base64 dari URL: ${url}`, error);
    return null;
  }
};

// Fungsi untuk mengambil data RAB dari API
const fetchRabData = async (kode_toko) => {
  try {
    const response = await fetch(`/api/rab?kode_toko=${kode_toko}`);
    if (!response.ok) throw new Error("Gagal mengambil data RAB");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const generateFinalOpnamePDF = async (submissions, selectedStore) => {
  console.log("Memulai pembuatan PDF multi-tabel...");
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // --- Ambil Data RAB dari server ---
  const rabData = await fetchRabData(selectedStore.kode_toko);

  // --- PENGATURAN HALAMAN ---
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let startY = 15;

  // --- HEADER ---
  doc.setFontSize(10).setFont(undefined, "bold");
  doc.text(companyName, pageWidth / 2, startY, { align: "center" });
  startY += 5;
  doc.text(branch, pageWidth / 2, startY, { align: "center" });
  startY += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, startY, pageWidth - margin, startY);
  startY += 8;

  // --- JUDUL DOKUMEN ---
  doc.setFontSize(12).setFont(undefined, "bold");
  doc.text(reportTitle, pageWidth / 2, startY, { align: "center" });
  startY += 10;

  // --- INFORMASI PROYEK ---
  const projectInfo = [
    ["NAMA PROYEK", `: ${selectedStore.nama_toko}`],
    ["NOMOR ULOK", `: ${selectedStore.no_ulok}`],
    ["ALAMAT", `: ${selectedStore.nama_toko}`],
    ["TANGGAL OPNAME", `: ${currentDate}`],
  ];
  autoTable(doc, {
    body: projectInfo,
    startY: startY,
    theme: "plain",
    tableWidth: 90,
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold" } },
  });

  let lastY = doc.lastAutoTable.finalY + 10;

  // =================================================================
  // TABEL 1: RAB FINAL
  // =================================================================
  if (rabData.length > 0) {
    doc
      .setFontSize(12)
      .setFont(undefined, "bold")
      .text("RAB FINAL", margin, lastY);
    lastY += 7;

    const rabTableHead = [
      [
        "NO.",
        "JENIS PEKERJAAN",
        "SATUAN",
        "VOLUME",
        {
          content: "HARGA SATUAN (Rp)",
          colSpan: 2,
          styles: { halign: "center" },
        },
        {
          content: "TOTAL HARGA (Rp)",
          colSpan: 3,
          styles: { halign: "center" },
        },
      ],
      ["", "", "", "", "Material", "Upah", "Material", "Upah", "TOTAL"],
    ];

    let grandTotalRAB = 0;
    const rabTableBody = rabData.map((item, index) => {
      const volume = parseFloat(item.volume) || 0;
      const hargaMaterial = parseFloat(item.harga_material) || 0;
      const hargaUpah = parseFloat(item.harga_upah) || 0;
      const totalMaterial = volume * hargaMaterial;
      const totalUpah = volume * hargaUpah;
      const totalHarga =
        parseFloat(item.total_harga) || totalMaterial + totalUpah;
      grandTotalRAB += totalHarga;

      return [
        index + 1,
        item.jenis_pekerjaan,
        item.satuan,
        volume.toFixed(2),
        formatRupiah(hargaMaterial),
        formatRupiah(hargaUpah),
        formatRupiah(totalMaterial),
        formatRupiah(totalUpah),
        formatRupiah(totalHarga),
      ];
    });

    autoTable(doc, {
      head: rabTableHead,
      body: rabTableBody,
      startY: lastY,
      theme: "grid",
      headStyles: {
        fillColor: [229, 30, 37],
        halign: "center",
        valign: "middle",
      },
    });

    lastY = doc.lastAutoTable.finalY;

    const ppn = grandTotalRAB * 0.11;
    const totalSetelahPPN = grandTotalRAB + ppn;

    doc.setFontSize(10).setFont(undefined, "bold");
    doc.text("TOTAL", 130, lastY + 8);
    doc.text(formatRupiah(grandTotalRAB), 200, lastY + 8, { align: "right" });
    doc.text("PPN 11%", 130, lastY + 14);
    doc.text(formatRupiah(ppn), 200, lastY + 14, { align: "right" });
    doc.text("GRAND TOTAL", 130, lastY + 20);
    doc.text(formatRupiah(totalSetelahPPN), 200, lastY + 20, {
      align: "right",
    });

    lastY += 30;
  }

  // =================================================================
  // TABEL 2: LAPORAN OPNAME
  // =================================================================
  if (submissions && submissions.length > 0) {
    if (lastY + 20 > doc.internal.pageSize.getHeight()) doc.addPage();
    doc
      .setFontSize(12)
      .setFont(undefined, "bold")
      .text("Laporan Opname Final (Approved)", margin, lastY);
    lastY += 7;

    const opnameTableColumn = [
      "No",
      "Jenis Pekerjaan",
      "Vol RAB",
      "Satuan",
      "Volume Akhir",
      "Selisih",
      "Total Harga Akhir",
    ];
    const opnameTableRows = submissions.map((item, index) => [
      index + 1,
      item.jenis_pekerjaan,
      item.vol_rab,
      item.satuan,
      item.volume_akhir,
      `${item.selisih} ${item.satuan}`,
      formatRupiah(item.total_harga_akhir),
    ]);

    autoTable(doc, {
      head: [opnameTableColumn],
      body: opnameTableRows,
      startY: lastY,
      theme: "grid",
      headStyles: { fillColor: [229, 30, 37] },
    });
    lastY = doc.lastAutoTable.finalY;
  }

  // --- Lampiran Foto ---
  const itemsWithPhotos = submissions.filter((item) => item.foto_url);
  if (itemsWithPhotos.length > 0) {
    const photoPromises = itemsWithPhotos.map((item) =>
      toBase64(item.foto_url)
    );
    const base64Photos = await Promise.all(photoPromises);
    const photoMap = {};
    itemsWithPhotos.forEach((item, index) => {
      if (base64Photos[index]) {
        photoMap[item.jenis_pekerjaan] = base64Photos[index];
      }
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Lampiran Foto Bukti", 14, 20);
    let photoY = 30;

    itemsWithPhotos.forEach((item) => {
      const imgData = photoMap[item.jenis_pekerjaan];
      if (imgData) {
        const imgProps = doc.getImageProperties(imgData);
        const imgWidth = 100;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (photoY + imgHeight + 20 > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          photoY = 20;
        }

        doc.setFontSize(12);
        doc.text(`Foto untuk: ${item.jenis_pekerjaan}`, 14, photoY);
        doc.addImage(imgData, 14, photoY + 5, imgWidth, imgHeight);
        photoY += imgHeight + 20;
      }
    });
  }

  doc.save(`Laporan_Opname_dan_RAB_${selectedStore.kode_toko}.pdf`);
  console.log("PDF gabungan berhasil dibuat.");
};
