from aiogram.types import ReplyKeyboardMarkup, KeyboardButton


def main_menu() -> ReplyKeyboardMarkup:
    """Asosiy menyu tugmalari."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="🌐 Biz haqimizda"),
                KeyboardButton(text="📞 Aloqa"),
            ],
            [
                KeyboardButton(text="⚙️ Xizmatlar"),
                KeyboardButton(text="❓ Yordam"),
            ],
        ],
        resize_keyboard=True,
        input_field_placeholder="Menyu bandini tanlang...",
    )


def contact_kb() -> ReplyKeyboardMarkup:
    """Telefon raqam yuborish tugmasi."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📱 Raqamni yuborish", request_contact=True)],
            [KeyboardButton(text="🔙 Orqaga")],
        ],
        resize_keyboard=True,
    )
