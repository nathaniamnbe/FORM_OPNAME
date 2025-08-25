import { GoogleSpreadsheet } from "google-spreadsheet";

// Inisialisasi koneksi ke Google Sheets
const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

const initAuth = async () => {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });
  await doc.loadInfo(); // Memuat properti dokumen
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await initAuth();
    const sheet = doc.sheetsByTitle["users"]; // 'users' adalah nama sheet di Spreadsheet Anda
    if (!sheet) {
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

    const rows = await sheet.getRows();
    const userRow = rows.find(
      (row) => row.username === username && row.password === password
    );

    if (userRow) {
      // User ditemukan
      const userData = {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        role: userRow.role,
        // Tambahkan properti spesifik berdasarkan role
        ...(userRow.role === "pic" && { store: userRow.store }),
        ...(userRow.role === "kontraktor" && { company: userRow.company }),
      };

      res.status(200).json(userData);
    } else {
      // User tidak ditemukan
      res.status(401).json({ message: "Username atau password salah" });
    }
  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}
