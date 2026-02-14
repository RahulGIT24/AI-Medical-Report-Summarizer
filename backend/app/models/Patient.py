from app.db import Base
from sqlalchemy import String, Enum,DateTime, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from datetime import datetime
import enum
from typing import List

class GenderEnum(enum.Enum):
    MALE = "M"
    FEMALE = "F"

class Patient(Base):
    __tablename__="patients"
    id:Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    first_name:Mapped[str] = mapped_column(String(30), nullable=False)
    last_name:Mapped[str] = mapped_column(String(30), nullable=False)
    email:Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    gender:Mapped[str] = mapped_column(Enum(GenderEnum), nullable=False)

    reports: Mapped[List["Reports"]] = relationship(back_populates="patient",cascade="all, delete-orphan")
    chat_session: Mapped[List["ChatSession"]] = relationship(back_populates="patient",cascade="all, delete-orphan")

    created_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    updated_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)