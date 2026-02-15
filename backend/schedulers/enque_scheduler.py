import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()

import time
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models import Reports
from app.lib import r_queue, get_logger
from app.workers import process_reports

BATCH_SIZE=10

logger = get_logger("enque_scheduler", "enqueue_scheduler.log")

def enqueue_pending_reports():
    try:
        db:Session = SessionLocal()
        pending = db.query(Reports).filter(Reports.data_extracted==False, Reports.enqueued==False).limit(BATCH_SIZE).all()

        if not pending:
            logger.info("Nothing to enqueue!!")
            db.close()
            return

        report_ids = [r.id for r in pending]

        for r in pending:
            r.enqueued = True
        db.commit()

        r_queue.enqueue(process_reports, report_ids)
        logger.info(", ".join(report_ids) + " Submitted for processing")
    except Exception as e:
      logger.error(f'An exception occurred while enqueing {e}')

def scheduler_enqueue():
    while True:
        enqueue_pending_reports()
        time.sleep(5)