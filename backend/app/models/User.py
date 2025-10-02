from app.db import Base
from sqlalchemy import String, Enum,DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
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
    gender:Mapped[str] = mapped_column(Enum(GenderEnum), nullable=False)
    reports: Mapped[List["Reports"]] = relationship(back_populates="user",cascade="all, delete-orphan")
    created_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    updated_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)