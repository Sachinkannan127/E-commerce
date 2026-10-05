import logging
import sys
from app.core.config import settings


def setup_logging():
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=logging.DEBUG if settings.DEBUG else logging.INFO,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Silence verbose 3rd party internal debug loggers
    noisy_loggers = [
        "pymongo",
        "pymongo.connection",
        "pymongo.serverSelection",
        "pymongo.command",
        "pymongo.topology",
        "motor",
        "passlib",
        "asyncio",
        "urllib3",
        "watchfiles",
        "watchfiles.main",
    ]
    for name in noisy_loggers:
        logging.getLogger(name).setLevel(logging.WARNING)

    # Keep uvicorn access at INFO
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)


logger = logging.getLogger("shopverse")
