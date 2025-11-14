from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from sqlalchemy import Integer,String, ForeignKey, DateTime
from datetime import datetime

class AISummary(Base):
    __tablename__ = "aisummary"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    summary:Mapped[str] = mapped_column(String,nullable=False)
    timestamp:Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    report_id:Mapped[int]=mapped_column(Integer,ForeignKey("reports.id",ondelete="CASCADE"),unique=True)
    report:Mapped["Reports"] = relationship(back_populates="aisummary")