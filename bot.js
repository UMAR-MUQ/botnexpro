require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID  = Number(process.env.ADMIN_ID);

if (!BOT_TOKEN) throw new Error("BOT_TOKEN .env faylida yo'q!");
if (!ADMIN_ID)  throw new Error("ADMIN_ID .env faylida yo'q!");

const bot = new Telegraf(BOT_TOKEN);

// ── Session ───────────────────────────────────────────────────────────────────
bot.use(session({ defaultSession: () => ({ step: null, data: {} }) }));

// ── Admin tekshirish ──────────────────────────────────────────────────────────
const isAdmin = (ctx) => ctx.from.id === ADMIN_ID;

// ── /start ────────────────────────────────────────────────────────────────────
bot.start(async (ctx) => {
  ctx.session.step = "ism";
  ctx.session.data = {};
  await ctx.reply(
    "👋 Salom! Xush kelibsiz!\n\n📝 NexCode.uz ga ariza to'ldirish uchun bir necha savol beraman.\n\nIsmingizni kiriting:",
    Markup.removeKeyboard()
  );
});

// ── /admin — Admin panel (faqat admin uchun) ──────────────────────────────────
bot.command("admin", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = null;

  await ctx.reply(
    "🛠 *NexCode.uz — Admin Panel*\n\n"
    + "Quyidagi komandalardan foydalaning:\n\n"
    + "✏️ /setname — Bot nomini o'zgartirish\n"
    + "🖼 /setphoto — Bot rasmini o'zgartirish\n"
    + "📝 /setdesc — Bot tavsifini o'zgartirish\n"
    + "❌ /cancel — Bekor qilish",
    { parse_mode: "Markdown" }
  );
});

// ── /setname — Bot nomini o'zgartirish ───────────────────────────────────────
bot.command("setname", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setname";
  await ctx.reply("✏️ Yangi bot nomini yozing:\n\n(Bekor qilish: /cancel)");
});

// ── /setphoto — Bot rasmini o'zgartirish ─────────────────────────────────────
bot.command("setphoto", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setphoto";
  await ctx.reply("🖼 Yangi bot rasmini yuboring:\n\n(Bekor qilish: /cancel)");
});

// ── /setdesc — Bot tavsifini o'zgartirish ────────────────────────────────────
bot.command("setdesc", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Ruxsat yo'q!");
  ctx.session.step = "admin_setdesc";
  await ctx.reply("📝 Yangi bot tavsifini yozing:\n\n(Bekor qilish: /cancel)");
});

// ── /cancel ───────────────────────────────────────────────────────────────────
bot.command("cancel", async (ctx) => {
  ctx.session.step = null;
  ctx.session.data = {};
  await ctx.reply("❌ Bekor qilindi.", Markup.removeKeyboard());
});

// ── Rasmni qayta ishlash ──────────────────────────────────────────────────────
bot.on("photo", async (ctx) => {
  if (!isAdmin(ctx)) return;
  if (ctx.session.step !== "admin_setphoto") return;

  try {
    // Eng katta o'lchamdagi rasmni olish
    const photos = ctx.message.photo;
    const fileId = photos[photos.length - 1].file_id;

    // Faylni yuklab olish
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink.href);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Bot rasmini o'rnatish
    await ctx.telegram.setMyProfilePhoto({ source: buffer });

    ctx.session.step = null;
    await ctx.reply("✅ Bot rasmi muvaffaqiyatli o'zgartirildi!");
  } catch (e) {
    console.error("Rasm o'zgartirishda xato:", e.message);
    await ctx.reply(
      "❌ Xato yuz berdi.\n\nEslatma: Bot rasmini faqat @BotFather orqali o'zgartirish mumkin.\n👉 @BotFather → /mybots → botingiz → Edit Bot → Edit Botpic"
    );
    ctx.session.step = null;
  }
});

// ── Matn xabarlarni qayta ishlash ─────────────────────────────────────────────
bot.on("text", async (ctx) => {
  const step = ctx.session.step;
  const text = ctx.message.text;

  // ── Admin: Bot nomini o'zgartirish ─────────────────────────────────────────
  if (step === "admin_setname") {
    if (!isAdmin(ctx)) return;
    try {
      await ctx.telegram.setMyName(text);
      ctx.session.step = null;
      await ctx.reply(`✅ Bot nomi *"${text}"* ga o'zgartirildi!`, { parse_mode: "Markdown" });
    } catch (e) {
      await ctx.reply("❌ Xato: " + e.message);
      ctx.session.step = null;
    }
    return;
  }

  // ── Admin: Bot tavsifini o'zgartirish ──────────────────────────────────────
  if (step === "admin_setdesc") {
    if (!isAdmin(ctx)) return;
    try {
      await ctx.telegram.setMyDescription(text);
      await ctx.telegram.setMyShortDescription(text.slice(0, 120));
      ctx.session.step = null;
      await ctx.reply("✅ Bot tavsifi muvaffaqiyatli o'zgartirildi!");
    } catch (e) {
      await ctx.reply("❌ Xato: " + e.message);
      ctx.session.step = null;
    }
    return;
  }

  // ── Oddiy foydalanuvchi ────────────────────────────────────────────────────
  if (step === "ism") {
    ctx.session.data.ism = text;
    ctx.session.step = "familiya";
    await ctx.reply("✅ Qabul qilindi!\n\nFamiliyangizni kiriting:");

  } else if (step === "familiya") {
    ctx.session.data.familiya = text;
    ctx.session.step = "telefon";
    await ctx.reply(
      "✅ Qabul qilindi!\n\nTelefon raqamingizni yuboring:",
      Markup.keyboard([
        [Markup.button.contactRequest("📱 Raqamni yuborish")]
      ]).resize().oneTime()
    );

  } else if (step === "telefon") {
    ctx.session.data.telefon = text;
    ctx.session.step = "bot_tavsif";
    await ctx.reply(
      "✅ Qabul qilindi!\n\n💬 Sizga qanday bot kerak?\nIltimos, batafsil izohlang:",
      Markup.removeKeyboard()
    );

  } else if (step === "bot_tavsif") {
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
      `💬 *Qanday bot kerak:*\n${d.bot_tavsif}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🆔 Telegram ID: \`${user.id}\`\n` +
      `🔗 Username: ${username}`;

    try {
      await bot.telegram.sendMessage(ADMIN_ID, adminText, { parse_mode: "Markdown" });
      console.log(`✅ NexCode.uz — Ariza yuborildi: ${d.ism} ${d.familiya}`);
    } catch (e) {
      console.error("❌ Adminga yuborishda xato:", e.message);
    }

  } else {
    await ctx.reply("Botni boshlash uchun /start bosing.");
  }
});

// ── Kontakt ───────────────────────────────────────────────────────────────────
bot.on("contact", async (ctx) => {
  if (ctx.session.step !== "telefon") return;

  let phone = ctx.message.contact.phone_number;
  if (!phone.startsWith("+")) phone = "+" + phone;

  ctx.session.data.telefon = phone;
  ctx.session.step = "bot_tavsif";

  await ctx.reply(
    "✅ Qabul qilindi!\n\n💬 Sizga qanday bot kerak?\nIltimos, batafsil izohlang:",
    Markup.removeKeyboard()
  );
});

// ── Ishga tushirish ───────────────────────────────────────────────────────────
bot.launch().then(() => {
  console.log("✅ Bot ishga tushdi!");
});

process.once("SIGINT",  () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
