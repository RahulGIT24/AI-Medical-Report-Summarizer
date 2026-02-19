from fastapi import APIRouter, HTTPException,Query,Depends
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from app.db import get_db
from app.middleware import get_current_user
from app.db import SessionLocal
from app.models import Chat,Reports,Patient
from app.lib import client,get_query_prompt
from app.ocr import llm_class
import json

db=SessionLocal()

router=APIRouter(prefix="/chat")

# @router.post("/session")
# async def create_session(payload:Session,user=Depends(get_current_user),db: Session = Depends(get_db)):
#     try:
#         user_id=user["id"]
#         chat_session=ChatSession(
#             user_id=user_id,
#             title=payload.name
#         )
#         db.add(chat_session)
#         db.commit()
#         db.refresh(chat_session)

#         return JSONResponse(status_code=201,content={
#             "title":chat_session.title,
#             "id":chat_session.id
#         })
#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         db.rollback()
#         print("Error occured while creating session ",e)
#         raise HTTPException(status_code=500,detail="Internal Server Error")

# @router.get("/session")
# async def fetch_sessions(page:int=1,user=Depends(get_current_user),db: Session = Depends(get_db)):
#     try:
#         user_id=user["id"]
#         chat_sessions=ChatSession.get_by_user_id(
#             user_id=user_id,
#             db=db,
#             page=page
#         )

#         return {"sessions": chat_sessions}

#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         print("Error occured while creating session ",e)
#         raise HTTPException(status_code=500,detail="Internal Server Error")
    
# @router.delete("/session")
# async def delete_session(id:int,user=Depends(get_current_user),db: Session = Depends(get_db)):
#     try:
#         user_id=user["id"]
#         deleted = ChatSession.delete(
#             user_id=user_id,
#             db=db,
#             id=id,
#         )
#         if deleted==None:
#             return HTTPException(status_code=404,detail="Session not found")
#         return {"message": "Session Deleted"}

#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         print("Error occured while creating session ",e)
#         raise HTTPException(status_code=500,detail="Internal Server Error")

# @router.get("/chats")
# async def fetch_chats(session_id:int,user=Depends(get_current_user),db: Session = Depends(get_db)):
#     try:
#         chats=Chat.get_chats(db=db,session_id=session_id)
#         return {"chats": chats}
#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         print("Error occured while creating session ",e)
#         raise HTTPException(status_code=500,detail="Internal Server Error")

@router.post('/ask')
def query_report_with_ai(patient_id:int,report_id:int,user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
      patient = db.query(Patient).filter(Patient.id==patient_id,Patient.creator_id==user['id']).first()
      if patient is None:
          raise HTTPException(status_code=404,detail='Patient Not found')

      report = db.query(Reports).filter(Reports.id==report_id,Reports.patient_id==patient_id).first()
      if report is None:
          raise HTTPException(status_code=404,detail="Report not found")
      
      
    except HTTPException as e:
         raise e
    except Exception as e:
         print("Error occured while creating session ",e)
         raise HTTPException(status_code=500,detail="Internal Server Error")