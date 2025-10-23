"""
Water Measurement SQLAlchemy Model
"""
from sqlalchemy import Column, String, Numeric, DateTime, Date, ForeignKey, func, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base


class WaterMeasurement(Base):
    """Time series measurements for water bodies"""

    __tablename__ = "water_measurements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    water_body_id = Column(
        UUID(as_uuid=True),
        ForeignKey("water_bodies.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    measurement_date = Column(Date, nullable=False, index=True)
    surface_area_ha = Column(Numeric(10, 2))
    ndwi_average = Column(Numeric(5, 3))
    ndwi_min = Column(Numeric(5, 3))
    ndwi_max = Column(Numeric(5, 3))
    water_level_m = Column(Numeric(6, 2))
    temperature_c = Column(Numeric(4, 1))
    turbidity_ntu = Column(Numeric(6, 2))
    source = Column(String(50), default="manual")
    satellite_image_url = Column(String)
    confidence_score = Column(Numeric(3, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WaterMeasurement {self.measurement_date} for {self.water_body_id}>"
