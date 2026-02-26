
from app.db import SessionLocal
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.middleware import get_current_user
from app.db import get_db
from app.models import Patient,Reports,TestResults

from pydantic import BaseModel
from datetime import datetime
from typing import List

class TrendDataPoint(BaseModel):
    date: datetime
    value: float
    unit: str | None = None
    outcome: str | None = None

class TrendResponse(BaseModel):
    patient_id: int
    test_name: str
    trends: List[TrendDataPoint]

db=SessionLocal()

router=APIRouter(prefix="/trends")

@router.get("/",response_model=TrendResponse)
async def analyze_trends(patient_id:int,test_name:str,user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        user_id=user["id"]

        patient = patient = db.query(Patient).filter(Patient.creator_id == int(user_id), Patient.id == patient_id).first()

        if patient is None:
            raise HTTPException(status_code=404,detail="Patient Not Found")

        results = (
    db.query(Reports.created_at, TestResults)
    .join(TestResults, Reports.id == TestResults.report_id)
    .filter(
        Reports.patient_id == patient_id,      
        TestResults.test_name == test_name,   
        TestResults.result_value.isnot(None) 
    )
    .order_by(Reports.created_at.asc())
    .all()
)
        if not results:
            raise HTTPException(status_code=404, detail="No trend data found for this test.")

        # Format the data for the frontend
        trend_data = []
        for report_date, test in results:
            trend_data.append(
                TrendDataPoint(
                    date=report_date,
                    value=int(test.result_value),
                    unit=test.unit,
                    outcome=test.outcome
                )
            )

        return TrendResponse(
            patient_id=patient_id,
            test_name=test_name,
            trends=trend_data
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500,detail="Internal Server Error")

@router.get("/get-test-names")
async def get_test_names_for_patient(patient_id:int,user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        user_id=user["id"]

        patient = patient = db.query(Patient).filter(Patient.creator_id == int(user_id), Patient.id == patient_id).first()

        if patient is None:
            raise HTTPException(status_code=404,detail="Patient Not Found")
        
        distinct_names = (db.query(TestResults.test_name)
            .join(Reports,Reports.id == TestResults.report_id)
            .filter(Reports.patient_id==patient_id)
            .filter(TestResults.test_name.isnot(None))
            .distinct()
            .all()
        )

        test_names = [row[0] for row in distinct_names]
        return {"tests": test_names}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500,detail="Internal Server Error")