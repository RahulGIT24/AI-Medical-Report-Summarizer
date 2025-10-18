import redis
from app.lib.constants import REDIS_HOST, REDIS_PORT
from rq import Queue
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(host=str(REDIS_HOST), port=int(REDIS_PORT), decode_responses=True, db=0)
r_queue = Queue("report_tasks", connection=r)
raw_data_vectorization = Queue("raw_data_vectorization",connection=r)