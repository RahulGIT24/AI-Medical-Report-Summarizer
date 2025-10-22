from .constants import DATABASE_URL, BASE_URL,UPLOADS_DIR, REDIS_PORT, REDIS_HOST
from .redis import r_queue,raw_data_vectorization
from .llm import llm
from .qdrant import qdrant,embedder,client
from .prompt import get_extraction_prompt,get_query_prompt