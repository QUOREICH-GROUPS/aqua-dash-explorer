"""
Application configuration using Pydantic settings
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings and configuration"""

    # API Settings
    PROJECT_NAME: str = "SmartWaterWatch API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/smartwaterwatch"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
    ]

    # External APIs
    OPEN_METEO_API_URL: str = "https://api.open-meteo.com/v1/forecast"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 100
    MAX_PAGE_SIZE: int = 1000

    # ML Models
    MODELS_PATH: str = "ai_pipeline/models"
    ML_CONFIDENCE_THRESHOLD: float = 0.7

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
