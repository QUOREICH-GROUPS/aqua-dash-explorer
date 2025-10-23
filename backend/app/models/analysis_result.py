"""
Analysis Result SQLAlchemy Model
"""
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, func, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry
import uuid
from app.core.database import Base


class AnalysisResult(Base):
    """AI analysis results for water bodies"""

    __tablename__ = "analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    water_body_id = Column(
        UUID(as_uuid=True),
        ForeignKey("water_bodies.id"),
        index=True
    )
    user_drawn_geometry = Column(Geometry('GEOMETRY', srid=4326))
    analysis_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True
    )
    surface_value = Column(Numeric(10, 2))
    surface_unit = Column(String(10), default='ha')
    surface_variation = Column(Numeric(5, 2))
    ndwi_average = Column(Numeric(5, 3))
    ndwi_trend = Column(String(20))
    model_version = Column(String(50), default='v1.0')
    processing_time_ms = Column(Integer)
    anomalies = Column(JSONB, default=[])
    forecast = Column(JSONB, default=[])
    alerts = Column(JSONB, default=[])
    suggestions = Column(JSONB, default=[])
    agriculture_stats = Column(JSONB)
    weather_data = Column(JSONB)
    extra_data = Column("metadata", JSONB, default={})

    def __repr__(self):
        return f"<AnalysisResult {self.id} at {self.analysis_date}>"
