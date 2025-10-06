from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from datetime import datetime
from typing import List

from sqlalchemy import DateTime, func, ForeignKey,Integer, String, Boolean

class Reports(Base):
    __tablename__="reports"

    id:Mapped[int]=mapped_column(Integer, primary_key=True)
    url:Mapped[str]=mapped_column(String(255), nullable=False)
    owner:Mapped[int]=mapped_column(ForeignKey("users.id"))
    report_type:Mapped[str]=mapped_column(String(255), nullable=False)
    data_extracted:Mapped[bool]=mapped_column(Boolean, default=0)
    enqueued:Mapped[bool]=mapped_column(Boolean, default=0)
    error:Mapped[bool]=mapped_column(Boolean, default=0)

    created_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    updated_at: Mapped[datetime] = mapped_column(
    DateTime, default=datetime.utcnow, server_default=func.now()
)
    user:Mapped["User"] = relationship(back_populates="reports")
    reports_data: Mapped[List["ReportsData"]] = relationship(back_populates="report",cascade="all, delete-orphan")

    @classmethod
    def bulk_create(
        cls, db: Session, urls: List[str], owner_id: int, report_type: str
    ) -> List["Reports"]:
        """Insert multiple reports in one go"""
        report_objects = [
            cls(url=url, owner=owner_id, report_type=report_type)
            for url in urls
        ]
        db.bulk_save_objects(report_objects)
        db.commit()
        return report_objects

    @classmethod
    def get_report(cls,db:Session,id:int):
        report = db.query(cls).filter(cls.id == id).first()
        if not report:
            return None
        if report.error or report.data_extracted:
            return None
        return report

    @classmethod
    def mark_error(cls,db:Session,id:int):
        report = db.query(cls).filter(cls.id == id).first()
        if report:
            report.error = 1
            report.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(report)
        return report

    @classmethod
    def mark_completed(cls,db:Session,id:int):
        report = db.query(cls).filter(cls.id == id).first()
        if report:
            report.data_extracted = 1
            report.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(report)
        return report