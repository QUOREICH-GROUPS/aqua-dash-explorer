"""
FastAPI Main Application
SmartWaterWatch API - Water Resources Monitoring
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API for water resources monitoring and AI analysis in Burkina Faso",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Root endpoint - API information"""
    return {
        "message": "SmartWaterWatch API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "api": settings.API_V1_STR,
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
    }


@app.get(f"{settings.API_V1_STR}/info")
def api_info():
    """API information and available endpoints"""
    return {
        "version": settings.VERSION,
        "endpoints": {
            "water_bodies": f"{settings.API_V1_STR}/water-bodies",
            "health": "/health",
            "docs": "/docs",
        },
        "features": [
            "Water body management",
            "Time series measurements",
            "AI-powered analysis",
            "Geospatial queries",
            "Agriculture zone integration",
            "Weather data integration",
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
