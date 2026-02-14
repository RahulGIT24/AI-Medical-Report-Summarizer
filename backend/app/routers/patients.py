from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.schemas import PatientSchema,PatientResponse
from app.db import get_db
from app.models import Patient
from app.middleware import get_current_user
from typing import List

router = APIRouter(prefix="/patients")

@router.post("/create")
def create_patient(
    payload: PatientSchema, 
    user: dict = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        user_id = user["id"]
        
        if payload.gender == "M":
            payload.gender="MALE"
        elif payload.gender=="F":
            payload.gender="FEMALE"

        new_patient = Patient(
            first_name=payload.fname,
            last_name=payload.lname,
            dob=payload.dob,
            gender=payload.gender,
            creator_id=user_id 
        )
        
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        
        # 3. Return success response
        return JSONResponse(
            status_code=201,
            content={
                "message": "Member created successfully",
                "patient_id": new_patient.id
            }
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating patient: {e}") # Helpful for terminal debugging
        db.rollback() # Important: discard failed transactions
        raise HTTPException(status_code=500, detail="Something went wrong while creating the member")

@router.get("/")
def get_my_patients(
    user: dict = Depends(get_current_user), 
    db: Session = Depends(get_db),
    response_model=List[PatientResponse]
):
    try:
        user_id = user["id"]
        members = db.query(Patient).filter(Patient.creator_id == user_id).all()
        return members
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching patients: {e}") 
        raise HTTPException(status_code=500, detail="Something went wrong while fetching members")