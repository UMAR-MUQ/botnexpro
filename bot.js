require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const path = require("path");
const fs   = require("fs");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID  = Number(process.env.ADMIN_ID);
const WEBAPP_URL = "https://umar-muq.github.io/nexcode-miniapp?v=3";

if (!BOT_TOKEN) throw new Error("BOT_TOKEN .env faylida yo'q!");
if (!ADMIN_ID)  throw new Error("ADMIN_ID .env faylida yo'q!");

// ── Web server ────────────────────────────────────────────
require("./server");

// ── About fayl ────────────────────────────────────────────
const ABOUT_FILE = path.join(__dirname, "about.json");

function loadAboutData() {
  try {
    if (fs.existsSync(ABOUT_FILE))
      return JSON.parse(fs.readFileSync(ABOUT_FILE, "utf8"));
  } catch (e) {}
  return {
    text:      "BotNexPro — professional Telegram botlar, web saytlar va raqamli yechimlar yaratish bo'yicha xizmat ko'rsatuvchi kompaniya.",
    phone:     "+998 90 000 00 00",
    telegram:  "@botnexpro_admin",
    instagram: "@botnexpro",
    projects:  "50+",
    clients:   "30+",
    years:     "2+",
  };
}

function saveAboutData(data) {
  fs.writeFileSync(ABOUT_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ── Bot ───────────────────────────────────────────────────
const bot = new Telegraf(BOT_TOKEN);
bot.use(session({ defaultSession: () => ({ step: null, data: {} }) }));

const isAdmin = (ctx) => ctx.from.id === ADMIN_ID;

// Menu tugmasini o'rnatish
async function setMenuButton() {
  try {
    await bot.telegram.callApi("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "🌐 BotNexPro",
        web_app: { url: WEBAPP_URL }
      }
    });
    console.log("✅ Menu button o'rnatildi");
  } catch (e) {
    console.log("Menu button xato:", e.message);
  }
}

// ── /start ────────────────────────────────────────────────
bot.start(async (ctx) => {
  ctx.session.step = null;
  ctx.session.data = {};
  await ctx.reply(
    `👋 Salom, *${ctx.from.first_name}*!\n\n` +
    `🤖 *BotNexPro* ga xush kelibsiz!\n\n` +
    `Professional Telegram botlar va web saytlar yaratamiz.\n\n` +
    `Quyidagi tugmani bosib bizning ilovamizni oching 👇`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{
          text: "🌐 BotNexPro ni ochish",
          web_app: { url: WEBAPP_URL }
        }]]
      }
    }
  );
});

// ── /webapp ───────────────────────────────────────────────
bot.command("webapp", async (ctx) => {
  await ctx.reply(
    "🌐 *BotNexPro Mini App*",
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{
          text: "🌐 BotNexPro ni ochish",
          web_app: { url: WEBAPP_URL }
        }]]
      }
    }
  );
});

// ── /admin ────────────────────────────────────────────────
bot.command("admin", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = null;
  await ctx.reply(
    "🛠 *BotNexPro — Admin Panel*\n\n"
    + "✏️ /setname — Bot nomini o'zgartirish\n"
    + "🖼 /setphoto — Bot rasmini o'zgartirish\n"
    + "📝 /setdesc — Bot tavsifini o'zgartirish\n"
    + "ℹ️ /setabout — Biz haqimizda matni\n"
    + "📞 /setphone — Telefon raqam\n"
    + "💬 /settelegram — Telegram username\n"
    + "📸 /setinstagram — Instagram username\n"
    + "🌐 /webapp — Mini App\n"
    + "❌ /cancel — Bekor qilish",
    { parse_mode: "Markdown" }
  );
});

bot.command("setname", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setname";
  await ctx.reply("✏️ Yangi bot nomini yozing:\n(/cancel — bekor qilish)");
});

bot.command("setphoto", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setphoto";
  await ctx.reply("🖼 Yangi bot rasmini yuboring:\n(/cancel — bekor qilish)");
});

bot.command("setdesc", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setdesc";
  await ctx.reply("📝 Yangi bot tavsifini yozing:\n(/cancel — bekor qilish)");
});

bot.command("setabout", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setabout";
  const d = loadAboutData();
  await ctx.reply(`ℹ️ Hozirgi matn:\n\n${d.text}\n\nYangi matnni yozing:`);
});

bot.command("setphone", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setphone";
  const d = loadAboutData();
  await ctx.reply(`📞 Hozirgi: ${d.phone}\n\nYangi raqamni yozing:`);
});

bot.command("settelegram", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_settelegram";
  const d = loadAboutData();
  await ctx.reply(`💬 Hozirgi: ${d.telegram}\n\nYangi Telegram username yozing:`);
});

bot.command("setinstagram", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setinstagram";
  const d = loadAboutData();
  await ctx.reply(`📸 Hozirgi: ${d.instagram}\n\nYangi Instagram username yozing:`);
});

bot.command("cancel", async (ctx) => {
  ctx.session.step = null;
  ctx.session.data = {};
  await ctx.reply("❌ Bekor qilindi.", Markup.removeKeyboard());
});

// ── Rasm ──────────────────────────────────────────────────
bot.on("photo", async (ctx) => {
  if (!isAdmin(ctx) || ctx.session.step !== "admin_setphoto") return;
  try {
    const photos   = ctx.message.photo;
    const fileId   = photos[photos.length - 1].file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink.href);
    const buffer   = Buffer.from(await response.arrayBuffer());
    await ctx.telegram.setMyProfilePhoto({ source: buffer });
    ctx.session.step = null;
    await ctx.reply("✅ Bot rasmi o'zgartirildi!");
  } catch (e) {
    await ctx.reply("❌ @BotFather → /mybots → Edit Bot → Edit Botpic orqali o'zgartiring.");
    ctx.session.step = null;
  }
});

// ── Matn ──────────────────────────────────────────────────
bot.on("text", async (ctx) => {
  const step = ctx.session.step;
  const text = ctx.message.text;

  if (step === "admin_setname" && isAdmin(ctx)) {
    try {
      await ctx.telegram.setMyName(text);
      ctx.session.step = null;
      return ctx.reply(`✅ Bot nomi *"${text}"* ga o'zgartirildi!`, { parse_mode: "Markdown" });
    } catch (e) { ctx.session.step = null; return ctx.reply("❌ " + e.message); }
  }
  if (step === "admin_setdesc" && isAdmin(ctx)) {
    try {
      await ctx.telegram.setMyDescription(text);
      await ctx.telegram.setMyShortDescription(text.slice(0, 120));
      ctx.session.step = null;
      return ctx.reply("✅ Bot tavsifi o'zgartirildi!");
    } catch (e) { ctx.session.step = null; return ctx.reply("❌ " + e.message); }
  }
  if (step === "admin_setabout" && isAdmin(ctx)) {
    const d = loadAboutData(); d.text = text; saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply("✅ Biz haqimizda matni yangilandi!");
  }
  if (step === "admin_setphone" && isAdmin(ctx)) {
    const d = loadAboutData(); d.phone = text; saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply(`✅ Telefon *${text}* ga o'zgartirildi!`, { parse_mode: "Markdown" });
  }
  if (step === "admin_settelegram" && isAdmin(ctx)) {
    const d = loadAboutData(); d.telegram = text; saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply(`✅ Telegram *${text}* ga o'zgartirildi!`, { parse_mode: "Markdown" });
  }
  if (step === "admin_setinstagram" && isAdmin(ctx)) {
    const d = loadAboutData(); d.instagram = text; saveAboutData(d);
    ctx.session.step = null;
    return ctx.reply(`✅ Instagram *${text}* ga o'zgartirildi!`, { parse_mode: "Markdown" });
  }

  if (step === "ism") {
    ctx.session.data.ism = text; ctx.session.step = "familiya";
    return ctx.reply("✅ Qabul qilindi!\n\nFamiliyangizni kiriting:");
  }
  if (step === "familiya") {
    ctx.session.data.familiya = text; ctx.session.step = "telefon";
    return ctx.reply(
      "✅ Qabul qilindi!\n\nTelefon raqamingizni yuboring:",
      Markup.keyboard([[Markup.button.contactRequest("📱 Raqamni yuborish")]]).resize().oneTime()
    );
  }
  if (step === "telefon") {
    ctx.session.data.telefon = text; ctx.session.step = "bot_tavsif";
    return ctx.reply("✅ Qabul qilindi!\n\n💬 Sizga qanday xizmat kerak?\nBatafsil izohlang:", Markup.removeKeyboard());
  }
  if (step === "bot_tavsif") {
    ctx.session.data.bot_tavsif = text;
    ctx.session.step = null;
    await ctx.reply("✅ *Arizangiz qabul qilindi!*\n\n*BotNexPro* jamoasi tez orada bog'lanadi. 🙏", { parse_mode: "Markdown" });
    const d = ctx.session.data;
    const user = ctx.from;
    const adminText =
      `🔔 *Yangi ariza! — BotNexPro*\n━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Ism:* ${d.ism}\n` +
      `👤 *Familiya:* ${d.familiya}\n` +
      `📞 *Telefon:* ${d.telefon}\n` +
      `💬 *Xizmat:*\n${d.bot_tavsif}\n━━━━━━━━━━━━━━━━━━\n` +
      `🆔 ID: \`${user.id}\`\n` +
      `🔗 @${user.username || "yo'q"}`;
    try { await bot.telegram.sendMessage(ADMIN_ID, adminText, { parse_mode: "Markdown" }); } catch (e) {}
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
  await ctx.reply("✅ Qabul qilindi!\n\n💬 Sizga qanday xizmat kerak?\nBatafsil izohlang:", Markup.removeKeyboard());
});

// ── Ishga tushirish ───────────────────────────────────────
bot.launch().then(async () => {
  console.log("✅ BotNexPro ishga tushdi!");
  await setMenuButton();
});
process.once("SIGINT",  () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
