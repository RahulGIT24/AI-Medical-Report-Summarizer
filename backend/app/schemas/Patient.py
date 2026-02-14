from pydantic import BaseModel,ConfigDict
from datetime import date,datetime
from enum import Enum

class GenderEnum(str, Enum):
    MALE = "M"
    FEMALE = "F"

class PatientSchema(BaseModel):
    fname: str
    lname: str
    dob: date 
    gender: GenderEnum

class PatientResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    gender: GenderEnum
    creator_id: int
    dob: date
    created_at: datetime
    updated_at: datetime

    # This config tells Pydantic to read data even if it's not a dict (like a SQLAlchemy model)
    model_config = ConfigDict(from_attributes=True)