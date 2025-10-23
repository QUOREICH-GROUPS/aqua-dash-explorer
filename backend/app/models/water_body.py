"""
Water Body SQLAlchemy Model
"""
from sqlalchemy import Column, String, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry, Geography
import uuid
from app.core.database import Base


class WaterBody(Base):
    """Water body model (lakes, rivers, reservoirs, wetlands)"""

    __tablename__ = "water_bodies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)
    geometry = Column(Geometry('POLYGON', srid=4326))
    centroid = Column(Geography('POINT', srid=4326))
    surface_area_ha = Column(Numeric(10, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    extra_data = Column("metadata", JSONB, default={})

    def __repr__(self):
        return f"<WaterBody {self.name} ({self.type})>"
