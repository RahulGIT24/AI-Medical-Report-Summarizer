from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from sqlalchemy import Integer,String, DateTime,ForeignKey
from datetime import datetime

class ChatSession(Base):
    __tablename__ = "chat_session"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title:Mapped[str] = mapped_column(String,nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    timestamp:Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    chats = relationship("Chat", back_populates="chat_session", cascade="all, delete-orphan")
    patient: Mapped["Patient"] = relationship(back_populates="chat_session")

    @classmethod
    def get_by_user_id(cls, db: Session, patient_id: int, page: int):
        limit = 10
        offset = (page - 1) * limit

        sessions = (
            db.query(cls)
            .filter(cls.patient_id == patient_id)
            .order_by(cls.timestamp.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        if not sessions:
            return []

        readable_list = [
            {c.name: getattr(session, c.name) for c in cls.__table__.columns}
            for session in sessions
        ]

        return readable_list

    @classmethod
    def delete(cls,db: Session, id: int, patient_id:int):
        res = (db.query(cls).filter(cls.id == id,cls.patient_id==patient_id).first())
        if not res:
            return None
        db.delete(res)
        db.commit()
        return True