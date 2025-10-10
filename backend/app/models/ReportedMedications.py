from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer,String, ForeignKey, DateTime
from datetime import datetime

class ReportedMedications(Base):
    __tablename__ = "reported_medications"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False)
    
    medication_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_tested: Mapped[bool] = mapped_column(default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="medications")