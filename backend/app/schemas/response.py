from pydantic import BaseModel
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
    errormsg:str
    created_at:datetime
    reports_media: List[ReportsMediaSchema] = []

    class config:
        orm=True