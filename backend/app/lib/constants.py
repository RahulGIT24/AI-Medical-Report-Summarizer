import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL=os.getenv('DB_URL')
BASE_URL=os.getenv('BASE_URL')
UPLOADS_DIR=os.getenv('UPLOADS_DIR')
REDIS_HOST=os.getenv('REDIS_HOST')
REDIS_PORT=os.getenv('REDIS_PORT')
QDRANT_HOST=os.getenv('QDRANT_HOST')
QDRANT_PORT=os.getenv('QDRANT_PORT')
QDRANT_COLLECTION_1=os.getenv('QDRANT_COLLECTION_1')
QDRANT_COLLECTION_2=os.getenv('QDRANT_COLLECTION_2')
os.environ['GROQ_API_KEY'] = os.getenv('GROQ_API_KEY')