from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.schemas import PatientSchema
from app.db import get_db
from app.models import Patient
from app.middleware import get_current_user

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