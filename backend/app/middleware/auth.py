from fastapi import Cookie, HTTPException
import jwt
from app.db import SessionLocal
from app.models import User
from app.lib import SECRET

def get_current_user(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(access_token, SECRET, algorithms=['HS256'])
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=403, detail="Invalid token payload")

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
        raise HTTPException(status_code=401, detail="Invalid token")