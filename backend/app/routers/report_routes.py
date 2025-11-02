from fastapi import APIRouter, File, UploadFile, HTTPException,Query,Depends
from fastapi.responses import JSONResponse,StreamingResponse
import shutil
from app.lib import BASE_URL
import uuid
from app.middleware import get_current_user
from app.db import SessionLocal
from app.models import Reports,SpecimenValidity,ReportMetaData,TestResults,ScreeningTests,ConfirmationTests,ReportedMedications,ReportsMedia, Chat
from app.lib import client,get_query_prompt
from app.ocr import llm_class
import json

MAPPINGS = {
    "specimen_validity":SpecimenValidity,
    "report_metadata":ReportMetaData,
    "test_results":TestResults,
    "screening_tests":ScreeningTests,
    "confirmation_tests":ConfirmationTests,
    "reported_medications":ReportedMedications
}

db=SessionLocal()

router=APIRouter(prefix="/report")

allowed_extensions = ['jpeg','jpg','png']

@router.post("/upload")
async def upload_files(files:list[UploadFile]=File(...),user=Depends(get_current_user)):
    try:
        user_id=user["id"]
        if len(files)==1 and files[0].filename == "":
            raise HTTPException(detail="Please Provide files to upload", status_code=400)

        if len(files)==0:
            raise HTTPException(detail="Please Provide some files to upload", status_code=400)

        if len(files)>10:
            raise HTTPException(detail="Can't upload more than 5 files at a time", status_code=400)

        for file in files:
            splitted_name = file.filename.split(".")
            ext = splitted_name[-1].lower().strip()
            if ext not in allowed_extensions:
                raise HTTPException(detail=f"{file.filename} has an invalid extension. Allowed file types are {', '.join(allowed_extensions)}", status_code=400)   

        uploaded_file_locations=[]

        report=Reports(
            owner=user_id,
        )
        db.add(report)
        db.commit()
        db.flush()

        for file in files:

            splitted_name = file.filename.split(".")
            name=uuid.uuid4()
            ext="."+splitted_name[-1].lower().strip()
            final_name=str(name)+ext

            file_location = f"public/uploads/{final_name}"
            with open(file_location,"wb") as buffer:
                shutil.copyfileobj(file.file,buffer)

            uploaded_file_locations.append(BASE_URL+"uploads/"+final_name)
        
        ReportsMedia.bulk_create(db=db,report_id=report.id,urls=uploaded_file_locations)

    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error occured while uploading repuser=Depends(get_current_user)orts ",e)
        raise HTTPException(status_code=500,detail="Internal Server Error")

    
    data  ={
        "message":'Report Uploaded Successfully'
    }
    return JSONResponse(status_code=200,content=data)

@router.get("/search")
async def query_reports(query: str,session_id:str,user=Depends(get_current_user)):
    user_id=user["id"]
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")

    if not session_id:
        raise HTTPException(status_code=400, detail="Session not specified")

    try:

        with SessionLocal() as db:
            user_c = Chat(
                session=session_id,
                content=query,
                role="user",
            )
            db.add(user_c)
            db.commit()

        points = client.similarity_search_collection1(query_str=query,top_k=10,user_id=1)

        payloads = [p.payload for p in points]
        
        context = []
        for data in payloads:
            with SessionLocal() as db:
                context.append(MAPPINGS.get(data.get("collection_name")).get_by_id(db=db,id=data.get("collection_id")))

        llm_instance = llm_class(prompt=get_query_prompt(), report_data=None)
        response_buffer = []  

        def generate():
            for token in llm_instance.call_llm_stream(query, q_context=context):
                response_buffer.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"
            full_response = "".join(response_buffer)
            with SessionLocal() as db:
                assistant = Chat(
                    session=session_id,
                    content=full_response,
                    role="assistant",
                )
            db.add(assistant)
            db.commit()

            yield "event: end\ndata: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        print("Stream error:", e)
        raise HTTPException(status_code=500, detail=str(e))