"""
Pydantic schemas for Water Analysis
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class AnalysisParameters(BaseModel):
    """Parameters for water analysis"""
    region: str = "all"
    period: str = "current"
    waterBodyType: str = "all"
    bufferSize: int = Field(default=500, ge=100, le=10000)


class AnalysisRequest(BaseModel):
    """Request schema for water analysis"""
    geometry: Dict[str, Any]
    parameters: AnalysisParameters
    water_body_id: Optional[UUID] = None


class SurfaceInfo(BaseModel):
    """Surface area information"""
    value: float
    unit: str = "ha"
    variation: float


class NDWIInfo(BaseModel):
    """NDWI information"""
    average: float
    trend: str = Field(..., pattern="^(stable|increasing|decreasing)$")


class Anomaly(BaseModel):
    """Anomaly detection result"""
    type: str
    severity: str = Field(..., pattern="^(low|medium|high)$")
    description: str


class ForecastItem(BaseModel):
    """Forecast item"""
    day: int
    predictedSurface: float
    confidence: float = Field(..., ge=0, le=1)


class Alert(BaseModel):
    """Alert information"""
    type: str
    priority: str = Field(..., pattern="^(low|medium|high)$")
    message: str


class AgricultureStats(BaseModel):
    """Agriculture statistics"""
    totalSurface: float
    culturesBreakdown: List[Dict[str, Any]]
    averageYield: float
    totalParcelles: int


class WeatherData(BaseModel):
    """Weather data and forecast"""
    temperature: int
    humidity: int
    precipitation: float
    windSpeed: int
    condition: str
    forecast: List[Dict[str, Any]]


class AnalysisResult(BaseModel):
    """Complete analysis result"""
    id: Optional[UUID] = None
    surface: SurfaceInfo
    ndwi: NDWIInfo
    anomalies: List[Anomaly] = Field(default_factory=list)
    forecast: List[ForecastItem] = Field(default_factory=list)
    alerts: List[Alert] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    agricultureStats: Optional[AgricultureStats] = None
    weatherData: Optional[WeatherData] = None
    processingTime: Optional[int] = None  # milliseconds
    analysisDate: Optional[datetime] = None

    model_config = {"from_attributes": True}
