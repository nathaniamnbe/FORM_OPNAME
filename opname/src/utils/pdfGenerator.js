// src/utils/pdfGenerator.js - Versi Final dengan Format Seperti Contoh - FIXED PHOTO TITLES + PIC & KONTRAKTOR

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

// Fungsi untuk memotong teks jika terlalu panjang
const wrapText = (doc, text, maxWidth) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (let word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const textWidth = doc.getTextWidth(testLine);

    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
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

// FUNGSI BARU: Mengambil data PIC dan Kontraktor dari Google Sheets
const fetchPicKontraktorData = async (no_ulok) => {
  try {
    const response = await fetch(`/api/pic-kontraktor?no_ulok=${no_ulok}`);
    if (!response.ok)
      throw new Error("Gagal mengambil data PIC dan Kontraktor");
    return await response.json();
  } catch (error) {
    console.error("Error fetching PIC dan Kontraktor:", error);
    return { pic_username: "N/A", kontraktor_username: "N/A" };
  }
};

// Fungsi untuk mengelompokkan data berdasarkan kategori
const groupDataByCategory = (data) => {
  const categories = {
    "PEKERJAAN PERSIAPAN": [],
    "PEKERJAAN BOBOKAN / BONGKARAN": [],
    "PEKERJAAN TANAH": [],
    "PEKERJAAN PONDASI & BETON": [],
    "PEKERJAAN PASANGAN": [],
    "PEKERJAAN PLESTERAN": [],
    "PEKERJAAN ATAP": [],
    "PEKERJAAN LANTAI": [],
    "PEKERJAAN DINDING": [],
    "PEKERJAAN KUSEN & PINTU": [],
    "PEKERJAAN PLAFON": [],
    "PEKERJAAN CAT": [],
    "PEKERJAAN INSTALASI": [],
    "PEKERJAAN LAIN-LAIN": [],
  };

  data.forEach((item) => {
    const jenis = item.jenis_pekerjaan.toLowerCase();
    let category = "PEKERJAAN LAIN-LAIN"; // default

    if (jenis.includes("pagar") || jenis.includes("persiapan")) {
      category = "PEKERJAAN PERSIAPAN";
    } else if (jenis.includes("tebang") || jenis.includes("bongkar")) {
      category = "PEKERJAAN BOBOKAN / BONGKARAN";
    } else if (jenis.includes("urugan") || jenis.includes("tanah")) {
      category = "PEKERJAAN TANAH";
    } else if (jenis.includes("pondasi") || jenis.includes("rolag")) {
      category = "PEKERJAAN PONDASI & BETON";
    } else if (
      jenis.includes("pasang") ||
      jenis.includes("keramik") ||
      jenis.includes("granit")
    ) {
      category = "PEKERJAAN PASANGAN";
    } else if (jenis.includes("plester")) {
      category = "PEKERJAAN PLESTERAN";
    } else if (jenis.includes("atap") || jenis.includes("rangka")) {
      category = "PEKERJAAN ATAP";
    } else if (jenis.includes("lantai")) {
      category = "PEKERJAAN LANTAI";
    } else if (jenis.includes("dinding")) {
      category = "PEKERJAAN DINDING";
    } else if (jenis.includes("kusen") || jenis.includes("pintu")) {
      category = "PEKERJAAN KUSEN & PINTU";
    } else if (jenis.includes("plafon")) {
      category = "PEKERJAAN PLAFON";
    } else if (jenis.includes("cat")) {
      category = "PEKERJAAN CAT";
    } else if (
      jenis.includes("instalasi") ||
      jenis.includes("pipa") ||
      jenis.includes("closet")
    ) {
      category = "PEKERJAAN INSTALASI";
    }

    categories[category].push(item);
  });

  return categories;
};

export const generateFinalOpnamePDF = async (submissions, selectedStore) => {
  console.log("Memulai pembuatan PDF dengan format kategori...");
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // --- Ambil Data RAB dari server ---
  const rabData = await fetchRabData(selectedStore.kode_toko);

  // --- PERBAIKAN: Ambil Data PIC dan Kontraktor berdasarkan no_ulok ---
  const picKontraktorData = await fetchPicKontraktorData(selectedStore.no_ulok);

  // --- PENGATURAN HALAMAN ---
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let startY = 20;

  // --- HEADER ---
  doc.setFillColor(229, 30, 37);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12).setFont(undefined, "bold");
  doc.text(companyName, pageWidth / 2, 12, { align: "center" });
  doc.setFontSize(9);
  doc.text(branch, pageWidth / 2, 20, { align: "center" });
  doc.setTextColor(0, 0, 0);
  startY = 40;

  // --- JUDUL DOKUMEN ---
  doc.setFontSize(14).setFont(undefined, "bold");
  doc.text(reportTitle, pageWidth / 2, startY, { align: "center" });
  startY += 15;

  // --- INFORMASI PROYEK - PERBAIKAN: Gunakan data dari API ---
  const projectInfo = [
    ["NAMA PROYEK", `: ${selectedStore.nama_toko}`],
    ["NOMOR ULOK", `: ${selectedStore.no_ulok}`],
    ["ALAMAT", `: ${selectedStore.alamat || selectedStore.nama_toko}`],
    ["TANGGAL OPNAME", `: ${currentDate}`],
    ["NAMA PIC", `: ${picKontraktorData.pic_username || "N/A"}`],
    ["NAMA KONTRAKTOR", `: ${picKontraktorData.kontraktor_username || "N/A"}`],
  ];

  autoTable(doc, {
    body: projectInfo,
    startY: startY,
    margin: { left: margin },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: "auto" },
    },
  });

  let lastY = doc.lastAutoTable.finalY + 15;

  // =================================================================
  // RAB FINAL - BERDASARKAN KATEGORI
  // =================================================================
  if (rabData.length > 0) {
    // Header RAB FINAL
    doc.setFillColor(229, 30, 37);
    doc.rect(margin, lastY, pageWidth - margin * 2, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11).setFont(undefined, "bold");
    doc.text("RAB FINAL", margin + 3, lastY + 7);
    doc.setTextColor(0, 0, 0);
    lastY += 15;

    // Kelompokkan data berdasarkan kategori
    const groupedData = groupDataByCategory(rabData);
    let grandTotalRAB = 0;
    let categoryNumber = 1;

    Object.entries(groupedData).forEach(([categoryName, items]) => {
      if (items.length === 0) return;

      // Cek halaman baru jika perlu
      if (lastY + 80 > pageHeight) {
        doc.addPage();
        lastY = 20;
      }

      // Header kategori
      doc.setFontSize(10).setFont(undefined, "bold");
      doc.text(`${categoryNumber}. ${categoryName}`, margin, lastY);
      lastY += 7;

      // Header tabel untuk kategori
      const categoryTableHead = [
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
        [
          "",
          "",
          "",
          "",
          "Material (b)",
          "Upah (c)",
          "Material (d=a*b)",
          "Upah (e=a*c)",
          "TOTAL HARGA (Rp)",
        ],
      ];

      let categoryTotal = 0;
      const categoryTableBody = items.map((item, index) => {
        const volume = parseFloat(item.volume) || 0;
        const hargaMaterial = parseFloat(item.harga_material) || 0;
        const hargaUpah = parseFloat(item.harga_upah) || 0;
        const totalMaterial = volume * hargaMaterial;
        const totalUpah = volume * hargaUpah;
        const totalHarga = totalMaterial + totalUpah;
        categoryTotal += totalHarga;
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

      // Tambah baris SUB TOTAL
      categoryTableBody.push([
        "",
        "",
        "",
        "",
        "",
        "SUB TOTAL",
        formatRupiah(categoryTotal),
        "",
        formatRupiah(categoryTotal),
      ]);

      autoTable(doc, {
        head: categoryTableHead,
        body: categoryTableBody,
        startY: lastY,
        margin: { left: margin, right: margin },
        tableWidth: pageWidth - margin * 2,
        theme: "grid",
        headStyles: {
          fillColor: [173, 216, 230],
          textColor: [0, 0, 0],
          halign: "center",
          valign: "middle",
          fontSize: 7,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 7,
          valign: "middle",
          lineColor: [150, 150, 150],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { cellWidth: "auto", minCellWidth: 35 },
          2: { halign: "center", cellWidth: 15 },
          3: { halign: "center", cellWidth: 15 },
          4: { halign: "right", cellWidth: 20 },
          5: { halign: "right", cellWidth: 20 },
          6: { halign: "right", cellWidth: 22 },
          7: { halign: "right", cellWidth: 22 },
          8: { halign: "right", cellWidth: 25, fontStyle: "bold" },
        },
        styles: {
          overflow: "linebreak",
          cellPadding: 1.5,
        },
        didParseCell: function (data) {
          // Style untuk baris SUB TOTAL
          if (data.row.index === categoryTableBody.length - 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
      });

      lastY = doc.lastAutoTable.finalY + 10;
      categoryNumber++;
    });

    // GRAND TOTAL untuk RAB
    if (lastY + 30 > pageHeight) {
      doc.addPage();
      lastY = 20;
    }

    const ppnRAB = grandTotalRAB * 0.11;
    const totalSetelahPPNRAB = grandTotalRAB + ppnRAB;

    // Tabel ringkasan total
    const totalTableBody = [
      ["TOTAL", formatRupiah(grandTotalRAB)],
      ["PPN 11%", formatRupiah(ppnRAB)],
      ["GRAND TOTAL", formatRupiah(totalSetelahPPNRAB)],
    ];

    autoTable(doc, {
      body: totalTableBody,
      startY: lastY,
      margin: { left: pageWidth - 90, right: margin },
      tableWidth: 80,
      theme: "grid",
      styles: {
        fontSize: 9,
        fontStyle: "bold",
        halign: "right",
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 25 },
        1: { halign: "right", cellWidth: 55 },
      },
      didParseCell: function (data) {
        if (data.row.index === 2) {
          // GRAND TOTAL row - ubah warna jadi biru mengikuti header table
          data.cell.styles.fillColor = [173, 216, 230];
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
    });

    lastY = doc.lastAutoTable.finalY + 15;
  }

  // =================================================================
  // LAPORAN OPNAME - FORMAT SEDERHANA
  // =================================================================
  if (submissions && submissions.length > 0) {
    // Selalu pindah ke halaman baru untuk section Opname
    doc.addPage();
    lastY = 20;

    // Header Laporan Opname
    doc.setFillColor(34, 139, 34);
    doc.rect(margin, lastY, pageWidth - margin * 2, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11).setFont(undefined, "bold");
    doc.text("LAPORAN OPNAME FINAL (APPROVED)", margin + 3, lastY + 7);
    doc.setTextColor(0, 0, 0);
    lastY += 15;

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
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
      theme: "grid",
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7,
        valign: "middle",
        lineColor: [150, 150, 150],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: "auto", minCellWidth: 50 },
        2: { halign: "center", cellWidth: 18 },
        3: { halign: "center", cellWidth: 15 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 18 },
        6: { halign: "right", cellWidth: 35, fontStyle: "bold" },
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 1.5,
      },
    });

    lastY = doc.lastAutoTable.finalY + 10;

    // GRAND TOTAL untuk Opname
    let grandTotalOpname = 0;
    submissions.forEach((item) => {
      grandTotalOpname += parseFloat(item.total_harga_akhir) || 0;
    });

    const ppnOpname = grandTotalOpname * 0.11;
    const totalSetelahPPNOpname = grandTotalOpname + ppnOpname;

    // Tabel ringkasan total opname
    const totalOpnameTableBody = [
      ["TOTAL", formatRupiah(grandTotalOpname)],
      ["PPN 11%", formatRupiah(ppnOpname)],
      ["GRAND TOTAL", formatRupiah(totalSetelahPPNOpname)],
    ];

    autoTable(doc, {
      body: totalOpnameTableBody,
      startY: lastY,
      margin: { left: pageWidth - 90, right: margin },
      tableWidth: 80,
      theme: "grid",
      styles: {
        fontSize: 9,
        fontStyle: "bold",
        halign: "right",
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 25 },
        1: { halign: "right", cellWidth: 55 },
      },
      didParseCell: function (data) {
        if (data.row.index === 2) {
          // GRAND TOTAL row
          data.cell.styles.fillColor = [34, 139, 34];
          data.cell.styles.textColor = [255, 255, 255];
        }
      },
    });

    lastY = doc.lastAutoTable.finalY + 15;
  }

  // --- FOOTER ---
  const addFooter = (pageNum) => {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${pageNum} - Dicetak pada: ${new Date().toLocaleString(
        "id-ID"
      )}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);
  };

  // Tambahkan footer ke halaman pertama
  addFooter(1);

  // --- LAMPIRAN FOTO ---
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
    let pageNum = 2;

    // Header halaman foto
    doc.setFillColor(229, 30, 37);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12).setFont(undefined, "bold");
    doc.text("LAMPIRAN FOTO BUKTI", pageWidth / 2, 13, { align: "center" });
    doc.setTextColor(0, 0, 0);

    let photoY = 30;
    let photoCount = 0;
    let columnIndex = 0; // 0 untuk kolom kiri, 1 untuk kolom kanan
    const columnWidth = (pageWidth - margin * 3) / 2; // Lebar untuk 2 kolom
    const leftColumnX = margin;
    const rightColumnX = margin + columnWidth + margin;

    itemsWithPhotos.forEach((item) => {
      const imgData = photoMap[item.jenis_pekerjaan];
      if (imgData) {
        const imgProps = doc.getImageProperties(imgData);
        const maxWidth = columnWidth - 10; // Sesuaikan dengan lebar kolom
        const maxHeight = 80;
        let imgWidth = maxWidth;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }

        // Tentukan posisi X berdasarkan kolom
        const currentX = columnIndex === 0 ? leftColumnX : rightColumnX;

        // Cek apakah perlu halaman baru
        if (photoY + imgHeight + 35 > pageHeight - 20) {
          // Tambah space lebih untuk judul multi-line
          addFooter(pageNum);
          doc.addPage();
          pageNum++;
          photoY = 30;
          columnIndex = 0; // Reset ke kolom kiri
        }

        // PERBAIKAN: Judul foto dengan text wrapping
        doc.setFontSize(8).setFont(undefined, "bold"); // Kurangi font size
        const titleMaxWidth = columnWidth - 10; // Max width untuk judul
        const titleLines = wrapText(
          doc,
          `${++photoCount}. ${item.jenis_pekerjaan}`,
          titleMaxWidth
        );

        // Render setiap baris judul
        let titleY = photoY;
        titleLines.forEach((line, lineIndex) => {
          doc.text(line, currentX, titleY);
          titleY += 4; // Spacing antar baris
        });

        // Hitung tinggi total judul
        const titleHeight = titleLines.length * 4;
        const imageStartY = photoY + titleHeight + 2; // Tambah sedikit space

        // Gambar dengan border
        doc.setLineWidth(0.5);
        doc.rect(currentX, imageStartY, imgWidth + 4, imgHeight + 4);
        doc.addImage(
          imgData,
          currentX + 2,
          imageStartY + 2,
          imgWidth,
          imgHeight
        );

        // Pindah ke kolom kanan atau baris berikutnya
        if (columnIndex === 0) {
          columnIndex = 1; // Pindah ke kolom kanan
        } else {
          columnIndex = 0; // Reset ke kolom kiri
          photoY = imageStartY + imgHeight + 15; // Pindah ke baris berikutnya dengan spacing yang cukup
        }
      }
    });

    addFooter(pageNum);
  }

  doc.save(`Laporan_Opname_dan_RAB_${selectedStore.kode_toko}.pdf`);
  console.log("PDF dengan format kategori berhasil dibuat.");
};
