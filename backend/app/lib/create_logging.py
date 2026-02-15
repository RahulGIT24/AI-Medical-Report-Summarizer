import logging
import os

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"

def get_logger(name: str, filename: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        file_handler = logging.FileHandler(os.path.join(LOG_DIR, filename))
        formatter = logging.Formatter(LOG_FORMAT)
        file_handler.setFormatter(formatter)

        logger.addHandler(file_handler)

    return logger
