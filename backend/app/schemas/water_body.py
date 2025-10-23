"""
Pydantic schemas for Water Body
"""
from pydantic import BaseModel, ConfigDict, Field, field_serializer, model_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from app.core.utils import geography_to_geojson


class WaterBodyBase(BaseModel):
    """Base schema for water body"""
    name: str = Field(..., min_length=1, max_length=255)
    region: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., pattern="^(lake|river|reservoir|wetland)$")
    surface_area_ha: Optional[float] = Field(None, ge=0)


class WaterBodyCreate(WaterBodyBase):
    """Schema for creating water body"""
    geometry: Optional[Dict[str, Any]] = None
    extra_data: Optional[Dict[str, Any]] = Field(default_factory=dict, alias="metadata")


class WaterBodyUpdate(BaseModel):
    """Schema for updating water body"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    region: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, pattern="^(lake|river|reservoir|wetland)$")
    surface_area_ha: Optional[float] = Field(None, ge=0)
    extra_data: Optional[Dict[str, Any]] = Field(None, alias="metadata")


class WaterBody(WaterBodyBase):
    """Schema for water body response"""
    id: UUID
    centroid: Optional[Any] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @model_validator(mode='before')
    @classmethod
    def extract_extra_data(cls, data: Any) -> Any:
        """Extract extra_data as metadata before validation"""
        if hasattr(data, 'extra_data'):
            # This is a SQLAlchemy model object
            return {
                'id': data.id,
                'name': data.name,
                'region': data.region,
                'type': data.type,
                'surface_area_ha': data.surface_area_ha,
                'centroid': data.centroid,
                'metadata': data.extra_data if isinstance(data.extra_data, dict) else {},
                'created_at': data.created_at,
                'updated_at': data.updated_at,
            }
        return data

    @field_serializer('centroid')
    def serialize_centroid(self, centroid: Any, _info):
        """Convert PostGIS geography to GeoJSON"""
        return geography_to_geojson(centroid)


class WaterBodyList(BaseModel):
    """Schema for paginated water body list"""
    total: int = Field(..., ge=0)
    items: List[WaterBody] = Field(default_factory=list)


class WaterBodyWithStats(WaterBody):
    """Water body with additional statistics"""
    last_measurement_date: Optional[datetime] = None
    last_ndwi: Optional[float] = None
    last_measured_surface: Optional[float] = None
    total_measurements: Optional[int] = None
    avg_surface_area: Optional[float] = None
    surface_trend: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
