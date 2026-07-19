require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID  = Number(process.env.ADMIN_ID);

if (!BOT_TOKEN) throw new Error("BOT_TOKEN .env faylida yo'q!");
if (!ADMIN_ID)  throw new Error("ADMIN_ID .env faylida yo'q!");

const bot = new Telegraf(BOT_TOKEN);

// ── Session (har bir foydalanuvchi uchun holat saqlash) ───────────────────────
bot.use(session({ defaultSession: () => ({ step: null, data: {} }) }));

// ── /start ────────────────────────────────────────────────────────────────────
bot.start(async (ctx) => {
  ctx.session.step = "ism";
  ctx.session.data = {};
  await ctx.reply(
    "👋 Salom! Xush kelibsiz!\n\n📝 Ariza to'ldirish uchun bir necha savol beraman.\n\nIsmingizni kiriting:",
    Markup.removeKeyboard()
  );
});

// ── Xabarlarni qayta ishlash ──────────────────────────────────────────────────
bot.on("text", async (ctx) => {
  const step = ctx.session.step;
  const text = ctx.message.text;

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

    // Foydalanuvchiga tasdiqlash
    await ctx.reply("✅ *Arizangiz qabul qilindi!*\n\nTez orada siz bilan bog'lanamiz. 🙏", {
      parse_mode: "Markdown"
    });

    // Adminga xabar yuborish
    const d = ctx.session.data;
    const user = ctx.from;
    const username = user.username ? `@${user.username}` : "username yo'q";

    const adminText =
      `🔔 *Yangi ariza!*\n` +
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
      console.log(`✅ Ariza yuborildi: ${d.ism} ${d.familiya}`);
    } catch (e) {
      console.error("❌ Adminga yuborishda xato:", e.message);
    }

  } else {
    // Hech qanday holat yo'q
    await ctx.reply("Botni boshlash uchun /start bosing.");
  }
});

// ── Kontakt (telefon tugmasi bilan) ───────────────────────────────────────────
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
