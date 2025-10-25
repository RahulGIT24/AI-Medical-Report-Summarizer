from fastapi import APIRouter,Depends, HTTPException
from app.middleware import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db import get_db
from fastapi.responses import JSONResponse
from app.models import Reports
from datetime import datetime

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
        if last_report:
            now = datetime.utcnow()
            days_ago = (now - last_report.created_at).days
        return JSONResponse(status_code=200,content={"count":count,"days_ago":days_ago,"queries":0})
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")