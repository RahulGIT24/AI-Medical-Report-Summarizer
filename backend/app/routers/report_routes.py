from fastapi import APIRouter, File, UploadFile, HTTPException,Depends
from fastapi.responses import JSONResponse,StreamingResponse,HTMLResponse
import shutil
from app.lib import BASE_URL
import uuid
from app.middleware import get_current_user
from pydantic import BaseModel
from app.db import SessionLocal
from app.models import Reports,SpecimenValidity,ReportMetaData,TestResults,ScreeningTests,ConfirmationTests,ReportedMedications,ReportsMedia, Chat,AISummary
from app.lib import client,get_query_prompt,summarization_prompt
from app.ocr import llm_class
from app.schemas import ReportResponse
import json
import markdown
from sqlalchemy.orm import joinedload
from toon_python import encode

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

    global previous_chats

    try:
        with SessionLocal() as db:
            previous_chats = Chat.get_chats_for_context(limit=6,db=db,session_id=session_id)
            user_c = Chat(
                session=session_id,
                content=query,
                role="user",
            )
            db.add(user_c)
            db.commit()

        points = client.similarity_search_collection1(query_str=query,top_k=10,user_id=1)
        context = []
        response_buffer = []

        if points is not None:
            payloads = [p.payload for p in points]
            for data in payloads:
                with SessionLocal() as db:
                    context.append(MAPPINGS.get(data.get("collection_name")).get_by_id(db=db,id=data.get("collection_id")))

        llm_instance = llm_class(prompt=get_query_prompt(), report_data=None)
        def generate():
            for token in llm_instance.call_llm_stream(query, q_context=encode(context),prev_context=encode(previous_chats)):
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

@router.delete("/{report_id}")
async def delete_report(report_id:str,user=Depends(get_current_user)):
    try:
        with SessionLocal() as db:
            deleted = Reports.delete(db=db,id=report_id,user_id=user["id"])
            if deleted:
                return JSONResponse(status_code=200,content={"message":"Report Deleted Successfully"})
        return HTTPException(status_code=400, detail="Invalid Report Id")
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error Occured while deleting report", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/{report_id}", response_model=ReportResponse,response_model_exclude_none=True)
async def get_report(report_id: int, user=Depends(get_current_user)):
    try:
        with SessionLocal() as db:
            report = (
                db.query(Reports)
                .options(
                    joinedload(Reports.report_metadata),
                    joinedload(Reports.test_results),
                    joinedload(Reports.specimen_validity),
                    joinedload(Reports.reports_media),
                    joinedload(Reports.screening_tests),
                    joinedload(Reports.confirmation_tests),
                    joinedload(Reports.medications),
                )
                .filter(
                    Reports.id == report_id,
                    Reports.deleted == False,
                    Reports.owner == user["id"]
                )
                .first()
            )

        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        return report
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error Occured while deleting report", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/summarise/{report_id}")
async def summarise_report(report_id:int, user=Depends(get_current_user)):
    try:
        report = None
        with SessionLocal() as db:
            report = (db.query(Reports).filter(Reports.id == report_id, Reports.owner == user["id"]).first())
        
        if not report:
            raise HTTPException(status_code=404,detail="Report not found")
        if report:
            report_metadata = (db.query(ReportMetaData).filter(ReportMetaData.report_id == report_id).first())
        if not report_metadata or not report_metadata.raw_ocr_text:
            raise HTTPException(status_code=404,detail="Nothing to summarize")

        with SessionLocal() as db:
            result_set = (db.query(AISummary).filter(AISummary.report_id == report.id).first())
        if result_set and result_set.summary:
            raise HTTPException(status_code=400,detail="Already Summarised")

        llm_instance = llm_class(prompt=summarization_prompt(), raw_ocr_text=report_metadata.raw_ocr_text)
        response=llm_instance.call_llm()
        with SessionLocal() as db:
            summarised = AISummary(summary=response,report_id=report.id)
            db.add(summarised)
            db.commit()
            db.flush()
        return JSONResponse(content={'summary':response})
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error Occured while fetching report", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/aisummary/{report_id}")
async def summarise_report(report_id:int, user=Depends(get_current_user)):
    try:
        report = None
        with SessionLocal() as db:
            report = (db.query(Reports).filter(Reports.id == report_id, Reports.owner == user["id"]).first())
        
        if not report:
            raise HTTPException(status_code=404,detail="Report not found")
        with SessionLocal() as db:
            result_set = (db.query(AISummary).filter(AISummary.report_id == report_id).first())
        
        if not result_set:
            raise HTTPException(status_code=404,detail="Summary Not Found")
        
        return JSONResponse(content={'aisummary':result_set.summary})

    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error Occured while fetching report", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")