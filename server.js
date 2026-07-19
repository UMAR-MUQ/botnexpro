require("dotenv").config();
const express = require("express");
const path    = require("path");
const fs      = require("fs");

const PORT     = process.env.PORT || 3000;
const ADMIN_ID = process.env.ADMIN_ID;

// ── Config fayl ───────────────────────────────────────────
const CFG_FILE = path.join(__dirname, "config.json");

const DEFAULT_CFG = {
  phone:     "+998 90 000 00 00",
  telegram:  "@botnexpro_admin",
  instagram: "@botnexpro",
  about:     "BotNexPro — professional Telegram botlar, web saytlar va raqamli yechimlar yaratish bo'yicha xizmat ko'rsatuvchi kompaniya.",
  projects:  "50+",
  clients:   "30+",
  years:     "2+",
};

function loadCfg() {
  try {
    if (fs.existsSync(CFG_FILE))
      return { ...DEFAULT_CFG, ...JSON.parse(fs.readFileSync(CFG_FILE, "utf8")) };
  } catch (e) {}
  return { ...DEFAULT_CFG };
}

function saveCfg(data) {
  const cfg = { ...loadCfg(), ...data };
  fs.writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 2), "utf8");
  return cfg;
}

// ── Express ───────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,X-Admin-Id,Origin,Accept");
  res.header("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});
app.use(express.static(path.join(__dirname, "webapp")));

// ── Root ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp", "index.html"));
});

// ── Config olish (hammaga) ────────────────────────────────
app.get("/cfg", (req, res) => {
  res.json(loadCfg());
});

// ── Config saqlash (faqat admin) ──────────────────────────
app.post("/cfg", (req, res) => {
  const adminHeader = req.headers["x-admin-id"];
  if (adminHeader !== ADMIN_ID) {
    return res.status(403).json({ ok: false, error: "Ruxsat yo'q" });
  }
  try {
    const cfg = saveCfg(req.body);
    console.log("✅ Config yangilandi");
    res.json({ ok: true, cfg });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Zakaz qabul qilish ────────────────────────────────────
app.post("/order", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ ok: false });
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: "Markdown" }),
    });
    const result = await r.json();
    res.json({ ok: result.ok });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server: http://0.0.0.0:${PORT}`);
});

module.exports = { loadCfg };
