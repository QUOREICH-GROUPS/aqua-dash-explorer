"""
API v1 router configuration
"""
from fastapi import APIRouter
from app.api.v1.endpoints import water_bodies, analysis

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    water_bodies.router,
    prefix="/water-bodies",
    tags=["water-bodies"]
)

api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["analysis"]
)
