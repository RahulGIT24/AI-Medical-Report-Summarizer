from pydantic import BaseModel
from datetime import datetime

class ReportSchema(BaseModel):
    id: int
    url:str
    data_extracted:bool
    enqueued:bool
    error:bool
    errormsg:str
    created_at:datetime

    class config:
        orm=True