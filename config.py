import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
ADMIN_ID: int = int(os.getenv("ADMIN_ID", "0"))
BOT_USERNAME: str = os.getenv("BOT_USERNAME", "BotNexProBot")

DB_PATH: str = "botnexpro.db"
