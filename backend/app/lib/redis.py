import redis
from app.lib.constants import REDIS_HOST, REDIS_PORT
from rq import Queue

r = redis.Redis(host=str(REDIS_HOST), port=int(REDIS_PORT), decode_responses=True, db=0)
r_queue = Queue("report_tasks", connection=r)