from fastapi import Cookie, HTTPException
import jwt
from app.db import SessionLocal
from app.models import User
from app.lib import SECRET
from fastapi.responses import JSONResponse

def get_current_user(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(access_token, SECRET, algorithms=['HS256'])
        email = payload.get("email")
        if not email:
            response = JSONResponse(
            status_code=403,
            content={"message": "Invalid token payload"}
            )
            response.delete_cookie(
                key="access_token",
                httponly=True,
                secure=True,
                samesite="none"
            )
            response.delete_cookie(
                key="refresh_token",
                httponly=True,
                secure=True,
                samesite="none"
            )
            return response

        with SessionLocal() as db:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise HTTPException(status_code=403, detail="User not found")
            data = {
                'id':user.id,
                'email':email,
                'fname':user.first_name,
                'lname':user.last_name,
                'phonenumber':user.phone_number,
            }
            return data
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        response = JSONResponse(
            status_code=403,
            content={"message": "Invalid token"}
            )
        response.delete_cookie(
                key="access_token",
                httponly=True,
                secure=True,
                samesite="none"
            )
        response.delete_cookie(
                key="refresh_token",
                httponly=True,
                secure=True,
                samesite="none"
        )
        return response