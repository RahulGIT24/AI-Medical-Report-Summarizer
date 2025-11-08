import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import time
from app.models import Reports
from app.db import SessionLocal
from app.lib import client

db=SessionLocal()

def delete_reports():
    deleted_reports_id = (
        db.query(Reports.id)
        .filter(Reports.deleted==True)
        .limit(35)
        .all()
    )

    report_ids = [r.id for r in deleted_reports_id]
    # print(report_ids)
    if report_ids:
        db.query(Reports).filter(Reports.id.in_(report_ids)).delete(synchronize_session=False)
        client.delete_embeddings(report_ids=report_ids)
        db.commit()

def scheduler_cleanup():
    while True:
        delete_reports()
        time.sleep(3600)