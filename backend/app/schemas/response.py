from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List

class ReportsMediaSchema(BaseModel):
    url: str

    class Config:
        orm_mode = True

class ReportSchema(BaseModel):
    id: int
    data_extracted:bool
    enqueued:bool
    error:bool
    patient_id:int
    errormsg:str
    created_at:datetime
    reports_media: List[ReportsMediaSchema] = []

    class Config:
        form_attributes=True


class ReportMetaDataResponse(BaseModel):
    patient_name: Optional[str] = None
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None
    report_type: Optional[str] = None
    accession_number: Optional[str] = None
    collection_date: Optional[datetime] = None
    received_date: Optional[datetime] = None
    report_date: Optional[datetime] = None
    lab_name: Optional[str] = None
    lab_director: Optional[str] = None
    sample_type: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        orm_mode = True

class TestResultResponse(BaseModel):
    test_name: str
    test_category: Optional[str] = None
    outcome: Optional[str] = None
    result_value: Optional[str] = None
    unit: Optional[str] = None
    cutoff_value: Optional[str] = None
    reference_range: Optional[str] = None
    detection_window: Optional[str] = None
    is_abnormal: Optional[bool] = None
    is_critical: Optional[bool] = None

    class Config:
        orm_mode = True

class SpecimenValidityResponse(BaseModel):
    specific_gravity: Optional[float] = None
    specific_gravity_status: Optional[str] = None
    ph_status: Optional[str] = None
    ph_level: Optional[float] = None
    creatinine_status: Optional[str] = None
    oxidants: Optional[str] = None
    oxidants_status: Optional[str] = None
    is_valid: Optional[bool] = None
    creatinine: Optional[float] = None

    class Config:
        orm_mode = True

class ScreeningTestResponse(BaseModel):
    test_name: str
    outcome: Optional[str] = None
    result_value: Optional[str] = None
    cutoff_value: Optional[str] = None

    class Config:
        orm_mode = True

class ConfirmationTestResponse(BaseModel):
    test_name: str
    method: Optional[str] = None
    outcome: Optional[str] = None
    result_value: Optional[str] = None
    result_numeric: Optional[float] = None
    unit: Optional[str] = None
    cutoff_value: Optional[str] = None
    detection_window: Optional[str] = None

    class Config:
        orm_mode = True

class ReportedMedicationResponse(BaseModel):
    medication_name: str
    is_tested: Optional[bool] = None

    class Config:
        orm_mode = True

class ReportResponse(BaseModel):
    id: int
    data_extracted: bool
    enqueued: bool
    error: bool
    errormsg: str
    created_at: datetime
    updated_at: datetime

    report_metadata: Optional[ReportMetaDataResponse] = None
    test_results: Optional[List[TestResultResponse]] = None
    specimen_validity: Optional[SpecimenValidityResponse] = None
    reports_media: Optional[List[ReportsMediaSchema]] = None
    screening_tests: Optional[List[ScreeningTestResponse]] = None
    confirmation_tests: Optional[List[ConfirmationTestResponse]] = None
    medications: Optional[List[ReportedMedicationResponse]] = None

    class Config:
        orm_mode = True


class ReportListResponse(BaseModel):
    reports: List[ReportResponse]