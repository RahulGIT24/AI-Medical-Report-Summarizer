from fastapi import APIRouter, File, UploadFile, HTTPException,Query
from fastapi.responses import JSONResponse
import shutil
from app.lib import BASE_URL
import uuid
from app.db import SessionLocal
from app.models import Reports
from app.lib import client

db=SessionLocal()

router=APIRouter(prefix="/report")

allowed_extensions = ['pdf','jpeg','jpg','png']

@router.post("/upload")
async def upload_files(files:list[UploadFile]=File(...)):
    try:
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
            final_name=str(name)+ext

            file_location = f"public/uploads/{final_name}"
            with open(file_location,"wb") as buffer:
                shutil.copyfileobj(file.file,buffer)

            uploaded_file_locations.append(BASE_URL+"uploads/"+final_name)
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error occured while uploading reports ",e)
        raise HTTPException(status_code=500,detail="Internal Server Error")

    Reports.bulk_create(
            db=db, 
            owner_id=user_id,
            urls=uploaded_file_locations
    )
    data  ={
        "files":uploaded_file_locations
    }
    return JSONResponse(status_code=200,content=data)

@router.get("/search")
async def query_reports(query:str | None):
    try:    
        if not query:
            raise HTTPException(status_code=400, detail="Please provide query to search")

        query = query.strip()

        points = client.similarity_search_collection1(query_str=query,top_k=5,user_id=1)

        report_ids = []

        ids = [p.id for p in points]

        if len(ids) > 0:
            report_ids=list(set(ids))

        data = {
            "report_ids":report_ids
        }

        return JSONResponse(status_code=200,content=data)
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error occured while searching reports ",e)
        raise HTTPException(status_code=500,detail="Internal Server Error")