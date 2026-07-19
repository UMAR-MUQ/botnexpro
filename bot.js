require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const express = require("express");
const path    = require("path");
const fs      = require("fs");

const BOT_TOKEN  = process.env.BOT_TOKEN;
const ADMIN_ID   = Number(process.env.ADMIN_ID);
const PORT       = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

if (!BOT_TOKEN) throw new Error("BOT_TOKEN .env faylida yo'q!");
if (!ADMIN_ID)  throw new Error("ADMIN_ID .env faylida yo'q!");

// ── About ma'lumotlari fayli ──────────────────────────────
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

function saveAboutData(data) {
  fs.writeFileSync(ABOUT_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ── Express server (Mini App uchun) ──────────────────────
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(express.static(path.join(__dirname, "webapp")));

// Root — index.html ga ma'lumotlarni inject qilib qaytarish
app.get("/", (req, res) => {
  try {
    const d = loadAboutData();
    let html = fs.readFileSync(path.join(__dirname, "webapp", "index.html"), "utf8");

    // Ma'lumotlarni HTML ga to'g'ridan-to'g'ri yozish
    html = html.replace(
      '</head>',
      `<script>
        window.NEXCODE_DATA = {
          text: ${JSON.stringify(d.text)},
          phone: ${JSON.stringify(d.phone)},
          telegram: ${JSON.stringify(d.telegram)},
          instagram: ${JSON.stringify(d.instagram)},
          projects: ${JSON.stringify(d.projects)},
          clients: ${JSON.stringify(d.clients)},
          years: ${JSON.stringify(d.years)}
        };
      </script>
      </head>`
    );
    res.send(html);
  } catch (e) {
    res.sendFile(path.join(__dirname, "webapp", "index.html"));
  }
});

// About ma'lumotlarini berish
app.get("/about-info", (req, res) => {
  res.json(loadAboutData());
});

// Zakaz qabul qilish
app.post("/send-order", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ ok: false });
  try {
    await bot.telegram.sendMessage(ADMIN_ID, text, { parse_mode: "Markdown" });
    res.json({ ok: true });
  } catch (e) {
    console.error("Zakaz yuborishda xato:", e.message);
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Web server: ${PUBLIC_URL}`);
});

// ── Bot ───────────────────────────────────────────────────
const bot = new Telegraf(BOT_TOKEN);
bot.use(session({ defaultSession: () => ({ step: null, data: {} }) }));

const isAdmin = (ctx) => ctx.from.id === ADMIN_ID;

// ── /start ────────────────────────────────────────────────
bot.start(async (ctx) => {
  ctx.session.step = "ism";
  ctx.session.data = {};
  await ctx.reply(
    "👋 Salom! Xush kelibsiz!\n\n📝 NexCode.uz ga ariza to'ldirish uchun bir necha savol beraman.\n\nIsmingizni kiriting:",
    Markup.removeKeyboard()
  );
});

// ── /webapp — Mini App ochish ─────────────────────────────
bot.command("webapp", async (ctx) => {
  await ctx.reply(
    "🚀 *NexCode.uz Mini App*\n\nQuyidagi tugmani bosing:",
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🌐 NexCode.uz ni ochish",
            web_app: { url: PUBLIC_URL }
          }
        ]]
      }
    }
  );
});

// ── /admin ────────────────────────────────────────────────
bot.command("admin", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = null;
  await ctx.reply(
    "🛠 *NexCode.uz — Admin Panel*\n\n"
    + "✏️ /setname — Bot nomini o'zgartirish\n"
    + "🖼 /setphoto — Bot rasmini o'zgartirish\n"
    + "📝 /setdesc — Bot tavsifini o'zgartirish\n"
    + "ℹ️ /setabout — Biz haqimizda matnini o'zgartirish\n"
    + "📞 /setphone — Telefon raqamni o'zgartirish\n"
    + "💬 /settelegram — Telegram username o'zgartirish\n"
    + "📸 /setinstagram — Instagram username o'zgartirish\n"
    + "🌐 /webapp — Mini App ni ko'rish\n"
    + "❌ /cancel — Bekor qilish",
    { parse_mode: "Markdown" }
  );
});

// ── Admin komandalar ──────────────────────────────────────
bot.command("setname", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setname";
  await ctx.reply("✏️ Yangi bot nomini yozing:\n(Bekor qilish: /cancel)");
});

bot.command("setphoto", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setphoto";
  await ctx.reply("🖼 Yangi bot rasmini yuboring:\n(Bekor qilish: /cancel)");
});

bot.command("setdesc", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setdesc";
  await ctx.reply("📝 Yangi bot tavsifini yozing:\n(Bekor qilish: /cancel)");
});

bot.command("setabout", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setabout";
  const d = loadAboutData();
  await ctx.reply(
    `ℹ️ Hozirgi matn:\n\n${d.text}\n\nYangi matnni yozing:\n(Bekor qilish: /cancel)`
  );
});

bot.command("setphone", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setphone";
  const d = loadAboutData();
  await ctx.reply(`📞 Hozirgi raqam: ${d.phone}\n\nYangi raqamni yozing:`);
});

bot.command("settelegram", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_settelegram";
  const d = loadAboutData();
  await ctx.reply(`💬 Hozirgi: ${d.telegram}\n\nYangi Telegram username yozing (@bilan):`);
});

bot.command("setinstagram", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setinstagram";
  const d = loadAboutData();
  await ctx.reply(`📸 Hozirgi: ${d.instagram}\n\nYangi Instagram username yozing (@bilan):`);
});

bot.command("cancel", async (ctx) => {
  ctx.session.step = null;
  ctx.session.data = {};
  await ctx.reply("❌ Bekor qilindi.", Markup.removeKeyboard());
});

// ── Rasm handler ──────────────────────────────────────────
bot.on("photo", async (ctx) => {
  if (!isAdmin(ctx) || ctx.session.step !== "admin_setphoto") return;
  try {
    const photos  = ctx.message.photo;
    const fileId  = photos[photos.length - 1].file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink.href);
    const buffer   = Buffer.from(await response.arrayBuffer());
    await ctx.telegram.setMyProfilePhoto({ source: buffer });
    ctx.session.step = null;
    await ctx.reply("✅ Bot rasmi muvaffaqiyatli o'zgartirildi!");
  } catch (e) {
    await ctx.reply("❌ Xato. @BotFather → /mybots → Edit Bot → Edit Botpic orqali o'zgartiring.");
    ctx.session.step = null;
  }
});

// ── Matn handler ──────────────────────────────────────────
bot.on("text", async (ctx) => {
  const step = ctx.session.step;
  const text = ctx.message.text;

  // ── Admin amallar ────────────────────────────────────────
  if (step === "admin_setname" && isAdmin(ctx)) {
    try {
      await ctx.telegram.setMyName(text);
      ctx.session.step = null;
      return ctx.reply(`✅ Bot nomi *"${text}"* ga o'zgartirildi!`, { parse_mode: "Markdown" });
    } catch (e) {
      ctx.session.step = null;
      return ctx.reply("❌ Xato: " + e.message);
    }
  }

  if (step === "admin_setdesc" && isAdmin(ctx)) {
    try {
      await ctx.telegram.setMyDescription(text);
      await ctx.telegram.setMyShortDescription(text.slice(0, 120));
      ctx.session.step = null;
      return ctx.reply("✅ Bot tavsifi o'zgartirildi!");
    } catch (e) {
      ctx.session.step = null;
      return ctx.reply("❌ Xato: " + e.message);
    }
  }

  if (step === "admin_setabout" && isAdmin(ctx)) {
    const d = loadAboutData();
    d.text = text;
    saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply("✅ \"Biz haqimizda\" matni yangilandi!");
  }

  if (step === "admin_setphone" && isAdmin(ctx)) {
    const d = loadAboutData();
    d.phone = text;
    saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply(`✅ Telefon raqam *${text}* ga o'zgartirildi!`, { parse_mode: "Markdown" });
  }

  if (step === "admin_settelegram" && isAdmin(ctx)) {
    const d = loadAboutData();
    d.telegram = text;
    saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply(`✅ Telegram *${text}* ga o'zgartirildi!`, { parse_mode: "Markdown" });
  }

  if (step === "admin_setinstagram" && isAdmin(ctx)) {
    const d = loadAboutData();
    d.instagram = text;
    saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply(`✅ Instagram *${text}* ga o'zgartirildi!`, { parse_mode: "Markdown" });
  }

  // ── Oddiy foydalanuvchi ───────────────────────────────────
  if (step === "ism") {
    ctx.session.data.ism = text;
    ctx.session.step = "familiya";
    return ctx.reply("✅ Qabul qilindi!\n\nFamiliyangizni kiriting:");
  }

  if (step === "familiya") {
    ctx.session.data.familiya = text;
    ctx.session.step = "telefon";
    return ctx.reply(
      "✅ Qabul qilindi!\n\nTelefon raqamingizni yuboring:",
      Markup.keyboard([[Markup.button.contactRequest("📱 Raqamni yuborish")]]).resize().oneTime()
    );
  }

  if (step === "telefon") {
    ctx.session.data.telefon = text;
    ctx.session.step = "bot_tavsif";
    return ctx.reply(
      "✅ Qabul qilindi!\n\n💬 Sizga qanday xizmat kerak?\nIltimos, batafsil izohlang:",
      Markup.removeKeyboard()
    );
  }

  if (step === "bot_tavsif") {
    ctx.session.data.bot_tavsif = text;
    ctx.session.step = null;

    await ctx.reply("✅ *Arizangiz qabul qilindi!*\n\n*NexCode.uz* jamoasi tez orada siz bilan bog'lanadi. 🙏", {
      parse_mode: "Markdown"
    });

    const d = ctx.session.data;
    const user = ctx.from;
    const username = user.username ? `@${user.username}` : "username yo'q";
    const adminText =
      `🔔 *Yangi ariza! — NexCode.uz*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Ism:* ${d.ism}\n` +
      `👤 *Familiya:* ${d.familiya}\n` +
      `📞 *Telefon:* ${d.telefon}\n` +
      `💬 *Xizmat:*\n${d.bot_tavsif}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🆔 ID: \`${user.id}\`\n` +
      `🔗 Username: ${username}`;

    try {
      await bot.telegram.sendMessage(ADMIN_ID, adminText, { parse_mode: "Markdown" });
    } catch (e) {
      console.error("❌ Adminga yuborishda xato:", e.message);
    }
    return;
  }

  await ctx.reply("Botni boshlash uchun /start bosing.");
});

// ── Kontakt ───────────────────────────────────────────────
bot.on("contact", async (ctx) => {
  if (ctx.session.step !== "telefon") return;
  let phone = ctx.message.contact.phone_number;
  if (!phone.startsWith("+")) phone = "+" + phone;
  ctx.session.data.telefon = phone;
  ctx.session.step = "bot_tavsif";
  await ctx.reply(
    "✅ Qabul qilindi!\n\n💬 Sizga qanday xizmat kerak?\nIltimos, batafsil izohlang:",
    Markup.removeKeyboard()
  );
});

// ── Ishga tushirish ───────────────────────────────────────
bot.launch().then(() => {
  console.log("✅ NexCode.uz Bot ishga tushdi!");
});

process.once("SIGINT",  () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
