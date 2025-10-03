from fastapi import APIRouter, File, UploadFile
import shutil
from app.lib import BASE_URL
import uuid
from app.db import SessionLocal
from app.models import Reports

db=SessionLocal()

router=APIRouter(prefix="/report")

# http://localhost:5000/uploads/916cd211-adc2-48e5-be8e-5bcd87ee9310.pdf Base File URL

allowed_extensions = ['.csv','.pdf','.jpeg','.jpg','.png']

@router.post("/upload")
async def upload_files(files:list[UploadFile]=File(...)):

    user_id=1

    uploaded_file_locations=[]
    for file in files:

        splitted_name = file.filename.split(".")
        print(splitted_name)
        name=uuid.uuid4()
        ext="."+splitted_name[len(splitted_name)-1]
        final_name=str(name)+ext;

        file_location = f"public/uploads/{final_name}"
        with open(file_location,"wb") as buffer:
            shutil.copyfileobj(file.file,buffer)

        uploaded_file_locations.append(BASE_URL+"uploads/"+final_name)

    Reports.bulk_create(
            db=db, 
            owner_id=user_id,
            report_type='N/A',
            urls=uploaded_file_locations
    )

    return uploaded_file_locations
