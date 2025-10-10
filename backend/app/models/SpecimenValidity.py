from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer,String, ForeignKey,Float

class SpecimenValidity(Base):
    __tablename__ = "specimen_validity"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False, unique=True)
    
    # Validity parameters
    specific_gravity: Mapped[float] = mapped_column(Float, nullable=True)
    specific_gravity_status: Mapped[str] = mapped_column(String(20), nullable=True)
    
    ph_level: Mapped[float] = mapped_column(Float, nullable=True)
    ph_status: Mapped[str] = mapped_column(String(20), nullable=True)
    
    creatinine: Mapped[float] = mapped_column(Float, nullable=True)
    creatinine_unit: Mapped[str] = mapped_column(String(20), nullable=True)
    creatinine_status: Mapped[str] = mapped_column(String(20), nullable=True)
    
    oxidants: Mapped[str] = mapped_column(String(50), nullable=True)
    oxidants_status: Mapped[str] = mapped_column(String(20), nullable=True)
    
    # Overall validity
    is_valid: Mapped[bool] = mapped_column(default=True)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="specimen_validity")
