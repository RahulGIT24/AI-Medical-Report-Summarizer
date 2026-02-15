from app.db import Base
from sqlalchemy import String, Enum,DateTime, func, Date,ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from datetime import datetime,date
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
    gender:Mapped[str] = mapped_column(Enum(GenderEnum), nullable=False)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    dob: Mapped[date] = mapped_column(Date, nullable=False)
    reports: Mapped[List["Reports"]] = relationship(back_populates="patient",cascade="all, delete-orphan")
    chat_session: Mapped[List["ChatSession"]] = relationship(back_populates="patient",cascade="all, delete-orphan")
    creator: Mapped["User"] = relationship("User", foreign_keys=[creator_id])

    created_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    updated_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    
    @classmethod
    def get_by_id_and_creator(cls, db: Session, patient_id: int, creator_id: int):
        """
        Fetches a patient by their ID, ensuring the creator_id matches.
        Returns the Patient object if found, otherwise returns None.
        """
        return db.query(cls).filter(
            cls.id == patient_id, 
            cls.creator_id == creator_id
        ).first()