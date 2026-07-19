from aiogram import Router
from aiogram.types import CallbackQuery

from config import ADMIN_ID
from database import count_users, get_all_users
from keyboards import main_menu
from keyboards.inline import admin_panel_kb

router = Router()


@router.callback_query(lambda c: c.data == "back_main")
async def back_to_main(callback: CallbackQuery):
    """Asosiy menyuga qaytish."""
    await callback.message.delete()
    await callback.message.answer(
        "Asosiy menyuga qaytdingiz 👇",
        reply_markup=main_menu(),
    )
    await callback.answer()


@router.callback_query(lambda c: c.data == "admin_users")
async def admin_users_cb(callback: CallbackQuery):
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("⛔ Ruxsat yo'q!", show_alert=True)
        return

    users = await get_all_users()
    text = f"👥 <b>Foydalanuvchilar ({len(users)} ta)</b>\n\n"
    for u in users[-10:]:
        text += f"• {u['full_name']} — <code>{u['tg_id']}</code>\n"
    if len(users) > 10:
        text += f"\n... va yana {len(users) - 10} ta"

    await callback.message.edit_text(
        text,
        reply_markup=admin_panel_kb(),
        parse_mode="HTML",
    )
    await callback.answer()


@router.callback_query(lambda c: c.data == "admin_stats")
async def admin_stats_cb(callback: CallbackQuery):
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("⛔ Ruxsat yo'q!", show_alert=True)
        return

    total = await count_users()
    await callback.message.edit_text(
        f"📊 <b>Statistika</b>\n\n"
        f"👥 Jami foydalanuvchilar: <b>{total}</b>",
        reply_markup=admin_panel_kb(),
        parse_mode="HTML",
    )
    await callback.answer()


@router.callback_query(lambda c: c.data == "admin_broadcast")
async def admin_broadcast_cb(callback: CallbackQuery):
    if callback.from_user.id != ADMIN_ID:
        await callback.answer("⛔ Ruxsat yo'q!", show_alert=True)
        return

    await callback.message.edit_text(
        "📢 Broadcast uchun /broadcast komandасini yuboring.",
        reply_markup=admin_panel_kb(),
    )
    await callback.answer()
