from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship,Session
from sqlalchemy import Integer,String, ForeignKey, Enum, DateTime
from datetime import datetime

class ScreeningTests(Base):
    __tablename__ = "screening_tests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id",ondelete="CASCADE"), nullable=False)
    
    test_name: Mapped[str] = mapped_column(String(255), nullable=True)
    outcome: Mapped[str] = mapped_column(String(255), nullable=True)
    result_value: Mapped[str] = mapped_column(String(100), nullable=True)
    cutoff_value: Mapped[str] = mapped_column(String(50), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    report: Mapped["Reports"] = relationship(back_populates="screening_tests")

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
        clean_dict = {
            k: v for k, v in report_dict.items()
            if k not in {"id", "report_id"} and v is not None
        }
        return clean_dict,data.id

    @classmethod
    def get_by_id(cls, db: Session, id: int):
        exclude = [
            "id","report_id"
        ]
        data = db.query(cls).filter(cls.id == id).first()
        if not data:
            return None
        readable_dict = {
            c.name: getattr(data, c.name)
            for c in cls.__table__.columns
            if c.name not in exclude
        }
        return readable_dict