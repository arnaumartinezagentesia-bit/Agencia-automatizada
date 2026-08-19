import os
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

class TelegramBotService:
    """
    Service to handle notifications via Telegram Bot API.
    """
    def __init__(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID") # Added chat_id as it's usually required
        self.api_url = f"https://api.telegram.org/bot{self.token}/sendMessage"

    async def send_message(self, text: str, parse_mode: str = "Markdown") -> bool:
        """
        Sends a message to the configured Telegram chat.
        """
        if not self.token or not self.chat_id:
            logger.error("Telegram Bot token or Chat ID is missing from environment variables.")
            return False

        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": parse_mode
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.api_url, json=payload, timeout=10.0)
                response.raise_for_status()
                return True
        except httpx.HTTPStatusError as e:
            logger.error(f"Telegram API HTTP error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            logger.error(f"Unexpected error sending Telegram message: {e}")

        return False

# Singleton instance
telegram_bot = TelegramBotService()
