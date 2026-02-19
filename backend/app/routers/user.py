from fastapi import APIRouter,Depends, HTTPException
from app.middleware import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.db import get_db
from fastapi.responses import JSONResponse
from app.models import Reports,Patient
from datetime import datetime
from app.schemas import ReportSchema
from typing import List
from sqlalchemy.orm import joinedload

router=APIRouter(prefix="/user")

@router.get("/stats")
def get_user_stats(user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        user_id = user["id"]

        # 1. Count patients created by this user
        patient_count = db.query(Patient).filter(Patient.creator_id == user_id).count()
        return {
            "members": patient_count,
        }

    except Exception as e:
        # It's helpful to log the error for debugging
        print(f"Stats Error: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong while fetching stats")

@router.get('/reports',response_model=List[ReportSchema])
def get_user_reports(user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        reports = (
            db.query(Reports)
            .filter(Reports.owner == user["id"],Reports.deleted==False)
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