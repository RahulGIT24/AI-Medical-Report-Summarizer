from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from sqlalchemy import Integer,String, DateTime, Text, ForeignKey, Enum,Float
from datetime import datetime

class TestResults(Base):
    __tablename__ = "test_results"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False)
    
    # Test identification
    test_name: Mapped[str] = mapped_column(String(255), nullable=True)
    test_category: Mapped[str] = mapped_column(String(100), nullable=True)  # "Opiates", "Barbiturates", etc.
    
    # Test outcome and results
    outcome: Mapped[str] = mapped_column(String(255), nullable=True)
    result_value: Mapped[str] = mapped_column(String(100), nullable=True)
    result_numeric: Mapped[float] = mapped_column(Float, nullable=True)  # For numeric values
    unit: Mapped[str] = mapped_column(String(50), nullable=True)
    
    # Reference values
    cutoff_value: Mapped[str] = mapped_column(String(50), nullable=True)
    reference_range: Mapped[str] = mapped_column(String(100), nullable=True)
    detection_window: Mapped[str] = mapped_column(String(100), nullable=True)
    
    # Flags
    is_abnormal: Mapped[bool] = mapped_column(default=True)
    is_critical: Mapped[bool] = mapped_column(default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="test_results")

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
        report_dict = {c.key: getattr(data, c.key) for c in cls.__table__.columns}

        # Drop 'id' and any None values
        clean_dict = {k: v for k, v in report_dict.items() if (k != "id" or k!="report_id") and v is not None}
        return clean_dict,data.id