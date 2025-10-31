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