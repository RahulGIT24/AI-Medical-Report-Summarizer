from fastapi import APIRouter, File, UploadFile, HTTPException,Query,Depends
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from app.db import get_db
from app.middleware import get_current_user
from app.db import SessionLocal
from app.models import ChatSession
from app.lib import client,get_query_prompt
from app.ocr import llm_class
import json
from app.schemas import Session

db=SessionLocal()

router=APIRouter(prefix="/chat")

@router.post("/session")
async def create_session(payload:Session,user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        user_id=user["id"]
        chat_session=ChatSession(
            user_id=user_id,
            title=payload.name
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

        return JSONResponse(status_code=201,content={
            "title":chat_session.title,
            "id":chat_session.id
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print("Error occured while creating session ",e)
        raise HTTPException(status_code=500,detail="Internal Server Error")

@router.get("/session")
async def fetch_sessions(page:int=1,user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        user_id=user["id"]
        chat_sessions=ChatSession.get_by_user_id(
            user_id=user_id,
            db=db,
            page=page
        )

        return {"sessions": chat_sessions}

    except HTTPException as e:
        raise e
    except Exception as e:
        print("Error occured while creating session ",e)
        raise HTTPException(status_code=500,detail="Internal Server Error")

# @router.get("/chats")