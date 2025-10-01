const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = 3000;
const CLIENT_ORIGIN = "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

console.log(__dirname);
const DATA_FILE = path.join(__dirname, "data", "courses.json");
console.log(DATA_FILE)

async function readCourses() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
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

app.get("/", (req, res) => {
  res
    .type("text/plain")
    .send("Express is up. Try GET /api/courses or /api/courses/:id");
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`CORS allowed for: ${CLIENT_ORIGIN}`);
});
