from aiogram import Router, F
from aiogram.types import Message

from database import save_message
from keyboards import main_menu, contact_kb, info_kb

router = Router()


@router.message(F.text == "🌐 Biz haqimizda")
async def about_handler(message: Message):
    await message.answer(
        "🏢 <b>BotNexPro.uz haqida</b>\n\n"
        "Biz professional Telegram botlar yaratish va raqamli avtomatlashtirish "
        "yo'nalishida xizmat ko'rsatamiz.\n\n"
        "✅ Biznes botlari\n"
        "✅ Do'kon botlari\n"
        "✅ Xabar yuborish tizimlari\n"
        "✅ CRM integratsiyalari\n\n"
        "Batafsil ma'lumot uchun tugmalarni bosing 👇",
        reply_markup=info_kb(),
        parse_mode="HTML",
    )


@router.message(F.text == "⚙️ Xizmatlar")
async def services_handler(message: Message):
    await message.answer(
        "⚙️ <b>Xizmatlarimiz</b>\n\n"
        "1️⃣ <b>Telegram Bot yaratish</b>\n"
        "   — Biznes, do'kon, ma'lumot botlari\n\n"
        "2️⃣ <b>Bot integratsiyasi</b>\n"
        "   — CRM, to'lov tizimlari, API\n\n"
        "3️⃣ <b>Bot texnik qo'llab-quvvatlash</b>\n"
        "   — 24/7 support\n\n"
        "4️⃣ <b>Maxsus yechimlar</b>\n"
        "   — Sizning ehtiyojingizga mos\n\n"
        "Narxlar va batafsil: @botnexpro_admin",
        parse_mode="HTML",
    )


@router.message(F.text == "📞 Aloqa")
async def contact_handler(message: Message):
    await message.answer(
        "📞 <b>Aloqa</b>\n\n"
        "Biz bilan bog'laning:\n\n"
        "💬 Telegram: @botnexpro_admin\n"
        "🌐 Sayt: botnexpro.uz\n"
        "📢 Kanal: @botnexpro\n\n"
        "Yoki raqamingizni yuboring, siz bilan bog'lanamiz 👇",
        reply_markup=contact_kb(),
        parse_mode="HTML",
    )


@router.message(F.text == "❓ Yordam")
async def help_menu_handler(message: Message):
    await message.answer(
        "❓ <b>Yordam</b>\n\n"
        "Bot bilan ishlash bo'yicha qo'llanma:\n\n"
        "🔹 <b>Biz haqimizda</b> — kompaniya ma'lumoti\n"
        "🔹 <b>Xizmatlar</b> — taklif etilayotgan xizmatlar\n"
        "🔹 <b>Aloqa</b> — biz bilan bog'lanish\n\n"
        "Muammo bormi? @botnexpro_admin ga yozing.",
        parse_mode="HTML",
    )


@router.message(F.text == "🔙 Orqaga")
async def back_handler(message: Message):
    await message.answer(
        "Asosiy menyuga qaytdingiz 👇",
        reply_markup=main_menu(),
    )


@router.message(F.contact)
async def contact_received(message: Message):
    """Telefon raqam qabul qilish."""
    contact = message.contact
    await save_message(message.from_user.id, f"CONTACT: {contact.phone_number}")

    if message.bot:
        from config import ADMIN_ID
        try:
            await message.bot.send_message(
                ADMIN_ID,
                f"📱 Yangi kontakt!\n"
                f"👤 {message.from_user.full_name}\n"
                f"📞 {contact.phone_number}\n"
                f"🆔 <code>{message.from_user.id}</code>",
                parse_mode="HTML",
            )
        except Exception:
            pass

    await message.answer(
        "✅ Raqamingiz qabul qilindi!\n"
        "Tez orada siz bilan bog'lanamiz 😊",
        reply_markup=main_menu(),
    )


@router.message(F.text)
async def echo_handler(message: Message):
    """Noma'lum xabarlarni qayta ishlash."""
    await save_message(message.from_user.id, message.text or "")
    await message.answer(
        "✏️ Xabaringiz qabul qilindi.\n"
        "Admin tez orada javob beradi.\n\n"
        "Yoki asosiy menyudan foydalaning 👇",
        reply_markup=main_menu(),
    )
