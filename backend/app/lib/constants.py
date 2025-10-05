import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL=os.getenv('DB_URL')
BASE_URL=os.getenv('BASE_URL')
UPLOADS_DIR=os.getenv('UPLOADS_DIR')
REDIS_HOST=os.getenv('REDIS_HOST')
REDIS_PORT=os.getenv('REDIS_PORT')