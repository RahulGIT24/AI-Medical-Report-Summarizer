import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import time
from app.models import Reports
from app.db import SessionLocal
from app.lib import client,get_logger

db=SessionLocal()
logger = get_logger("delete_scheduler", "delete_scheduler.log")

def delete_reports():
    try:
        deleted_reports_id = (
            db.query(Reports.id)
            .filter(Reports.deleted==True)
            .limit(35)
            .all()
        )

        report_ids = [r.id for r in deleted_reports_id]
        if report_ids:
            db.query(Reports).filter(Reports.id.in_(report_ids)).delete(synchronize_session=False)
            client.delete_embeddings(report_ids=report_ids)
            db.commit()
        logger.info(", ".join(report_ids) + " Submitted for deleted successfully")
    except Exception as e:
        logger.error(f"Error while deleting report {e}")

def scheduler_cleanup():
    while True:
        delete_reports()
        time.sleep(3600)