from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from sqlalchemy import Integer,String, DateTime, Text, ForeignKey
from datetime import datetime

class ReportMetaData(Base):
    __tablename__="report_metadata"

    id:Mapped[int]=mapped_column(Integer, primary_key=True)
    patient_name:Mapped[str]=mapped_column(String,nullable=True)
    report_type:Mapped[str]=mapped_column(String(100), nullable=True)
    accession_number: Mapped[str] = mapped_column(String(100), nullable=True)
    collection_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    received_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    report_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    lab_name: Mapped[str] = mapped_column(String(255), nullable=True)
    lab_director: Mapped[str] = mapped_column(String(255), nullable=True)
    clia_number: Mapped[str] = mapped_column(String(50), nullable=True)
    cap_number: Mapped[str] = mapped_column(String(50), nullable=True)
    sample_type: Mapped[str] = mapped_column(String(100), nullable=True)
    raw_ocr_text: Mapped[str] = mapped_column(Text, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    # 1-1 relation with report
    report_id:Mapped[int]=mapped_column(Integer,ForeignKey("reports.id"))
    report:Mapped["Reports"] = relationship(back_populates="report_metadata")

    @classmethod
    def create(cls, session: Session, **kwargs):
        """
        Class method to insert a new ReportMetaData record.
        Usage:
            ReportMetaData.create(session, patient_name="John Doe", report_type="Lab", ...)
        """
        new_report = cls(**kwargs)
        session.add(new_report)
        session.commit()
        session.refresh(new_report)
        return new_report