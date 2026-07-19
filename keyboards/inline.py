from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


def info_kb() -> InlineKeyboardMarkup:
    """Ma'lumot tugmalari."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🌍 Veb-sayt", url="https://botnexpro.uz"),
                InlineKeyboardButton(text="📢 Kanal", url="https://t.me/botnexpro"),
            ],
            [
                InlineKeyboardButton(text="💬 Admin", url="https://t.me/botnexpro_admin"),
            ],
            [
                InlineKeyboardButton(text="🔙 Orqaga", callback_data="back_main"),
            ],
        ]
    )


def back_kb() -> InlineKeyboardMarkup:
    """Orqaga tugmasi."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔙 Orqaga", callback_data="back_main")]
        ]
    )


def admin_panel_kb() -> InlineKeyboardMarkup:
    """Admin panel tugmalari."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="👥 Foydalanuvchilar", callback_data="admin_users")],
            [InlineKeyboardButton(text="📢 Hammaga xabar", callback_data="admin_broadcast")],
            [InlineKeyboardButton(text="📊 Statistika", callback_data="admin_stats")],
        ]
    )
