"""
SQLAlchemy models for database tables
"""
from app.models.water_body import WaterBody
from app.models.water_measurement import WaterMeasurement
from app.models.analysis_result import AnalysisResult
from app.models.agriculture_zone import AgricultureZone

__all__ = [
    "WaterBody",
    "WaterMeasurement",
    "AnalysisResult",
    "AgricultureZone",
]
