from fastapi import APIRouter,Depends, HTTPException
from app.middleware import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.db import get_db
from fastapi.responses import JSONResponse
from app.models import Reports
from datetime import datetime
from app.schemas import ReportSchema
from typing import List
from sqlalchemy.orm import joinedload

router=APIRouter(prefix="/user")

@router.get("/stats")
def get_user_stats(user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        count = db.query(Reports).filter(Reports.owner==user["id"]).count()
        last_report = (
            db.query(Reports)
            .filter(Reports.owner == user["id"])
            .order_by(desc(Reports.created_at))
            .first()
        )
        if not last_report:
            return JSONResponse(status_code=200,content={"count":0,"days_ago":0,"queries":0})
        now = datetime.utcnow()
        days_ago = (now - last_report.created_at).days
        return JSONResponse(status_code=200,content={"count":count,"days_ago":days_ago,"queries":0})
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get('/reports',response_model=List[ReportSchema])
def get_user_reports(user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        reports = (
            db.query(Reports)
            .filter(Reports.owner == user["id"])
            .options(joinedload(Reports.reports_media))
            .filter(or_(Reports.data_extracted == True, Reports.error == True))
            .order_by(desc(Reports.created_at))
            .all()
        )
        return reports
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get('/reports-enqueued',response_model=List[ReportSchema])
def get_user_reports(user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        reports = (
            db.query(Reports)
            .filter(Reports.owner == user["id"])
            .filter(Reports.enqueued == True, Reports.error == False)
            .order_by(desc(Reports.created_at))
            .all()
        )
        return reports
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")