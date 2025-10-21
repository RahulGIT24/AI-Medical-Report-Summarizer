from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer,String, ForeignKey,Float
from sqlalchemy.orm import Session

class SpecimenValidity(Base):
    __tablename__ = "specimen_validity"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False)
    
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