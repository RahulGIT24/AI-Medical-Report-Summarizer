from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer,String, ForeignKey, Enum, DateTime
from datetime import datetime
from app.schemas import TestOutcome

class ScreeningTests(Base):
    __tablename__ = "screening_tests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False)
    
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    outcome: Mapped[TestOutcome] = mapped_column(Enum(TestOutcome), nullable=False)
    result_value: Mapped[str] = mapped_column(String(100), nullable=True)
    cutoff_value: Mapped[str] = mapped_column(String(50), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="screening_tests")
