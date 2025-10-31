const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const app = express();
const PORT = 3000;
const CLIENT_ORIGIN = "http://localhost:5173";
const JWT_SECRET = "your-very-secret-key-change-it";

const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const COURSES_FILE = path.join(DATA_DIR, "courses.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const APPLICATIONS_FILE_JSONL = path.join(DATA_DIR, "applications.jsonl");
const APPLICATIONS_FILE_CSV = path.join(DATA_DIR, "applications.csv");
const STORAGE_MODE = process.env.STORAGE_MODE || "jsonl";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(UPLOADS_DIR));

async function ensureDirs() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error("Could not create necessary directories", err);
  }
}

async function atomicWrite(filePath, data) {
  const tempFile = filePath + ".tmp";
  try {
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
    await fs.rename(tempFile, filePath);
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    try {
      await fs.unlink(tempFile);
    } catch (e) {}
  }
}

async function readData(file) {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${file}`, e);
    return [];
  }
}

const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.sub}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await readData(USERS_FILE);
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, name: user.name, role: user.role }, 
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, { /* ... */ });

  res.json({ 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    avatarUrl: user.avatarUrl || null 
  });
});

app.get("/api/me", protect, async (req, res) => { 
  try {
   
    const users = await readData(USERS_FILE);
    const user = users.find(u => u.id === req.user.sub);

    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ error: "User not found" });
    }

    const userData = {
      sub: user.id,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl || null 
    };


    res.json(userData);

  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

app.post(
  "/api/uploads/avatar",
  protect, 
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    try {
    
      const users = await readData(USERS_FILE);
      let updatedUser = null;

      const updatedUsers = users.map(user => {
        if (user.id === req.user.sub) {
          updatedUser = { ...user, avatarUrl: fileUrl };
          return updatedUser;
        }
        return user;
      });

 
      await atomicWrite(USERS_FILE, updatedUsers);
     

  
      res.json({ 
        url: fileUrl, 
        user: { 
           sub: updatedUser.id, 
           name: updatedUser.name, 
           role: updatedUser.role, 
           avatarUrl: updatedUser.avatarUrl 
        } 
      });

    } catch (e) {
      console.error("Failed to update user avatar in users.json", e);
      return res.status(500).json({ error: "Failed to save avatar data" });
    }
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

app.get("/api/courses", async (req, res) => {
  try {
    const {
      query = "",
      page = 1,
      limit = 9,
      sort = "popularity",
      order = "desc",
    } = req.query;

    const list = await readData(COURSES_FILE);

    const lowerQuery = query.toLowerCase();
    let filtered = list.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );

    filtered.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const items = filtered.slice(startIndex, endIndex);

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const list = await readData(COURSES_FILE);
    const item = list.find((c) => c.id === id);
    if (!item) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

app.post("/api/courses", protect, adminOnly, async (req, res) => {
  try {
    const { title, category, price, popularity, tags, description } = req.body;
    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required" });
    }

    const list = await readData(COURSES_FILE);
    const newCourse = {
      id: Date.now(),
      title,
      category,
      price: Number(price),
      popularity: Number(popularity) || 50,
      tags: tags || [],
      description: description || "",
    };

    list.push(newCourse);
    await atomicWrite(COURSES_FILE, list);
    res.status(201).json(newCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

app.patch("/api/courses/:id", protect, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    const list = await readData(COURSES_FILE);

    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Course not found" });
    }

    list[index] = { ...list[index], ...updates };

    await atomicWrite(COURSES_FILE, list);
    res.json(list[index]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update course" });
  }
});

app.delete("/api/courses/:id", protect, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const list = await readData(COURSES_FILE);
    const newList = list.filter((c) => c.id !== id);

    if (list.length === newList.length) {
      return res.status(404).json({ error: "Course not found" });
    }

    await atomicWrite(COURSES_FILE, newList);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

app.post("/api/applications", async (req, res) => {
  console.log("Application received:", req.body);
  res.status(201).json({ message: "Заявку успішно надіслано!" });
});

app.listen(PORT, async () => {
  await ensureDirs();
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`CORS allowed for: ${CLIENT_ORIGIN}`);
});