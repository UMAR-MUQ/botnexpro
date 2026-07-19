# 🤖 BotNexPro.uz — Telegram Bot

Professional Telegram bot — [aiogram 3.x](https://docs.aiogram.dev/) asosida qurilgan.

---

## 📁 Loyiha strukturasi

```
BotNexPro/
├── main.py                  # Asosiy ishga tushirish fayli
├── config.py                # Sozlamalar (.env o'qish)
├── requirements.txt         # Kerakli kutubxonalar
├── .env.example             # Muhit o'zgaruvchilari namunasi
├── botnexpro.db             # SQLite bazasi (avtomatik yaratiladi)
│
├── database/
│   ├── __init__.py
│   └── db.py                # Barcha DB funksiyalari
│
├── handlers/
│   ├── __init__.py
│   ├── start.py             # /start, /help, /about
│   ├── menu.py              # Asosiy menyu handlerlari
│   ├── admin.py             # Admin panel (/admin, /broadcast, /stats)
│   └── callbacks.py         # Inline tugma callbacklari
│
└── keyboards/
    ├── __init__.py
    ├── reply.py             # Reply (oddiy) tugmalar
    └── inline.py            # Inline tugmalar
```

---

## 🚀 O'rnatish va ishga tushirish

### 1. Loyihani klonlash
```bash
git clone https://github.com/youruser/BotNexPro.git
cd BotNexPro
```

### 2. Virtual muhit yaratish
```bash
python -m venv venv
venv\Scripts\activate        # Windows
# yoki
source venv/bin/activate     # Linux/Mac
```

### 3. Kutubxonalarni o'rnatish
```bash
pip install -r requirements.txt
```

### 4. .env fayl yaratish
```bash
copy .env.example .env       # Windows
# yoki
cp .env.example .env         # Linux/Mac
```

`.env` faylini tahrirlang:
```
BOT_TOKEN=123456789:AAF...   # BotFather'dan olingan token
ADMIN_ID=123456789           # Sizning Telegram ID'ingiz
BOT_USERNAME=BotNexProBot    # Bot username'i (@siz)
```

### 5. Botni ishga tushirish
```bash
python main.py
```

---

## 🔧 Funksiyalar

### Foydalanuvchilar uchun
| Komanda / Tugma | Tavsif |
|---|---|
| `/start` | Botni ishga tushirish, ro'yxatdan o'tish |
| `/help` | Yordam |
| `/about` | Bot va kompaniya haqida |
| 🌐 Biz haqimizda | Kompaniya ma'lumoti + linklar |
| ⚙️ Xizmatlar | Xizmatlar ro'yxati |
| 📞 Aloqa | Kontakt ma'lumotlari + telefon yuborish |
| ❓ Yordam | Qo'llanma |

### Admin uchun
| Komanda | Tavsif |
|---|---|
| `/admin` | Admin panel (inline tugmalar) |
| `/broadcast` | Barcha foydalanuvchilarga xabar yuborish |
| `/stats` | Statistika |
| `/cancel` | Faol amalni bekor qilish |

---

## 🔑 Telegram ID olish

O'z Telegram ID'ingizni bilish uchun [@userinfobot](https://t.me/userinfobot) botiga `/start` yuboring.

---

## 🌐 Aloqa

- 🌍 Sayt: [botnexpro.uz](https://botnexpro.uz)
- 📢 Kanal: [@botnexpro](https://t.me/botnexpro)
- 💬 Admin: [@botnexpro_admin](https://t.me/botnexpro_admin)
