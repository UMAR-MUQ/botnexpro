from .start import router as start_router
from .menu import router as menu_router
from .admin import router as admin_router
from .callbacks import router as callbacks_router

__all__ = ["start_router", "menu_router", "admin_router", "callbacks_router"]
