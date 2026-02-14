from app.db import Base
from sqlalchemy import String, Enum,DateTime, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from datetime import datetime
import enum
from typing import List

class GenderEnum(enum.Enum):
    MALE = "M"
    FEMALE = "F"

class User(Base):
    __tablename__="users"
    id:Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    first_name:Mapped[str] = mapped_column(String(30), nullable=False)
    last_name:Mapped[str] = mapped_column(String(30), nullable=False)
    email:Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    password:Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number:Mapped[str] =  mapped_column(String(10), nullable=False, unique=True)
    is_verified:Mapped[bool] = mapped_column(Boolean, default=False)
    forgot_password_token:Mapped[str] = mapped_column(String(255), default=None, nullable=True)
    verification_token:Mapped[str] = mapped_column(String(255), default=None, nullable=True)
    refresh_token:Mapped[str] = mapped_column(String(255), default=None, nullable=True)
    gender:Mapped[str] = mapped_column(Enum(GenderEnum), nullable=False)

    # reports: Mapped[List["Reports"]] = relationship(back_populates="user",cascade="all, delete-orphan")
    # chat_session: Mapped[List["ChatSession"]] = relationship(back_populates="user",cascade="all, delete-orphan")

    created_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    updated_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)

    @classmethod 
    def verify_user(cls,db:Session,id:int):
        try:
            user = db.query(cls).filter(cls.id == id).first()
            if not user:
                return None

            if user and user.is_verified == False:
                user.is_verified = True
                user.verification_token = None
                db.commit()
                db.refresh(user)
                return user
        except Exception as e:
            db.rollback()
            raise e
    
    @classmethod 
    def set_forgot_password_token(cls,db:Session,token:str,id:int):
        try:
            user = db.query(cls).filter(cls.id == id).first()
            if not user:
                return None

            if user and user.is_verified == True:
                user.forgot_password_token = token
                db.commit()
                db.refresh(user)
                return user
        except Exception as e:
            db.rollback()
            raise e
    
    @classmethod 
    def set_refresh_token(cls,db:Session,refresh_token:str,id:int):
        try:
            user = db.query(cls).filter(cls.id == id).first()
            if not user:
                return None

            if user and user.is_verified == True:
                user.refresh_token = refresh_token
                db.commit()
                db.refresh(user)
                return user
        except Exception as e:
            db.rollback()
            raise e
        
    @classmethod 
    def set_verification_token(cls,db:Session,token:str,id:int):
        try:
            user = db.query(cls).filter(cls.id == id).first()
            if not user:
                return None

            if user and user.is_verified == False:
                user.verification_token = token
                db.commit()
                db.refresh(user)
                return user
        except Exception as e:
            db.rollback()
            raise e

    @classmethod
    def get_by_id(cls, db: Session, id: int,exclude):
        data = db.query(cls).filter(cls.id == id).first()
        if not data:
            return None
        readable_dict = {
            c.name: getattr(data, c.name)
            for c in cls.__table__.columns
            if c.name not in exclude
        }
        return readable_dict