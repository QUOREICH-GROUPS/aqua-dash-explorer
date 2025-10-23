"""
Pydantic schemas for Water Measurement
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


class WaterMeasurementBase(BaseModel):
    """Base schema for water measurement"""
    measurement_date: date
    surface_area_ha: Optional[float] = Field(None, ge=0)
    ndwi_average: Optional[float] = Field(None, ge=-1, le=1)
    ndwi_min: Optional[float] = Field(None, ge=-1, le=1)
    ndwi_max: Optional[float] = Field(None, ge=-1, le=1)
    water_level_m: Optional[float] = Field(None, ge=0)
    temperature_c: Optional[float] = None
    turbidity_ntu: Optional[float] = Field(None, ge=0)


class WaterMeasurementCreate(WaterMeasurementBase):
    """Schema for creating water measurement"""
    water_body_id: UUID
    source: str = Field(default="manual", max_length=50)
    satellite_image_url: Optional[str] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=1)


class WaterMeasurement(WaterMeasurementBase):
    """Schema for water measurement response"""
    id: UUID
    water_body_id: UUID
    source: str
    satellite_image_url: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WaterMeasurementList(BaseModel):
    """Schema for paginated measurement list"""
    total: int = Field(..., ge=0)
    items: List[WaterMeasurement] = Field(default_factory=list)
