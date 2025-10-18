from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from sqlalchemy import Integer,String, ForeignKey, DateTime
from datetime import datetime

class ReportedMedications(Base):
    __tablename__ = "reported_medications"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False)
    
    medication_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_tested: Mapped[bool] = mapped_column(default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="medications")

    @classmethod
    def create(cls, session: Session, **kwargs):
        """
        Class method to insert a new ReportMetaData record.
        Usage:
            ReportMetaData.create(session, patient_name="John Doe", report_type="Lab", ...)
        """
        data = cls(**kwargs)
        session.add(data)
        session.commit()
        session.refresh(data)
        return data