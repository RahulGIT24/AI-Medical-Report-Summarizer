from fastapi import APIRouter, File, UploadFile, HTTPException
import shutil
from app.lib import BASE_URL
import uuid
from app.db import SessionLocal
from app.models import Reports

db=SessionLocal()

router=APIRouter(prefix="/report")

allowed_extensions = ['pdf','jpeg','jpg','png']

@router.post("/upload")
async def upload_files(files:list[UploadFile]=File(...)):

    user_id=1
    if len(files)==1 and files[0].filename == "":
        raise HTTPException(detail="Please Provide files to upload", status_code=400)

    if len(files)==0:
        raise HTTPException(detail="Please Provide some files to upload", status_code=400)

    if len(files)>5:
        raise HTTPException(detail="Can't upload more than 5 files at a time", status_code=400)

    for file in files:
        splitted_name = file.filename.split(".")
        ext = splitted_name[-1].lower().strip()
        if ext not in allowed_extensions:
            raise HTTPException(detail=f"{file.filename} has an invalid extension. Allowed file types are {', '.join(allowed_extensions)}", status_code=400)   

    uploaded_file_locations=[]
    for file in files:

        splitted_name = file.filename.split(".")
        name=uuid.uuid4()
        ext="."+splitted_name[-1].lower().strip()
        final_name=str(name)+ext;

        file_location = f"public/uploads/{final_name}"
        with open(file_location,"wb") as buffer:
            shutil.copyfileobj(file.file,buffer)

        uploaded_file_locations.append(BASE_URL+"uploads/"+final_name)

    Reports.bulk_create(
            db=db, 
            owner_id=user_id,
            urls=uploaded_file_locations
    )

    return uploaded_file_locations