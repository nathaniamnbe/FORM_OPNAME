// server.mjs - Versi Final Lengkap dengan Fix untuk OpenSSL Error

// 1. Impor semua library yang dibutuhkan
import express from "express";
import cors from "cors";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import sharp from "sharp";
import crypto from "crypto";

// 2. Konfigurasi awal
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// 3. Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// 4. Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 5. Fungsi untuk memformat dan memvalidasi private key
const processPrivateKey = (key) => {
  if (!key) {
    throw new Error("GOOGLE_PRIVATE_KEY is missing");
  }

  // Remove extra quotes and whitespace
  let processedKey = key.trim().replace(/^["']|["']$/g, "");

  // Replace \\n with actual newlines
  processedKey = processedKey.replace(/\\n/g, "\n");

  // Ensure proper format
  if (!processedKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("Invalid private key format - missing BEGIN marker");
  }

  if (!processedKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error("Invalid private key format - missing END marker");
  }

  // Validate the key format more strictly
  const lines = processedKey.split("\n");
  if (lines.length < 3) {
    throw new Error("Private key appears to be malformed - too few lines");
  }

  return processedKey;
};

// 6. Alternative authentication setup with better error handling
let serviceAccountAuth;
let doc;
let authError = null;

const initializeGoogleAuth = async () => {
  try {
    console.log("🔄 Initializing Google Sheets authentication...");

    const privateKey = processPrivateKey(process.env.GOOGLE_PRIVATE_KEY);
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!email) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is missing");
    }
    if (!spreadsheetId) {
      throw new Error("SPREADSHEET_ID is missing");
    }

    // Try creating JWT auth with different configurations
    try {
      serviceAccountAuth = new JWT({
        email: email,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      // Test the authentication by getting an access token
      console.log("🔄 Testing JWT authentication...");
      await serviceAccountAuth.authorize();
      console.log("✅ JWT authentication successful");
    } catch (jwtError) {
      console.error("❌ JWT authentication failed:", jwtError.message);

      // Try alternative approach with manual token creation
      console.log("🔄 Trying alternative authentication method...");

      serviceAccountAuth = new JWT({
        email: email,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        keyId: null, // Explicitly set to null
      });

      await serviceAccountAuth.authorize();
      console.log("✅ Alternative authentication successful");
    }

    doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);

    // Test connection to spreadsheet
    console.log("🔄 Testing spreadsheet connection...");
    await doc.loadInfo();
    console.log(`✅ Connected to spreadsheet: ${doc.title}`);

    authError = null;
    return true;
  } catch (error) {
    console.error("❌ Google Sheets authentication failed:", error.message);
    console.error("Error details:", error);
    authError = error;
    return false;
  }
};

// Initialize authentication
const authInitialized = await initializeGoogleAuth();

// =================================================================
// FUNGSI BANTU
// =================================================================
const logLoginAttempt = async (username, status) => {
  try {
    if (!doc || authError) {
      console.log("⚠️  Google Sheets not available, skipping log");
      return;
    }

    await doc.loadInfo();
    const logSheet = doc.sheetsByTitle["log_login"];
    if (logSheet) {
      const timestamp = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      });
      await logSheet.addRow({ username, waktu: timestamp, status });
    }
  } catch (logError) {
    console.error("Gagal menulis ke log_login:", logError.message);
  }
};

// =================================================================
// API ENDPOINTS
// =================================================================

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server backend berjalan dengan baik",
    timestamp: new Date().toISOString(),
    status: "healthy",
    node_version: process.version,
    auth_status: authError ? "failed" : "ok",
  });
});

// Health check untuk Google Sheets connection
app.get("/api/health", async (req, res) => {
  try {
    if (authError) {
      return res.status(500).json({
        status: "error",
        message: "Google Sheets authentication failed",
        error: authError.message,
        node_version: process.version,
      });
    }

    if (!doc) {
      return res.status(500).json({
        status: "error",
        message: "Google Sheets not initialized",
      });
    }

    await doc.loadInfo();
    res.status(200).json({
      status: "ok",
      message: "All services are running",
      sheets_connected: true,
      spreadsheet_title: doc.title,
      timestamp: new Date().toISOString(),
      node_version: process.version,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
      node_version: process.version,
    });
  }
});

// Debug endpoint untuk environment variables (hanya untuk troubleshooting)
app.get("/api/debug/env", (req, res) => {
  res.status(200).json({
    node_version: process.version,
    has_private_key: !!process.env.GOOGLE_PRIVATE_KEY,
    has_email: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    has_spreadsheet_id: !!process.env.SPREADSHEET_ID,
    key_length: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    key_starts_with:
      process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) || "not found",
    auth_error: authError?.message || null,
    timestamp: new Date().toISOString(),
  });
});

// --- Endpoint Upload Foto (dengan konversi ke JPEG) ---
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Tidak ada file yang di-upload." });
    }
    const jpegBuffer = await sharp(req.file.buffer)
      .jpeg({ quality: 90 })
      .toBuffer();
    const uploadStream = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "opname_alfamart" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    };
    const result = await uploadStream(jpegBuffer);
    res.status(200).json({ link: result.secure_url });
  } catch (error) {
    console.error("Error saat upload ke Cloudinary:", error);
    res.status(500).json({ message: "Gagal meng-upload file." });
  }
});

// --- Endpoint Login dengan better error handling ---
app.post("/api/login", async (req, res) => {
  try {
    // Check if authentication was successful during initialization
    if (authError) {
      console.error("Authentication not available:", authError.message);
      return res.status(500).json({
        message: "Service authentication failed. Please contact administrator.",
        debug_info:
          process.env.NODE_ENV === "development"
            ? authError.message
            : undefined,
      });
    }

    if (!doc) {
      return res.status(500).json({
        message: "Service tidak tersedia. Silakan coba lagi nanti.",
      });
    }

    console.log("🔄 Attempting to load spreadsheet info for login...");
    await doc.loadInfo();
    console.log("✅ Spreadsheet info loaded successfully");

    const usersSheet = doc.sheetsByTitle["users"];
    if (!usersSheet) {
      console.error("❌ Sheet 'users' tidak ditemukan");
      return res
        .status(500)
        .json({ message: "Sheet 'users' tidak ditemukan." });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password diperlukan." });
    }

    const inputUsername = username.trim();
    const inputPassword = password.trim();

    console.log(`🔄 Getting user rows for login attempt: ${inputUsername}`);
    const rows = await usersSheet.getRows();
    console.log(`✅ Retrieved ${rows.length} user rows`);

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
        ...(userRow.get("role") === "pic" && {
          kode_toko: userRow.get("kode_toko"),
          no_ulok: userRow.get("no_ulok"),
        }),
        ...(userRow.get("role") === "kontraktor" && {
          company: userRow.get("company"),
        }),
      };
      console.log(`✅ Login successful for user: ${inputUsername}`);
      res.status(200).json(userData);
    } else {
      await logLoginAttempt(inputUsername, "FAILED");
      console.log(`❌ Login failed for user: ${inputUsername}`);
      res.status(401).json({ message: "Username atau password salah" });
    }
  } catch (error) {
    console.error("❌ Error di /api/login:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// --- ENDPOINT BARU: Mengambil data PIC dan Kontraktor berdasarkan no_ulok ---
app.get("/api/pic-kontraktor", async (req, res) => {
  try {
    const { no_ulok } = req.query;
    if (!no_ulok)
      return res.status(400).json({ message: "No. Ulok diperlukan." });

    if (!doc || authError) {
      return res.status(500).json({
        message: "Service tidak tersedia.",
      });
    }

    await doc.loadInfo();
    const rabSheet = doc.sheetsByTitle["data_rab"];
    if (!rabSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'data_rab' tidak ditemukan." });

    const rows = await rabSheet.getRows();
    const matchedRow = rows.find((row) => row.get("no_ulok") === no_ulok);

    if (matchedRow) {
      const picKontraktorData = {
        pic_username: matchedRow.get("pic_username") || "N/A",
        kontraktor_username: matchedRow.get("kontraktor_username") || "N/A",
      };
      res.status(200).json(picKontraktorData);
    } else {
      res.status(404).json({
        message: "Data tidak ditemukan untuk no_ulok tersebut.",
        pic_username: "N/A",
        kontraktor_username: "N/A",
      });
    }
  } catch (error) {
    console.error("Error di /api/pic-kontraktor:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      pic_username: "N/A",
      kontraktor_username: "N/A",
    });
  }
});

// --- Endpoint untuk PIC ---
app.get("/api/toko", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res.status(400).json({ message: "Username PIC diperlukan." });

    if (!doc || authError) {
      return res.status(500).json({
        message: "Service tidak tersedia.",
      });
    }

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
          no_ulok: row.get("no_ulok") || "",
          link_pdf: row.get("link_pdf") || "",
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

    if (!doc || authError) {
      return res.status(500).json({
        message: "Service tidak tersedia.",
      });
    }

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
          foto_url: row.get("foto_url"),
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
          jenis_pekerjaan,
          vol_rab: row.get("vol_rab"),
          satuan: row.get("satuan"),
          harga_material: row.get("harga_material") || 0,
          harga_upah: row.get("harga_upah") || 0,
          item_id: submittedData?.item_id || null,
          volume_akhir: submittedData?.volume_akhir || "",
          selisih: submittedData?.selisih || "",
          isSubmitted: !!submittedData,
          approval_status: submittedData?.approval_status || "Not Submitted",
          submissionTime: submittedData?.tanggal_submit || null,
          foto_url: submittedData?.foto_url || null,
        };
      });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error di /api/opname:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// --- ENDPOINT SUBMIT OPNAME ---
app.post("/api/opname/item/submit", async (req, res) => {
  try {
    const itemData = req.body;
    console.log("Data yang diterima:", itemData);

    if (!itemData || !itemData.kode_toko || !itemData.jenis_pekerjaan) {
      return res.status(400).json({ message: "Data item tidak lengkap." });
    }

    if (!doc || authError) {
      return res.status(500).json({
        message: "Service tidak tersedia.",
      });
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
        row.get("jenis_pekerjaan") === itemData.jenis_pekerjaan &&
        row.get("pic_username") === itemData.pic_username
    );

    if (existingRow) {
      return res.status(409).json({
        message:
          "Pekerjaan ini sudah pernah disimpan sebelumnya oleh PIC yang sama.",
      });
    }

    const timestamp = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });

    const item_id = `${itemData.kode_toko}-${itemData.jenis_pekerjaan.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}-${Date.now()}`;

    const submission_id = `SUB-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const rowToAdd = {
      submission_id: submission_id,
      kode_toko: itemData.kode_toko || "",
      nama_toko: itemData.nama_toko || "",
      pic_username: itemData.pic_username || "",
      tanggal_submit: timestamp,
      kategori_pekerjaan: itemData.kategori_pekerjaan || "",
      jenis_pekerjaan: itemData.jenis_pekerjaan || "",
      vol_rab: itemData.vol_rab || "",
      satuan: itemData.satuan || "",
      volume_akhir: itemData.volume_akhir || "",
      selisih: itemData.selisih || "",
      harga_material: itemData.harga_material || 0,
      harga_upah: itemData.harga_upah || 0,
      total_harga_akhir: itemData.total_harga_akhir || 0,
      foto_url: itemData.foto_url || "",
      item_id: item_id,
      approval_status: "Pending",
    };

    console.log("Data yang akan ditambahkan ke sheet:", rowToAdd);

    try {
      const newRow = await finalSheet.addRow(rowToAdd);
      console.log(
        "Baris berhasil ditambahkan dengan row number:",
        newRow.rowNumber
      );

      res.status(201).json({
        message: `Pekerjaan "${itemData.jenis_pekerjaan}" berhasil disimpan.`,
        item_id: item_id,
        submission_id: submission_id,
        tanggal_submit: timestamp,
        row_number: newRow.rowNumber,
        success: true,
      });
    } catch (sheetError) {
      console.error("Error saat menambah row ke sheet:", sheetError);
      res.status(500).json({
        message: "Gagal menambahkan data ke Google Sheets",
        error: sheetError.message,
      });
    }
  } catch (error) {
    console.error("Error di /api/opname/item/submit:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server saat menyimpan item.",
      error: error.message,
    });
  }
});

// === KONTRAKTOR ENDPOINTS ===

app.get("/api/toko_kontraktor", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return res
        .status(400)
        .json({ message: "Username Kontraktor diperlukan." });

    if (!doc || authError) {
      return res.status(500).json({ message: "Service tidak tersedia." });
    }

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
          no_ulok: row.get("no_ulok") || "",
          link_pdf: row.get("link_pdf") || "",
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

    if (!doc || authError) {
      return res.status(500).json({ message: "Service tidak tersedia." });
    }

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

    if (!doc || authError) {
      return res.status(500).json({ message: "Service tidak tersedia." });
    }

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
    const result = pendingItems.map((row) => ({
      item_id: row.get("item_id"),
      kode_toko: row.get("kode_toko"),
      nama_toko: row.get("nama_toko"),
      pic_username: row.get("pic_username"),
      tanggal_submit: row.get("tanggal_submit"),
      jenis_pekerjaan: row.get("jenis_pekerjaan"),
      volume_akhir: row.get("volume_akhir"),
    }));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error di /api/opname/pending:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

app.patch("/api/opname/approve", async (req, res) => {
  try {
    const { item_id } = req.body;
    if (!item_id)
      return res.status(400).json({ message: "Item ID diperlukan." });

    if (!doc || authError) {
      return res.status(500).json({ message: "Service tidak tersedia." });
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

app.get("/api/opname/final", async (req, res) => {
  try {
    const { kode_toko } = req.query;
    if (!kode_toko)
      return res.status(400).json({ message: "Kode toko diperlukan." });

    if (!doc || authError) {
      return res.status(500).json({ message: "Service tidak tersedia." });
    }

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
        kategori_pekerjaan: row.get("kategori_pekerjaan"),
        jenis_pekerjaan: row.get("jenis_pekerjaan"),
        vol_rab: row.get("vol_rab"),
        satuan: row.get("satuan"),
        harga_material: row.get("harga_material"),
        harga_upah: row.get("harga_upah"),
        volume_akhir: row.get("volume_akhir"),
        selisih: row.get("selisih"),
        total_harga_akhir: row.get("total_harga_akhir"),
        approval_status: row.get("approval_status"),
        foto_url: row.get("foto_url"),
        tanggal_submit: row.get("tanggal_submit"),
      }));
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error di /api/opname/final:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server saat membaca data final.",
    });
  }
});

// --- Endpoint baru untuk mengambil data RAB dari data_rab ---
app.get("/api/rab", async (req, res) => {
  try {
    const { kode_toko, no_ulok } = req.query;
    if (!kode_toko)
      return res.status(400).json({ message: "Kode toko diperlukan." });

    if (!doc) {
      return res.status(500).json({
        message: "Service tidak tersedia.",
      });
    }

    await doc.loadInfo();
    const rabSheet = doc.sheetsByTitle["data_rab"];
    if (!rabSheet)
      return res
        .status(500)
        .json({ message: "Sheet 'data_rab' tidak ditemukan." });

    const rows = await rabSheet.getRows();
    let rabItems = rows.filter((row) => row.get("kode_toko") === kode_toko);

    if (no_ulok) {
      rabItems = rabItems.filter((row) => row.get("no_ulok") === no_ulok);
    }

    const result = rabItems.map((row) => ({
      kategori_pekerjaan: row.get("kategori_pekerjaan"),
      jenis_pekerjaan: row.get("jenis_pekerjaan"),
      satuan: row.get("satuan"),
      volume: row.get("vol_rab"),
      harga_material: row.get("harga_material"),
      harga_upah: row.get("harga_upah"),
      total_harga: row.get("total_harga"),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error di /api/rab:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// --- Endpoint Jembatan/Proxy Gambar ---
app.get("/api/image-proxy", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send("URL gambar diperlukan.");
    }
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    console.error("Gagal mem-proxy gambar:", error);
    res.status(500).send("Gagal memuat gambar.");
  }
});

// --- ENDPOINT DEBUG untuk troubleshooting ---
app.get("/api/debug/opname-final", async (req, res) => {
  try {
    if (!doc) {
      return res.status(500).json({
        message: "Google Sheets not initialized",
      });
    }

    await doc.loadInfo();
    const finalSheet = doc.sheetsByTitle["opname_final"];
    if (!finalSheet) {
      return res
        .status(500)
        .json({ message: "Sheet 'opname_final' tidak ditemukan." });
    }

    const rows = await finalSheet.getRows();
    const allData = rows.map((row, index) => ({
      rowNumber: row.rowNumber,
      index: index,
      submission_id: row.get("submission_id") || "N/A",
      kode_toko: row.get("kode_toko") || "N/A",
      nama_toko: row.get("nama_toko") || "N/A",
      pic_username: row.get("pic_username") || "N/A",
      jenis_pekerjaan: row.get("jenis_pekerjaan") || "N/A",
      tanggal_submit: row.get("tanggal_submit") || "N/A",
      approval_status: row.get("approval_status") || "N/A",
    }));

    res.status(200).json({
      message: "Debug data dari opname_final",
      totalRows: rows.length,
      sheetTitle: finalSheet.title,
      data: allData,
    });
  } catch (error) {
    console.error("Error di /api/debug/opname-final:", error);
    res.status(500).json({
      message: "Error mengambil data debug",
      error: error.message,
    });
  }
});

// --- ENDPOINT DEBUG untuk melihat headers sheet ---
app.get("/api/debug/sheet-headers", async (req, res) => {
  try {
    if (!doc) {
      return res.status(500).json({
        message: "Google Sheets not initialized",
      });
    }

    await doc.loadInfo();
    const finalSheet = doc.sheetsByTitle["opname_final"];
    if (!finalSheet) {
      return res
        .status(500)
        .json({ message: "Sheet 'opname_final' tidak ditemukan." });
    }

    await finalSheet.loadHeaderRow();

    res.status(200).json({
      message: "Headers dari sheet opname_final",
      headers: finalSheet.headerValues,
      sheetTitle: finalSheet.title,
    });
  } catch (error) {
    console.error("Error di /api/debug/sheet-headers:", error);
    res.status(500).json({
      message: "Error mengambil headers sheet",
      error: error.message,
    });
  }
});

// --- Error handling middleware ---
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// 6. Menjalankan server
app.listen(port, () => {
  console.log(`✅ Server backend berjalan di http://localhost:${port}`);
  console.log("🔗 Endpoints yang tersedia:");
  console.log(`- Health Check: http://localhost:${port}/`);
  console.log(`- API Health: http://localhost:${port}/api/health`);
  console.log(
    `- Debug Opname: http://localhost:${port}/api/debug/opname-final`
  );
  console.log(
    `- Debug Headers: http://localhost:${port}/api/debug/sheet-headers`
  );

  if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.log(
      "⚠️  WARNING: GOOGLE_PRIVATE_KEY environment variable tidak ditemukan"
    );
  }
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.log(
      "⚠️  WARNING: GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable tidak ditemukan"
    );
  }
  if (!process.env.SPREADSHEET_ID) {
    console.log(
      "⚠️  WARNING: SPREADSHEET_ID environment variable tidak ditemukan"
    );
  }
});
