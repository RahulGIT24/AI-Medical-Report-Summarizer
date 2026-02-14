from pydantic import BaseModel
from datetime import date
from enum import Enum

class GenderEnum(str, Enum):
    MALE = "M"
    FEMALE = "F"

class PatientSchema(BaseModel):
    fname: str
    lname: str
    dob: date 
    gender: GenderEnum