from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.schemas import SignupSchema, LoginSchema
from app.db import get_db
from passlib.context import CryptContext
from app.models import User
from app.lib import email_worker
from app.workers import send_email
from app.lib import JWT
from jwt import ExpiredSignatureError, InvalidTokenError
from app.middleware import get_current_user

jwt = JWT()
router=APIRouter(prefix="/auth")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/signup")
def signup(payload: SignupSchema,db: Session = Depends(get_db)):
    try:    

        if len(payload.password.strip()) < 8:
            raise HTTPException(status_code=400,detail="Password Length should me more than 8 characters")

        if payload.gender not in ["MALE", "FEMALE"]:
            raise HTTPException(status_code=400,detail="Invalid Gender")

        existing_user = db.query(User).filter(User.email == payload.email).first()

        if existing_user and existing_user.is_verified == True:
            raise HTTPException(status_code=404,detail="User already exists")
        
        hashed_password = pwd_context.hash(payload.password)
        email=payload.email
        token = jwt.generate_token(email=email,time=15)

        if existing_user and existing_user.is_verified == False:
            existing_user.password = hashed_password
            existing_user.gender = payload.gender
            existing_user.first_name = payload.fname
            existing_user.last_name = payload.lname
            existing_user.phone_number = payload.phonenumber
            existing_user.verification_token = token
            db.commit()
            db.refresh(existing_user)

            email_worker.enqueue(send_email,payload.email,payload.fname ,"VERIFICATION",token)

            return JSONResponse(status_code=200,content={
                "message":"Account not verified. Verification Email Sent"
            })

        new_user = User(
            first_name=payload.fname,
            last_name=payload.lname,
            email=payload.email,
            phone_number=payload.phonenumber,
            password=hashed_password,
            gender=payload.gender,
            verification_token=token
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        email_worker.enqueue(send_email,payload.email,payload.fname,"VERIFICATION",token)

        return JSONResponse(status_code=200,content={
                "message":"Account Created Successfully. Please Verify Your Account."
        })

    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get("/verify-account")
def verify(token:str,db: Session = Depends(get_db)):
    try:
        if not token:
            raise HTTPException(status_code=404,detail="Token not found")
        
        decoded = jwt.decode_token(token=token)
        print(decoded)
        email=decoded["email"]

        existing_user = db.query(User).filter(User.email == email, User.verification_token==token).first()

        if not existing_user:
            raise HTTPException(status_code=404, detail="Invalid Token. User not found")
        
        User.verify_user(db=db, id=existing_user.id)

        return JSONResponse(status_code=200,content={
                "message":"Account Verified. You can Login now"
        })
    except ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token Expired. Please Relogin")
    except InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid Token")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Something went wrong")



@router.post("/signin")
def signin(payload: LoginSchema,db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == payload.email).first()
        if not existing_user:
                raise HTTPException(status_code=404, detail="Invalid credentials")

        if existing_user and not existing_user.is_verified:
            token = jwt.generate_token(existing_user.email, time=15)
            hashed_password = pwd_context.hash(payload.password)
            existing_user.verification_token = token
            existing_user.password = hashed_password
            email_worker.enqueue(send_email,payload.email,existing_user.first_name,"VERIFICATION",token)
            db.commit()
            db.refresh(existing_user)
            return JSONResponse(
                    status_code=200,
                    content={"message": "Account not verified. Verification email sent"}
            )

        if not pwd_context.verify(payload.password, existing_user.password):
                raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token = jwt.generate_token(existing_user.email, time=1440) 
        refresh_token = jwt.generate_token(existing_user.email, time=1440*3)

        existing_user.refresh_token = refresh_token
        db.commit()
        db.refresh(existing_user)

        response = JSONResponse(
                status_code=200,
                content={
                    "message": "Login successful",
                    "user": {
                        "id": existing_user.id,
                        "email": existing_user.email,
                        "first_name": existing_user.first_name,
                        "last_name": existing_user.last_name,
                        "phone_number": existing_user.phone_number,
                    }
                }
            )
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=True,
            max_age=60 * 60 * 24,
            expires=60 * 60 * 24
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=True,
            max_age=60 * 60 * 72,
            expires=60 * 60 * 72
        )
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.get("/get-user")
def get_user(user=Depends(get_current_user)):
    try:
        return JSONResponse(status_code=200,content=user)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.get("/signout")
def signout(user=Depends(get_current_user),db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.id == user['id']).first()

        if existing_user:
            existing_user.refresh_token = None
            db.commit()

        response = JSONResponse(
            status_code=200,
            content={"message": "Logged out successfully"}
        )
        response.delete_cookie(
            key="access_token",
            httponly=True,
            secure=True,
            samesite="strict"
        )
        response.delete_cookie(
            key="refresh_token",
            httponly=True,
            secure=True,
            samesite="strict"
        )
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Something went wrong")