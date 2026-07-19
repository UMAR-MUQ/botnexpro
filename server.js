require("dotenv").config();
const express = require("express");
const path    = require("path");
const fs      = require("fs");

const PORT          = process.env.PORT || 3000;
const ADMIN_ID      = process.env.ADMIN_ID;
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
const GITHUB_REPO   = process.env.GITHUB_REPO   || "UMAR-MUQ/nexcode-miniapp";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "gh-pages";
const CFG_FILENAME  = "config.json";

const DEFAULT_CFG = {
  phone:     "+998 90 000 00 00",
  telegram:  "@botnexpro_admin",
  instagram: "@botnexpro",
  about:     "BotNexPro — professional Telegram botlar, web saytlar va raqamli yechimlar yaratish bo'yicha xizmat ko'rsatuvchi kompaniya.",
  projects:  "50+",
  clients:   "30+",
  years:     "2+",
};

// ── GitHub API orqali config o'qish ───────────────────────
async function getCfgFromGitHub() {
  try {
    const r = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${CFG_FILENAME}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );
    if (!r.ok) return { ...DEFAULT_CFG };
    const data = await r.json();
    const content = Buffer.from(data.content, "base64").toString("utf8");
    return { ...DEFAULT_CFG, ...JSON.parse(content) };
  } catch (e) {
    console.error("GitHub cfg read xato:", e.message);
    return { ...DEFAULT_CFG };
  }
}

// ── GitHub API orqali config yozish ───────────────────────
async function saveCfgToGitHub(cfg) {
  // Avval SHA olish (mavjud faylni yangilash uchun)
  let sha = null;
  try {
    const r = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${CFG_FILENAME}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );
    if (r.ok) { const d = await r.json(); sha = d.sha; }
  } catch (e) {}

  const body = {
    message: "config: update via admin panel",
    content: Buffer.from(JSON.stringify(cfg, null, 2), "utf8").toString("base64"),
    branch:  GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const r = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${CFG_FILENAME}`,
    {
      method:  "PUT",
      headers: {
        Authorization:  `token ${GITHUB_TOKEN}`,
        Accept:         "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!r.ok) {
    const err = await r.json();
    throw new Error(err.message || "GitHub write xato");
  }
  return true;
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp", "index.html"));
});

// ── Config olish (hammaga) ────────────────────────────────
app.get("/cfg", async (req, res) => {
  const cfg = await getCfgFromGitHub();
  res.json(cfg);
});

// ── Config saqlash (faqat admin) ──────────────────────────
app.post("/cfg", async (req, res) => {
  if (req.headers["x-admin-id"] !== ADMIN_ID) {
    return res.status(403).json({ ok: false, error: "Ruxsat yo'q" });
  }
  try {
    const cfg = { ...DEFAULT_CFG, ...req.body };
    await saveCfgToGitHub(cfg);
    console.log("✅ Config GitHub ga saqlandi");
    res.json({ ok: true, cfg });
  } catch (e) {
    console.error("Config save xato:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Zakaz ─────────────────────────────────────────────────
app.post("/order", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ ok: false });
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: "Markdown" }),
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
