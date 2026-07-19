from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from config import ADMIN_ID
from database import get_all_users, count_users
from keyboards.inline import admin_panel_kb

router = Router()


class BroadcastState(StatesGroup):
    waiting_message = State()


def is_admin(user_id: int) -> bool:
    return user_id == ADMIN_ID


@router.message(Command("admin"))
async def admin_panel(message: Message):
    """Admin panel."""
    if not is_admin(message.from_user.id):
        await message.answer("⛔ Sizda admin huquqi yo'q.")
        return

    total = await count_users()
    await message.answer(
        f"🛠 <b>Admin Panel</b>\n\n"
        f"👥 Jami foydalanuvchilar: <b>{total}</b>\n\n"
        f"Quyidagi amallardan birini tanlang:",
        reply_markup=admin_panel_kb(),
        parse_mode="HTML",
    )


@router.message(Command("broadcast"))
async def broadcast_start(message: Message, state: FSMContext):
    """Hammaga xabar yuborish boshlash."""
    if not is_admin(message.from_user.id):
        await message.answer("⛔ Sizda admin huquqi yo'q.")
        return

    await message.answer(
        "📢 <b>Broadcast</b>\n\n"
        "Barcha foydalanuvchilarga yuboriladigan xabarni yozing:\n"
        "(Bekor qilish uchun /cancel)",
        parse_mode="HTML",
    )
    await state.set_state(BroadcastState.waiting_message)


@router.message(Command("cancel"))
async def cancel_handler(message: Message, state: FSMContext):
    """Holat bekor qilish."""
    current = await state.get_state()
    if current:
        await state.clear()
        await message.answer("❌ Bekor qilindi.")
    else:
        await message.answer("Hech qanday faol amal yo'q.")


@router.message(BroadcastState.waiting_message, F.text)
async def broadcast_send(message: Message, state: FSMContext):
    """Xabarni barcha foydalanuvchilarga yuborish."""
    await state.clear()

    users = await get_all_users()
    sent = 0
    failed = 0

    status_msg = await message.answer(
        f"⏳ Yuborilmoqda... (0/{len(users)})"
    )

    for user in users:
        try:
            await message.bot.send_message(
                user["tg_id"],
                f"📢 <b>BotNexPro.uz</b>\n\n{message.text}",
                parse_mode="HTML",
            )
            sent += 1
        except Exception:
            failed += 1

        # Har 20 ta foydalanuvchida yangilash
        if (sent + failed) % 20 == 0:
            try:
                await status_msg.edit_text(
                    f"⏳ Yuborilmoqda... ({sent + failed}/{len(users)})"
                )
            except Exception:
                pass

    await status_msg.edit_text(
        f"✅ <b>Broadcast tugadi!</b>\n\n"
        f"📨 Yuborildi: {sent}\n"
        f"❌ Xato: {failed}\n"
        f"👥 Jami: {len(users)}",
        parse_mode="HTML",
    )


@router.message(Command("stats"))
async def stats_handler(message: Message):
    """Statistika."""
    if not is_admin(message.from_user.id):
        await message.answer("⛔ Sizda admin huquqi yo'q.")
        return

    total = await count_users()
    users = await get_all_users()
    last_5 = users[-5:] if len(users) >= 5 else users

    last_text = "\n".join(
        f"• {u['full_name']} (@{u['username'] or '-'}) — <code>{u['tg_id']}</code>"
        for u in reversed(last_5)
    )

    await message.answer(
        f"📊 <b>Statistika</b>\n\n"
        f"👥 Jami foydalanuvchilar: <b>{total}</b>\n\n"
        f"🕐 Oxirgi 5 foydalanuvchi:\n{last_text}",
        parse_mode="HTML",
    )
