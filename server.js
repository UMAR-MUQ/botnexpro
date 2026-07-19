require("dotenv").config();
const express = require("express");
const path    = require("path");
const fs      = require("fs");

const PORT = process.env.PORT || 3000;

// ── About ma'lumotlari ────────────────────────────────────
const ABOUT_FILE = path.join(__dirname, "about.json");

function loadAboutData() {
  try {
    if (fs.existsSync(ABOUT_FILE)) {
      return JSON.parse(fs.readFileSync(ABOUT_FILE, "utf8"));
    }
  } catch (e) {}
  return {
    text:      "NexCode.uz — professional Telegram botlar, web saytlar va raqamli yechimlar yaratish bo'yicha xizmat ko'rsatuvchi kompaniya.",
    phone:     "+998 90 000 00 00",
    telegram:  "@nexcodeuz",
    instagram: "@nexcodeuz",
    projects:  "50+",
    clients:   "30+",
    years:     "2+",
  };
}

// ── Express ───────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Root — index.html ga data inject qilib yuborish
app.get("/", (req, res) => {
  try {
    const d    = loadAboutData();
    let   html = fs.readFileSync(path.join(__dirname, "webapp", "index.html"), "utf8");
    html = html.replace("</head>", `<script>window.NEXCODE_DATA=${JSON.stringify(d)};</script></head>`);
    res.send(html);
  } catch (e) {
    res.status(500).send("Xato: " + e.message);
  }
});

// Static fayllar (style.css, app.js)
app.use(express.static(path.join(__dirname, "webapp")));

// About API
app.get("/about-info", (req, res) => {
  res.json(loadAboutData());
});

// Zakaz qabul qilish
app.post("/send-order", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ ok: false });
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_ID  = process.env.ADMIN_ID;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    ADMIN_ID,
        text:       text,
        parse_mode: "Markdown",
      }),
    });
    const result = await response.json();
    res.json({ ok: result.ok });
  } catch (e) {
    console.error("Zakaz yuborishda xato:", e.message);
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Web server ishga tushdi: http://0.0.0.0:${PORT}`);
});

module.exports = { loadAboutData };
