// src/utils/pdfGenerator.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Fungsi ini akan diekspor agar bisa digunakan di komponen lain
export const generateFinalOpnamePDF = (submissionsByDate, selectedStore) => {
  // Inisialisasi dokumen PDF
  const doc = new jsPDF();

  // Menggabungkan semua item dari semua tanggal menjadi satu array
  const allItems = Object.values(submissionsByDate).flat();
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Menambahkan Judul dan Informasi Laporan
  doc.setFontSize(18);
  doc.text("Laporan Opname Final", 14, 22);
  doc.setFontSize(12);
  doc.text(
    `Toko: ${selectedStore.kode_toko} - ${selectedStore.nama_toko}`,
    14,
    30
  );
  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${currentDate}`, 14, 36);

  // Menyiapkan data untuk tabel
  const tableColumn = [
    "No",
    "Kategori",
    "Jenis Pekerjaan",
    "Vol RAB",
    "Volume Akhir",
    "Selisih",
    "Tgl Submit",
  ];
  const tableRows = [];

  allItems.forEach((item, index) => {
    const itemData = [
      index + 1,
      item.kategori_pekerjaan,
      item.jenis_pekerjaan,
      `${item.vol_rab} ${item.satuan}`,
      item.volume_akhir,
      item.selisih,
      item.tanggal_submit,
    ];
    tableRows.push(itemData);
  });

  // Membuat tabel dengan autoTable
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 50, // Posisi awal tabel setelah judul
    theme: "grid", // Tema tabel agar lebih rapi
    headStyles: {
      fillColor: [229, 30, 37], // Warna header merah khas Alfamart
    },
  });

  // Menyimpan file PDF
  doc.save(`Opname_Final_${selectedStore.kode_toko}.pdf`);
};
