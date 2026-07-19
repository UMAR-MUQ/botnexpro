import asyncio
import logging
from dotenv import load_dotenv
import os

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


# ── Holatlar (steps) ──────────────────────────────────────────────────────────
class Form(StatesGroup):
    ism        = State()   # 1: ism
    familiya   = State()   # 2: familiya
    telefon    = State()   # 3: telefon raqam
    bot_tavsif = State()   # 4: qanday bot kerak


# ── Tugmalar ──────────────────────────────────────────────────────────────────
def phone_kb() -> ReplyKeyboardMarkup:
    """Telefon raqam yuborish tugmasi."""
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📱 Raqamni yuborish", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


# ── Handlerlar ────────────────────────────────────────────────────────────────
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "👋 Salom! Xush kelibsiz!\n\n"
        "📝 Ariza to'ldirish uchun bir necha savol beraman.\n\n"
        "Ismingizni kiriting:",
        reply_markup=ReplyKeyboardRemove(),
    )
    await state.set_state(Form.ism)


async def get_ism(message: Message, state: FSMContext):
    await state.update_data(ism=message.text)
    await message.answer("✅ Qabul qilindi!\n\nFamiliyangizni kiriting:")
    await state.set_state(Form.familiya)


async def get_familiya(message: Message, state: FSMContext):
    await state.update_data(familiya=message.text)
    await message.answer(
        "✅ Qabul qilindi!\n\nTelefon raqamingizni yuboring:",
        reply_markup=phone_kb(),
    )
    await state.set_state(Form.telefon)


async def get_telefon_contact(message: Message, state: FSMContext):
    """Tugma orqali kontakt yuborilganda."""
    phone = message.contact.phone_number
    if not phone.startswith("+"):
        phone = "+" + phone
    await state.update_data(telefon=phone)
    await message.answer(
        "✅ Qabul qilindi!\n\n"
        "💬 Sizga qanday bot kerak?\n"
        "Iltimos, batafsil izohlang:",
        reply_markup=ReplyKeyboardRemove(),
    )
    await state.set_state(Form.bot_tavsif)


async def get_telefon_text(message: Message, state: FSMContext):
    """Matn orqali raqam kiritilganda."""
    await state.update_data(telefon=message.text)
    await message.answer(
        "✅ Qabul qilindi!\n\n"
        "💬 Sizga qanday bot kerak?\n"
        "Iltimos, batafsil izohlang:",
        reply_markup=ReplyKeyboardRemove(),
    )
    await state.set_state(Form.bot_tavsif)


async def get_bot_tavsif(message: Message, state: FSMContext, bot: Bot):
    data = await state.get_data()
    await state.clear()

    ism        = data.get("ism", "—")
    familiya   = data.get("familiya", "—")
    telefon    = data.get("telefon", "—")
    bot_tavsif = message.text

    # ── Foydalanuvchiga tasdiqlash xabari ────────────────────────────────────
    await message.answer(
        "✅ <b>Arizangiz qabul qilindi!</b>\n\n"
        "Tez orada siz bilan bog'lanamiz. 🙏",
        parse_mode="HTML",
    )

    # ── Adminga to'liq ma'lumot yuborish ─────────────────────────────────────
    tg_user = message.from_user
    username_link = f"@{tg_user.username}" if tg_user.username else "username yo'q"

    admin_text = (
        "🔔 <b>Yangi ariza!</b>\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"👤 <b>Ism:</b> {ism}\n"
        f"👤 <b>Familiya:</b> {familiya}\n"
        f"📞 <b>Telefon:</b> {telefon}\n"
        f"💬 <b>Qanday bot kerak:</b>\n{bot_tavsif}\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"🆔 Telegram ID: <code>{tg_user.id}</code>\n"
        f"🔗 Username: {username_link}"
    )

    try:
        await bot.send_message(ADMIN_ID, admin_text, parse_mode="HTML")
        logger.info(f"Admin ga ariza yuborildi: {ism} {familiya}")
    except Exception as e:
        logger.error(f"Admin ga yuborishda xato: {e}")


# ── Botni ishga tushirish ─────────────────────────────────────────────────────
async def main():
    if not BOT_TOKEN:
        raise ValueError("BOT_TOKEN .env faylida ko'rsatilmagan!")
    if ADMIN_ID == 0:
        raise ValueError("ADMIN_ID .env faylida ko'rsatilmagan!")

    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher(storage=MemoryStorage())

    # Handlerlarni ro'yxatdan o'tkazish
    dp.message.register(cmd_start,             CommandStart())
    dp.message.register(get_ism,               Form.ism,        F.text)
    dp.message.register(get_familiya,          Form.familiya,   F.text)
    dp.message.register(get_telefon_contact,   Form.telefon,    F.contact)
    dp.message.register(get_telefon_text,      Form.telefon,    F.text)
    dp.message.register(get_bot_tavsif,        Form.bot_tavsif, F.text)

    logger.info("✅ Bot ishga tushdi!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
