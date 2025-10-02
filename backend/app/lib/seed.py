from sqlalchemy.orm import Session
from app.db import engine
from app.models import User
from app.models.User import GenderEnum

users_to_insert = [
    User(first_name="Rahul",last_name="Gupta",email="rg4005450@gmail.com",password="98903824noh9230jbf29487203y",phone_number="6230822583",gender=GenderEnum.MALE)
]

def seed_in():
    with Session(engine) as session:
        try:
            session.add_all(users_to_insert)
            session.commit()
        except:
            print("User Already exist")