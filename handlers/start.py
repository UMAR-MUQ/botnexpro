from aiogram import Router
from aiogram.filters import CommandStart, Command
from aiogram.types import Message

from config import ADMIN_ID
from database import add_user
from keyboards import main_menu

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    """Foydalanuvchi /start bosganda."""
    user = message.from_user

    # Foydalanuvchini bazaga saqlash
    await add_user(
        tg_id=user.id,
        username=user.username,
        full_name=user.full_name,
    )

    # Adminga bildiruv yuborish
    if message.bot and user.id != ADMIN_ID:
        try:
            await message.bot.send_message(
                ADMIN_ID,
                f"🆕 Yangi foydalanuvchi!\n"
                f"👤 {user.full_name}\n"
                f"🔗 @{user.username or 'username yoq'}\n"
                f"🆔 <code>{user.id}</code>",
                parse_mode="HTML",
            )
        except Exception:
            pass

    await message.answer(
        f"👋 Salom, <b>{user.first_name}</b>!\n\n"
        f"🤖 <b>BotNexPro.uz</b> botiga xush kelibsiz!\n\n"
        f"Quyidagi menyudan kerakli bo'limni tanlang 👇",
        reply_markup=main_menu(),
        parse_mode="HTML",
    )


@router.message(Command("help"))
async def cmd_help(message: Message):
    """Yordam komandasi."""
    await message.answer(
        "❓ <b>Yordam</b>\n\n"
        "Quyidagi komandalar mavjud:\n"
        "/start — Botni ishga tushirish\n"
        "/help  — Yordam\n"
        "/about — Biz haqimizda\n\n"
        "Savollar bo'lsa: @botnexpro_admin",
        parse_mode="HTML",
    )


@router.message(Command("about"))
async def cmd_about(message: Message):
    """Bot haqida."""
    await message.answer(
        "🌐 <b>BotNexPro.uz</b>\n\n"
        "Biz Telegram botlar va avtomatlashtirish xizmatlarini taqdim etamiz.\n\n"
        "📍 Sayt: botnexpro.uz\n"
        "📢 Kanal: @botnexpro\n"
        "💬 Admin: @botnexpro_admin",
        parse_mode="HTML",
    )
