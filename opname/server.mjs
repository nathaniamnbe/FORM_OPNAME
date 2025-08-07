// server.mjs - Versi Final Lengkap dengan DEBUG

import express from "express";
import cors from "cors";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
  process.env.SPREADSHEET_ID,
  serviceAccountAuth
);

const logLoginAttempt = async (username, status) => {
  try {
    await doc.loadInfo();
    const logSheet = doc.sheetsByTitle["log_login"];
    if (logSheet) {
      const timestamp = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      });
      await logSheet.addRow({ username, waktu: timestamp, status });
    }
  } catch (logError) {
    console.error("Gagal menulis ke log_login:", logError);
  }
};

// --- AUTHENTICATION ---
app.post("/api/login", async (req, res) => {
  try {
    await doc.loadInfo();
    const usersSheet = doc.sheetsByTitle["users"];
    if (!usersSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'users' tidak ditemukan." });
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username dan password diperlukan." });
    const inputUsername = username.trim();
    const inputPassword = password.trim();
    const rows = await usersSheet.getRows();
    const userRow = rows.find((row) => {
      const sheetUsername = row.get("username")?.trim();
      const sheetPassword = row.get("password")?.toString().trim();
      return (
        sheetUsername?.toLowerCase() === inputUsername.toLowerCase() &&
        sheetPassword === inputPassword
      );
    });
    if (userRow) {
      await logLoginAttempt(inputUsername, "SUCCESS");
      const userData = {
        id: userRow.get("id"),
        username: userRow.get("username"),
        name: userRow.get("name"),
        role: userRow.get("role"),
        ...(userRow.get("role") === "pic" && { store: userRow.get("store") }),
        ...(userRow.get("role") === "kontraktor" && {
          company: userRow.get("company"),
        }),
      };
      res.status(200).json(userData);
    } else {
      await logLoginAttempt(inputUsername, "FAILED");
      res.status(401).json({ message: "Username atau password salah" });
    }
  } catch (error) {
    console.error("Error di /api/login:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// --- PIC WORKFLOW ---
app.get("/api/toko", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res.status(400).json({ message: "Username PIC diperlukan." });
    await doc.loadInfo();
    const rabSheet = doc.sheetsByTitle["data_rab"];
    if (!rabSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'data_rab' tidak ditemukan." });
    const rows = await rabSheet.getRows();
    const assignedRows = rows.filter(
      (row) => row.get("pic_username") === username
    );
    const storesMap = new Map();
    assignedRows.forEach((row) => {
      const kode_toko = row.get("kode_toko");
      if (!storesMap.has(kode_toko)) {
        storesMap.set(kode_toko, {
          kode_toko: kode_toko,
          nama_toko: row.get("nama_toko"),
        });
      }
    });
    res.status(200).json(Array.from(storesMap.values()));
  } catch (error) {
    console.error("Error di /api/toko:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});
app.get("/api/opname", async (req, res) => {
  try {
    const { kode_toko } = req.query;
    if (!kode_toko)
      return res.status(400).json({ message: "Kode toko diperlukan." });
    await doc.loadInfo();
    const rabSheet = doc.sheetsByTitle["data_rab"];
    const finalSheet = doc.sheetsByTitle["opname_final"];
    if (!rabSheet || !finalSheet)
      return res
        .status(500)
        .json({ message: "Sheet data_rab atau opname_final tidak ditemukan." });
    const [rabRows, finalRows] = await Promise.all([
      rabSheet.getRows(),
      finalSheet.getRows(),
    ]);
    const submittedTasks = finalRows
      .filter((row) => row.get("kode_toko") === kode_toko)
      .reduce((acc, row) => {
        acc[row.get("jenis_pekerjaan")] = {
          item_id: row.get("item_id"),
          volume_akhir: row.get("volume_akhir"),
          selisih: row.get("selisih"),
          approval_status: row.get("approval_status"),
          tanggal_submit: row.get("tanggal_submit"),
        };
        return acc;
      }, {});
    const tasks = rabRows
      .filter((row) => row.get("kode_toko") === kode_toko)
      .map((row) => {
        const jenis_pekerjaan = row.get("jenis_pekerjaan");
        const submittedData = submittedTasks[jenis_pekerjaan];
        return {
          kategori_pekerjaan: row.get("kategori_pekerjaan"),
          jenis_pekerjaan: jenis_pekerjaan,
          vol_rab: row.get("vol_rab"),
          satuan: row.get("satuan"),
          item_id: submittedData?.item_id || null,
          volume_akhir: submittedData?.volume_akhir || "",
          selisih: submittedData?.selisih || "",
          isSubmitted: !!submittedData,
          approval_status: submittedData?.approval_status || "Not Submitted",
          submissionTime: submittedData?.tanggal_submit || null,
        };
      });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error di /api/opname:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// --- DATA SUBMISSION ---
app.post("/api/opname/item/submit", async (req, res) => {
  try {
    const itemData = req.body;
    if (!itemData || !itemData.kode_toko || !itemData.jenis_pekerjaan) {
      return res.status(400).json({ message: "Data item tidak lengkap." });
    }
    await doc.loadInfo();
    const finalSheet = doc.sheetsByTitle["opname_final"];
    if (!finalSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'opname_final' tidak ditemukan." });
    const rows = await finalSheet.getRows();
    const existingRow = rows.find(
      (row) =>
        row.get("kode_toko") === itemData.kode_toko &&
        row.get("jenis_pekerjaan") === itemData.jenis_pekerjaan
    );
    if (existingRow) {
      return res
        .status(409)
        .json({ message: "Pekerjaan ini sudah pernah disimpan sebelumnya." });
    }
    const timestamp = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
    const item_id = `${itemData.kode_toko}-${itemData.jenis_pekerjaan.replace(
      /\s/g,
      ""
    )}-${Date.now()}`;
    const rowToAdd = {
      ...itemData,
      item_id,
      tanggal_submit: timestamp,
      approval_status: "Pending",
    };
    // ===== DEBUG LOG 1 =====
    console.log("\nDEBUG: Data yang AKAN DISIMPAN ke sheet:", rowToAdd);
    await finalSheet.addRow(rowToAdd);
    res
      .status(201)
      .json({
        message: `Pekerjaan berhasil disimpan.`,
        item_id,
        tanggal_submit: timestamp,
      });
  } catch (error) {
    console.error("Error di /api/opname/item/submit:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server saat menyimpan item." });
  }
});

// --- KONTRAKTOR WORKFLOW ---
app.get("/api/toko_kontraktor", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res
        .status(400)
        .json({ message: "Username Kontraktor diperlukan." });
    await doc.loadInfo();
    const rabSheet = doc.sheetsByTitle["data_rab"];
    if (!rabSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'data_rab' tidak ditemukan." });
    const rows = await rabSheet.getRows();
    const assignedRows = rows.filter(
      (row) => row.get("kontraktor_username") === username
    );
    const storesMap = new Map();
    assignedRows.forEach((row) => {
      const kode_toko = row.get("kode_toko");
      if (!storesMap.has(kode_toko)) {
        storesMap.set(kode_toko, {
          kode_toko,
          nama_toko: row.get("nama_toko"),
        });
      }
    });
    res.status(200).json(Array.from(storesMap.values()));
  } catch (error) {
    console.error("Error di /api/toko_kontraktor:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

app.get("/api/opname/pending/counts", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res
        .status(400)
        .json({ message: "Username Kontraktor diperlukan." });
    await doc.loadInfo();
    const finalSheet = doc.sheetsByTitle["opname_final"];
    const rabSheet = doc.sheetsByTitle["data_rab"];
    if (!finalSheet || !rabSheet)
      return res
        .status(500)
        .json({ message: "Sheet opname_final atau data_rab tidak ditemukan." });
    const [finalRows, rabRows] = await Promise.all([
      finalSheet.getRows(),
      rabSheet.getRows(),
    ]);
    const storeContractorMap = new Map();
    rabRows.forEach((row) =>
      storeContractorMap.set(
        row.get("kode_toko"),
        row.get("kontraktor_username")
      )
    );
    const counts = {};
    finalRows.forEach((row) => {
      const status = row.get("approval_status");
      const storeId = row.get("kode_toko");
      if (
        status === "Pending" &&
        storeContractorMap.get(storeId) === username
      ) {
        counts[storeId] = (counts[storeId] || 0) + 1;
      }
    });
    res.status(200).json(counts);
  } catch (error) {
    console.error("Error di /api/opname/pending/counts:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

app.get("/api/opname/pending", async (req, res) => {
  try {
    const { kode_toko } = req.query;
    await doc.loadInfo();
    const finalSheet = doc.sheetsByTitle["opname_final"];
    if (!finalSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'opname_final' tidak ditemukan." });
    let rows = await finalSheet.getRows();
    let pendingItems = rows.filter(
      (row) => row.get("approval_status") === "Pending"
    );
    if (kode_toko) {
      pendingItems = pendingItems.filter(
        (row) => row.get("kode_toko") === kode_toko
      );
    }
    const result = pendingItems.map((row) => {
      const itemIdFromSheet = row.get("item_id");
      // ===== DEBUG LOG 2 =====
      console.log(
        `\nDEBUG: Membaca baris dari sheet. item_id mentah:`,
        itemIdFromSheet
      );
      return {
        item_id: itemIdFromSheet,
        kode_toko: row.get("kode_toko"),
        nama_toko: row.get("nama_toko"),
        pic_username: row.get("pic_username"),
        tanggal_submit: row.get("tanggal_submit"),
        jenis_pekerjaan: row.get("jenis_pekerjaan"),
        volume_akhir: row.get("volume_akhir"),
      };
    });
    // ===== DEBUG LOG 3 =====
    console.log("\nDEBUG: Data PENDING yang DIKIRIM ke frontend:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error di /api/opname/pending:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

app.patch("/api/opname/approve", async (req, res) => {
  try {
    const { item_id } = req.body;
    // ===== DEBUG LOG 5 =====
    console.log("\nDEBUG: Menerima permintaan APPROVE dengan body:", req.body);
    if (!item_id) {
      return res.status(400).json({ message: "Item ID diperlukan." });
    }
    await doc.loadInfo();
    const finalSheet = doc.sheetsByTitle["opname_final"];
    if (!finalSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'opname_final' tidak ditemukan." });
    const rows = await finalSheet.getRows();
    const rowToUpdate = rows.find((row) => row.get("item_id") === item_id);
    if (rowToUpdate) {
      rowToUpdate.set("approval_status", "Approved");
      await rowToUpdate.save();
      res.status(200).json({ message: "Opname berhasil di-approve." });
    } else {
      res.status(404).json({ message: "Item opname tidak ditemukan." });
    }
  } catch (error) {
    console.error("Error di /api/opname/approve:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// --- VIEWING FINAL DATA ---
app.get("/api/opname/final", async (req, res) => {
  try {
    const { kode_toko } = req.query;
    if (!kode_toko)
      return res.status(400).json({ message: "Kode toko diperlukan." });
    await doc.loadInfo();
    const finalSheet = doc.sheetsByTitle["opname_final"];
    if (!finalSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'opname_final' tidak ditemukan." });
    const rows = await finalSheet.getRows();
    const submissions = rows
      .filter(
        (row) =>
          row.get("kode_toko") === kode_toko &&
          row.get("approval_status") === "Approved"
      )
      .map((row) => ({
        submission_id: row.get("submission_id"),
        tanggal_submit: row.get("tanggal_submit"),
        kategori_pekerjaan: row.get("kategori_pekerjaan"),
        jenis_pekerjaan: row.get("jenis_pekerjaan"),
        vol_rab: row.get("vol_rab"),
        satuan: row.get("satuan"),
        volume_akhir: row.get("volume_akhir"),
        selisih: row.get("selisih"),
        approval_status: row.get("approval_status"),
      }));
    const groupedByDate = submissions.reduce((acc, current) => {
      const date = current.tanggal_submit.split(",")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(current);
      return acc;
    }, {});
    res.status(200).json(groupedByDate);
  } catch (error) {
    console.error("Error di /api/opname/final:", error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan pada server saat membaca data final.",
      });
  }
});

// 6. Menjalankan server
app.listen(port, () => {
  console.log(`Server backend berjalan di http://localhost:${port}`);
});
