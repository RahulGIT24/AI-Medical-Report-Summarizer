from app.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Dict, Any
from sqlalchemy import Integer,String, ForeignKey
from typing import List, Dict, Any
from sqlalchemy.orm import Session

class ReportsMedia(Base):
    __tablename__ = "reports_media"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id",ondelete="CASCADE"), nullable=False)
    url:Mapped[str] = mapped_column(String,nullable=False)
    report: Mapped["Reports"] = relationship(back_populates="reports_media")

    def to_dict(self, include_report: bool = False) -> Dict[str, Any]:
        """Convert ReportsMedia object to a JSON-serializable dict."""
        data = {
            "id": self.id,
            "report_id": self.report_id,
            "url": self.url,
        }

        return data
    
    @classmethod
    def bulk_create(cls, db: Session, report_id: int, urls: List[str]) -> List[Dict[str, Any]]:
        """
        Bulk insert multiple media URLs for a single report.
        Returns list of dicts of inserted objects.
        """
        media_objects = [cls(report_id=report_id, url=url) for url in urls]

        # Use add_all to keep it simple and populate IDs
        db.add_all(media_objects)
        db.commit()
        db.refresh_all(media_objects) if hasattr(db, "refresh_all") else None  # optional

        # Return as JSON-serializable dicts
        return [m.to_dict() for m in media_objects]