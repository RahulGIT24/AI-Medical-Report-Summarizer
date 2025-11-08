import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()

import time
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models import Reports
from app.lib import r_queue
from app.workers import process_reports

BATCH_SIZE=10

def enqueue_pending_reports():
    try:
        db:Session = SessionLocal()
        pending = db.query(Reports).filter(Reports.data_extracted==False, Reports.enqueued==False).limit(BATCH_SIZE).all()

        if not pending:
            print("Nothing to enqueue!!")
            db.close()
            return

        report_ids = [r.id for r in pending]

        for r in pending:
            r.enqueued = True
        db.commit()

        print(report_ids)

        r_queue.enqueue(process_reports, report_ids)
    except Exception as e:
      print('An exception occurred while enqueing',e)

def scheduler_enqueue():
    while True:
        enqueue_pending_reports()
        time.sleep(5)