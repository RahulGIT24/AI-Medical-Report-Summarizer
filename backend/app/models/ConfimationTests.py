from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer,String, ForeignKey, Enum, DateTime,Float
from datetime import datetime
from app.schemas import TestOutcome

class ConfirmationTests(Base):
    __tablename__ = "confirmation_tests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False)
    
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    method: Mapped[str] = mapped_column(String(100), nullable=True)  # "LC-MS/MS", "GC-MS", etc.
    outcome: Mapped[TestOutcome] = mapped_column(Enum(TestOutcome), nullable=False)
    
    result_value: Mapped[str] = mapped_column(String(100), nullable=True)
    result_numeric: Mapped[float] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=True)
    
    cutoff_value: Mapped[str] = mapped_column(String(50), nullable=True)
    detection_window: Mapped[str] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="confirmation_tests")