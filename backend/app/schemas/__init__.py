"""
Pydantic schemas for request/response validation
"""
from app.schemas.water_body import (
    WaterBodyBase,
    WaterBodyCreate,
    WaterBodyUpdate,
    WaterBody,
    WaterBodyList,
)
from app.schemas.water_measurement import (
    WaterMeasurementBase,
    WaterMeasurementCreate,
    WaterMeasurement,
)
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResult,
)

__all__ = [
    "WaterBodyBase",
    "WaterBodyCreate",
    "WaterBodyUpdate",
    "WaterBody",
    "WaterBodyList",
    "WaterMeasurementBase",
    "WaterMeasurementCreate",
    "WaterMeasurement",
    "AnalysisRequest",
    "AnalysisResult",
]
