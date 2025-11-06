from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from datetime import datetime
from typing import List

from sqlalchemy import DateTime, func, ForeignKey,Integer, String, Boolean, Text

class Reports(Base):
    __tablename__="reports"

    id:Mapped[int]=mapped_column(Integer, primary_key=True)
    owner:Mapped[int]=mapped_column(ForeignKey("users.id"))

    # checks/status
    data_extracted:Mapped[bool]=mapped_column(Boolean, default=0)
    enqueued:Mapped[bool]=mapped_column(Boolean, default=0)
    error:Mapped[bool]=mapped_column(Boolean, default=0)
    errormsg:Mapped[str]=mapped_column(Text, default="")
    deleted:Mapped[bool]=mapped_column(Boolean,default=False)

    created_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    updated_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    user:Mapped["User"] = relationship(back_populates="reports")
    reports_data: Mapped[List["ReportsData"]] = relationship(back_populates="report",cascade="all, delete-orphan")
    report_metadata:Mapped["ReportMetaData"] = relationship(back_populates="report",cascade="all, delete-orphan")
    test_results: Mapped[list["TestResults"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    specimen_validity: Mapped["SpecimenValidity"] = relationship(back_populates="report", uselist=False, cascade="all, delete-orphan")
    reports_media: Mapped[list["ReportsMedia"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    screening_tests: Mapped[list["ScreeningTests"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    confirmation_tests: Mapped[list["ConfirmationTests"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    medications: Mapped[list["ReportedMedications"]] = relationship(back_populates="report", cascade="all, delete-orphan")

    @classmethod
    def bulk_create(
        cls, db: Session, owner_id: int
    ) -> List["Reports"]:
        """Insert multiple reports in one go"""
        report_objects = [
            cls(url=url, owner=owner_id)
            for url in urls
        ]
        db.bulk_save_objects(report_objects)
        db.commit()
        return report_objects

    @classmethod
    def get_report(cls,db:Session,id:int):
        report = db.query(cls).filter(cls.id == id,cls.deleted==False).first()
        if not report:
            return None
        if report.error or report.data_extracted:
            return None
        return report

    @classmethod
    def mark_error(cls,db:Session,id:int,errormsg:str):
        report = db.query(cls).filter(cls.id == id,cls.deleted==False).first()
        if report:
            report.error = 1
            report.enqueued = 0
            report.errormsg = errormsg
            report.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(report)
        return report

    @classmethod
    def delete(cls, db: Session, id: int, user_id: int):
        report = db.query(cls).filter(cls.id == id, cls.deleted == False).first()
        if report:
            report.deleted = True
            db.commit()
            db.refresh(report)
        return report

    @classmethod
    def mark_completed(cls,db:Session,id:int):
        report = db.query(cls).filter(cls.id == id,cls.deleted==False).first()
        if report:
            report.data_extracted = 1
            report.enqueued = 0
            report.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(report)
        return report