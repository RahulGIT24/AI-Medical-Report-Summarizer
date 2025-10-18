from app.db import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import Integer, String, ForeignKey

class ReportsData(Base):
    __tablename__="reports_data"

    id:Mapped[int]=mapped_column(Integer, primary_key=True)
    raw_name:Mapped[str]=mapped_column(String(255), nullable=True)
    mapped_name:Mapped[str]=mapped_column(String(255), nullable=True)
    field_value:Mapped[str]=mapped_column(String(50), nullable=True)
    status:Mapped[bool]
    unit_value:Mapped[str]=mapped_column(String(50), nullable=True)
    
    report_id:Mapped[int]=mapped_column(ForeignKey("reports.id"))
    report:Mapped["Reports"] = relationship(back_populates="reports_data")