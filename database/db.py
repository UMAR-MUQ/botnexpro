import aiosqlite
from config import DB_PATH


async def init_db():
    """Ma'lumotlar bazasini ishga tushirish va jadvallarni yaratish."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                tg_id       INTEGER UNIQUE NOT NULL,
                username    TEXT,
                full_name   TEXT,
                joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_blocked  INTEGER DEFAULT 0
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                text       TEXT,
                sent_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(tg_id)
            )
        """)
        await db.commit()


async def add_user(tg_id: int, username: str | None, full_name: str):
    """Yangi foydalanuvchi qo'shish yoki mavjudni yangilash."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO users (tg_id, username, full_name)
            VALUES (?, ?, ?)
            ON CONFLICT(tg_id) DO UPDATE SET
                username  = excluded.username,
                full_name = excluded.full_name
        """, (tg_id, username, full_name))
        await db.commit()


async def get_user(tg_id: int) -> dict | None:
    """Foydalanuvchini ID bo'yicha olish."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE tg_id = ?", (tg_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def get_all_users() -> list[dict]:
    """Barcha foydalanuvchilarni olish."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM users WHERE is_blocked = 0") as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]


async def count_users() -> int:
    """Jami foydalanuvchilar sonini olish."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM users WHERE is_blocked = 0") as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 0


async def save_message(user_id: int, text: str):
    """Foydalanuvchi xabarini saqlash."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO messages (user_id, text) VALUES (?, ?)",
            (user_id, text)
        )
        await db.commit()


async def block_user(tg_id: int):
    """Foydalanuvchini bloklash."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET is_blocked = 1 WHERE tg_id = ?", (tg_id,)
        )
        await db.commit()
