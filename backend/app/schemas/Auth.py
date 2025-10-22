from pydantic import BaseModel,EmailStr

class SignupSchema(BaseModel):
    fname: str
    lname: str
    email: EmailStr
    phonenumber: str
    password: str
    gender: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str