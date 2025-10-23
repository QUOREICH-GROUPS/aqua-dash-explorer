"""
Agriculture Zone SQLAlchemy Model
"""
from sqlalchemy import Column, String, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
import uuid
from app.core.database import Base


class AgricultureZone(Base):
    """Agricultural zones with crop information"""

    __tablename__ = "agriculture_zones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255))
    region = Column(String(100), nullable=False, index=True)
    crop_type = Column(String(100), nullable=False, index=True)
    geometry = Column(Geometry('POLYGON', srid=4326), nullable=False)
    surface_ha = Column(Numeric(10, 2))
    average_yield = Column(Numeric(6, 2))
    irrigation_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    def __repr__(self):
        return f"<AgricultureZone {self.name} - {self.crop_type}>"
