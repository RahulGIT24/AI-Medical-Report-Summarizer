from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from sqlalchemy import Integer,String, ForeignKey, DateTime
from datetime import datetime

class Chat(Base):
    __tablename__ = "chat"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role:Mapped[str] = mapped_column(String,nullable=False)
    content:Mapped[str] = mapped_column(String,nullable=False)
    session: Mapped[int] = mapped_column(ForeignKey("chat_session.id"), nullable=True)
    timestamp:Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    chat_session = relationship("ChatSession", back_populates="chats")

    @classmethod
    def get_chats(cls, db: Session, session_id: int):
            chats = (
                db.query(cls)
                .filter(cls.session == session_id)
                .order_by(cls.timestamp.asc())
                .all()
            )

            if not chats:
                return []

            readable_list = [
                {c.name: getattr(session, c.name) for c in cls.__table__.columns}
                for session in chats
            ]

            return readable_list

    @classmethod
    def get_chats_for_context(cls, db: Session, session_id: int, limit:int):
            chats = (
                db.query(cls)
                .filter(cls.session == session_id)
                .order_by(cls.timestamp.desc())
                .limit(limit)
                .all()
            )

            if not chats:
                return []

            readable_list = [
                {c.name: getattr(session, c.name) for c in cls.__table__.columns}
                for session in chats
            ]

            return readable_list