const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = 3000;
const CLIENT_ORIGIN = "http://localhost:5173";

const STORAGE_MODE = process.env.STORAGE_MODE || "jsonl";
const DATA_DIR = path.join(__dirname, "data");
const COURSES_FILE = path.join(DATA_DIR, "courses.json");
const APPLICATIONS_FILE_JSONL = path.join(DATA_DIR, "applications.jsonl");
const APPLICATIONS_FILE_CSV = path.join(DATA_DIR, "applications.csv");

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Could not create data directory", err);
  }
}

async function readCourses() {
  const raw = await fs.readFile(COURSES_FILE, "utf-8");
  return JSON.parse(raw);
}

async function appendCsv(data) {
  const filePath = APPLICATIONS_FILE_CSV;
  const headers = "id,timestamp,fullName,email,phone,courseId,note\n";
  
  const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
  
  const line = [
    data.id,
    data.timestamp,
    data.fullName,
    data.email,
    data.phone,
    data.courseId,
    data.note,
  ]
    .map(escape)
    .join(",");

  try {
    let fileExists = true;
    let size = 0;
    try {
      const stat = await fs.stat(filePath);
      size = stat.size;
    } catch (e) {
      fileExists = false;
    }
    
    if (!fileExists || size === 0) {
      await fs.appendFile(filePath, headers + line + "\n");
    } else {
      await fs.appendFile(filePath, line + "\n");
    }
  } catch (err) {
    console.error("Failed to write to CSV", err);
    throw new Error("CSV_WRITE_ERROR");
  }
}

async function appendJsonl(data) {
  const filePath = APPLICATIONS_FILE_JSONL;
  const line = JSON.stringify(data) + "\n";
  try {
    await fs.appendFile(filePath, line);
  } catch (err) {
    console.error("Failed to write to JSONL", err);
    throw new Error("JSONL_WRITE_ERROR");
  }
}

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express 1" });
});

app.get("/api/courses", async (req, res) => {
  try {
    const list = await readCourses();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const list = await readCourses();
    const item = list.find((c) => c.id === id);
    if (!item) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

app.post("/api/applications", async (req, res) => {
  const { fullName, email, phone, courseId, note } = req.body;
  const errors = {};

  if (!fullName || String(fullName).trim().length < 2) {
    errors.fullName = "ПІБ є обов'язковим (мін. 2 символи)";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Введіть коректний email";
  }
  
  if (!courseId) {
    errors.courseId = "Необхідно обрати курс";
  }
  
  if (note && String(note).length > 1000) {
    errors.note = "Коментар не може перевищувати 1000 символів";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const applicationData = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    fullName: String(fullName).trim(),
    email: String(email).trim(),
    phone: String(phone || "").trim(),
    courseId: Number(courseId),
    note: String(note || "").trim(),
  };

  try {
    if (STORAGE_MODE === "csv") {
      await appendCsv(applicationData);
    } else {
      await appendJsonl(applicationData);
    }
    
    res.status(201).json({ 
      message: "Заявку успішно надіслано!",
      data: applicationData 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка на сервері під час збереження заявки" });
  }
});

app.get("/", (req, res) => {
  res
    .type("text/plain")
    .send("Express is up. Try GET /api/courses or POST /api/applications");
});

app.listen(PORT, async () => {
  await ensureDataDir();
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`CORS allowed for: ${CLIENT_ORIGIN}`);
  console.log(`Storage mode: ${STORAGE_MODE.toUpperCase()}`);
});