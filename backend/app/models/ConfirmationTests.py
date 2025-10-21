from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from sqlalchemy import Integer,String, ForeignKey, Enum, DateTime,Float
from datetime import datetime

class ConfirmationTests(Base):
    __tablename__ = "confirmation_tests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=True)
    
    test_name: Mapped[str] = mapped_column(String(255), nullable=True)
    method: Mapped[str] = mapped_column(String(100), nullable=True)  # "LC-MS/MS", "GC-MS", etc.
    outcome: Mapped[str] = mapped_column(String(255), nullable=True)
    
    result_value: Mapped[str] = mapped_column(String(100), nullable=True)
    result_numeric: Mapped[float] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=True)
    
    cutoff_value: Mapped[str] = mapped_column(String(50), nullable=True)
    detection_window: Mapped[str] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="confirmation_tests")

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
        report_dict = {**kwargs}

        # Drop 'id' and any None values
        clean_dict = {k: v for k, v in report_dict.items() if (k != "id" or k!="report_id") and v is not None}

        return clean_dict,data.id